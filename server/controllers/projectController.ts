import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import openai from "../configs/openai.js";

// Controller function to make revision
export const makeRevision=async (req:Request,res:Response)=>{
    try{
        const userId=req.userId
        const { projectId }=req.params
        const { message } =req.body
        
        const user=await prisma.user.findUnique({
            where:{
                id:userId 
            }
        })

        if(!userId || !user){
            return res.status(401).json({message:"Unauthorized"})
        }

        if(user.credits<5){
            return res.status(403).json({message:"Not enough credits"})
        }
        
        if(!message || message.trim().length===0){
            return res.status(400).json({message:"Valid prompt is required"})
        } 

        const currentProject=await prisma.websiteProject.findUnique({
            where:{
                id:projectId as string,
                userId:userId
            },
            include:{
                versions:true
            }
        })

        if(!currentProject){
            return res.status(404).json({message:"Project not found"})
        }

        await prisma.conversation.create({
            data:{
                role:'user',
                content:message,
                projectId:currentProject.id
            }
        })

        await prisma.user.update({
            where:{
                id:userId
            },
            data:{
                credits:{
                    decrement:5
                }
            }
        })

        // Enhace user prompt
        const promptEnhanceResponse=await openai.chat.completions.create({
            model:'arcee-ai/trinity-large-preview:free',
            messages:[
                {
                    role:'system',
                    content:`You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

                        Enhance this by:
                        1. Being specific about what elements to change
                        2. Mentioning design details (colors, spacing, sizes)
                        3. Clarifying the desired outcome
                        4. Using clear technical terms

                    Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).
                    `
                },
                {
                    role:'user',
                    content:`User's request:${message}`
                }
            ]
        })

        const enhancedPrompt=promptEnhanceResponse.choices[0].message.content

        await prisma.conversation.create({
            data:{
                role:'assistant',
                content:`I have enhanced your request to make it more specific for the web developer: ${enhancedPrompt}`,
                projectId:currentProject.id
            }
        })

        await prisma.conversation.create({
            data:{
                role:'assistant',
                content:`Making the following changes to the website ...`,
                projectId:currentProject.id
            }
        })

        const codeGenerationResponse=await openai.chat.completions.create({
            model:'arcee-ai/trinity-large-preview:free',
            messages:[
                {
                    role:'system',
                    content:`You are an expert web developer. 

                    CRITICAL REQUIREMENTS:
                    - Return ONLY the complete updated HTML code with the requested changes.
                    - Use Tailwind CSS for ALL styling (NO custom CSS).
                    - Use Tailwind utility classes for all styling changes.
                    - Include all JavaScript in <script> tags before closing </body>
                    - Make sure it's a complete, standalone HTML document with Tailwind CSS
                    - Return the HTML Code Only, nothing else

                    Apply the requested changes while maintaining the Tailwind CSS styling approach.
                `
                },
                {
                    role:'user',
                    content:`Here is the current website code: "${currentProject.current_code}"
                    Make the following changes based on this enhanced request: "${enhancedPrompt}"`
                }
            ]
        })

        const code=codeGenerationResponse.choices[0].message.content || ""

        if(!code){
            await prisma.conversation.create({
            data:{
                role:'assistant',
                content:`Unable to generate code, please try again`,
                projectId:currentProject.id
            }
            })
            await prisma.user.update({
                where:{
                    id:userId
                },  
                data:{
                    credits:{
                        increment:5
                    }
                }
            })
            return
        }
        // const version=await prisma.version.create({
        const version=await prisma.version.create({
            data:{
                code:code.replace(/```[a-z]*\n?/gi,'').replace(/```$/g,'').trim(),
                description:'Changes made based on user request',
                projectId:currentProject.id
            }
        })

        await prisma.conversation.create({
            data:{
                role:'assistant',
                content:`I have made the changes to the site, you can now preview it`,
                projectId:currentProject.id
            }
        })

        await prisma.websiteProject.update({
            where:{
                id:currentProject.id
            },
            data:{
                current_code:code.replace(/```[a-z]*\n?/gi,'').replace(/```$/g,'').trim(),
                current_version_index:version.id
            }
        })

        res.json({
            message:'Changes made successfully',
        })
    }
    catch(err:any){
        await prisma.user.update({
            where:{
                id:req.userId
            },
            data:{
                credits:{
                    increment:5
                }
            }
        })
        console.log(err.code || err.message);
        res.status(500).json({message:err.message})
    }
}

// Controller to rollback to specified version

export const rollback=async (req:Request,res:Response)=>{
    try{
        const userId=req.userId
        const { projectId }=req.params
        const { versionId }=req.params

        if(!userId){
            return res.status(401).json({message:"Unauthorized"})
        }

        const project=await prisma.websiteProject.findUnique({
            where:{
                id:projectId as string,
                userId:userId,
            },
            include:{
                versions:true
            }
        })

        if(!project){
            return res.status(404).json({message:"Project not found"})
        }

        const version=project.versions.find(v=>v.id===versionId)

        if(!version){
            return res.status(404).json({message:"Version not found"})
        }

        await prisma.websiteProject.update({
            where:{
                id:projectId as string,
                userId:userId
            },
            data:{
                current_code:version.code,
                current_version_index:version.id
            }
        })

        await prisma.conversation.create({
            data:{
                role:"assistant",
                content:`Rolled back to selected version `,
                projectId:projectId as string
            },
        })

        res.json({
            message:"Version rolled back"
        })
    }
    catch(err:any){
        console.log(err);
        res.status(500).json({message:err.message})
    }
}

// Contoller function to delete a project
export const deleteProject=async (req:Request,res:Response)=>{
    try{
        const userId=req.userId
        const { projectId }=req.params

        if(!userId){
            return res.status(401).json({message:"Unauthorized"})
        }   

        await prisma.websiteProject.delete({
            where:{
                id:projectId as string,
                userId:userId
            }
        })

        res.json({
            message:"Project deleted successfully"
        })
    }
    catch(err:any){
        console.log(err);
        res.status(500).json({message:err.message})
    }
}

// Controller function for getting project code for preview
export const getProjectPreview=async (req:Request,res:Response)=>{ 
    try{
        const userId=req.userId
        const { projectId }=req.params

        if(!userId){
            return res.status(401).json({message:"Unauthorized"})
        }

        const project=await prisma.websiteProject.findUnique({
            where:{
                id:projectId as string,
                userId:userId
            },
            include:{
                versions:true
            }
        })

        if(!project){
            return res.status(404).json({message:"Project not found"})
        }
        
        res.json({
            project:project
        })
    }
    catch(err:any){
        console.log(err);
        res.status(500).json({message:err.message})
    }
}


// Controller function to get all published projects
export const getPublishedProjects=async (req:Request,res:Response)=>{
    try{
        const projects=await prisma.websiteProject.findMany({
            where:{
                isPublished:true
            },
            orderBy:{
                createdAt:'desc'
            },
            include:{user:true}
        })
        res.json({
            projects
        })
    }
    catch(err:any){
        console.log(err);
        res.status(500).json({message:err.message})
    }
}

// Controller function to get single project by ID
export const getProjectCodeById=async (req:Request,res:Response)=>{
    try{
        const { projectId }=req.params
        const project=await prisma.websiteProject.findUnique({
            where:{
                id:projectId as string,
            },
        })
        if(!project || !project.isPublished || !project?.current_code){
            return res.status(404).json({message:"Project not found"})
        }

        res.json({
            code:project.current_code
        })
    }
    catch(err:any){
        console.log(err);
        res.status(500).json({message:err.message})
    }
}

// Controller function to save project
export const saveProjectCode=async (req:Request,res:Response)=>{
    try{
        const userId=req.userId
        const { projectId }=req.params
        const { code }=req.body

        if(!userId){
            return res.status(401).json({message:"Unauthorized"})
        }

        if(!code){
            return res.status(400).json({message:"Code is required"})   
        }

        const project=await prisma.websiteProject.findUnique({
            where:{
                id:projectId as string,
                userId:userId
            },
        })

        if(!project){
            return res.status(404).json({message:"Project not found"})
        }

        await prisma.websiteProject.update({
            where:{
                id:projectId as string,
                userId:userId
            },
            data:{
                current_code:code,
                current_version_index:''
            }
        })

        res.json({
            message:"Project saved successfully"
        })
    }
    catch(err:any){
        console.log(err);
        res.status(500).json({message:err.message})
    }
}
