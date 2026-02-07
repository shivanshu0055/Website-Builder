import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { log, time } from "console";
import openai from "../configs/openai.js";

// Controller function to get User Credits
export const getUserCredits=async (req:Request,res:Response)=>{
    try{
        const userId=req.userId
        if(!userId){
            return res.status(401).json({message:"Unauthorized"})
        }

        const user=await prisma.user.findUnique({
            where:{id:userId},
        })

        res.json({
            credits:user?.credits
        })
    }
    catch(err:any){
        console.log(err);
        res.status(500).json({message:err.code || err.message})
    }
}

// Controller function to create new project
export const createUserProject=async (req:Request,res:Response)=>{
    const userId=req.userId
    try{
        const { initial_prompt }=req.body
        if(!userId){
            return res.status(401).json({message:"Unauthorized"})
        }

        const user=await prisma.user.findUnique({
            where:{id:userId},
        })

        if(user && user?.credits<5){
            return res.status(403).json({message:"Insufficient credits"})
        }

        const project=await prisma.websiteProject.create({
            data:{
                name:initial_prompt.length>50? initial_prompt.substring(0,50)+ "..." : initial_prompt,
                initial_prompt:initial_prompt,
                userId:userId            
            }
        })

        await prisma.user.update({
            where:{id:userId},
            data:{
                totalCreation:{increment:1},
                credits:{decrement:5}
            }
        })

        await prisma.conversation.create({
            data:{
                role:'user',
                content:initial_prompt,
                projectId:project.id
            }
        })

        res.json({
            projectId:project.id
        })
        
        const promptEnhanceResponse=await openai.chat.completions.create({
            model:'arcee-ai/trinity-large-preview:free',
            messages:[
                {
                    role:'system',
                    content:`a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.
                            Enhance this prompt by:
                            1. Adding specific design details (layout, color scheme, typography)
                            2. Specifying key sections and features
                            3. Describing the user experience and interactions
                            4. Including modern web design best practices
                            5. Mentioning responsive design requirements
                            6. Adding any missing but important elements
                            Return ONLY the enhanced prompt, nothing else. Make it detailed but concise (2-3 paragraphs max).`
                },
                {
                    role:'user',
                    content:initial_prompt
                },
            ]
        })

        const enhancedPrompt=promptEnhanceResponse.choices[0].message?.content
        console.log("Enhanced Prompt: ",enhancedPrompt);
        
        await prisma.conversation.create({
            data:{
                role:'assistant',
                content:`I have enhanced your prompt to make it more detailed and comprehensive for better website creation. Here is the enhanced prompt:\n\n${enhancedPrompt}`,
                projectId:project.id
            }
        })

        await prisma.conversation.create({
            data:{
                role:'assistant',
                content:`Generating your website now... This may take a few minutes. You will be notified once it's ready.`,
                projectId:project.id
            }
        })
        
        // generate website code with enhanced prompt
        const codeGenerationResponse=await openai.chat.completions.create({
            model:'arcee-ai/trinity-large-preview:free',
            messages:[
                {
                    role:'system',
                    content:`
                            You are an expert web developer. Create a complete, production-ready, single-page website based on this request: "${enhancedPrompt}"

                            CRITICAL REQUIREMENTS:
                            - You MUST output valid HTML ONLY. 
                            - Use Tailwind CSS for ALL styling
                            - Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                            - Use Tailwind utility classes extensively for styling, animations, and responsiveness
                            - Make it fully functional and interactive with JavaScript in <script> tag before closing </body>
                            - Use modern, beautiful design with great UX using Tailwind classes
                            - Make it responsive using Tailwind responsive classes (sm:, md:, lg:, xl:)
                            - Use Tailwind animations and transitions (animate-*, transition-*)
                            - Include all necessary meta tags
                            - Use Google Fonts CDN if needed for custom fonts
                            - Use placeholder images from https://placehold.co/600x400
                            - Use Tailwind gradient classes for beautiful backgrounds
                            - Make sure all buttons, cards, and components use Tailwind styling

                            CRITICAL HARD RULES:
                            1. You MUST put ALL output ONLY into message.content.
                            2. You MUST NOT place anything in "reasoning", "analysis", "reasoning_details", or any hidden fields.
                            3. You MUST NOT include internal thoughts, explanations, analysis, comments, or markdown.
                            4. Do NOT include markdown, explanations, notes, or code fences.

                            The HTML should be complete and ready to render as-is with Tailwind CSS.`
                },{
                    role:'user',
                    content:enhancedPrompt || ''
                }
            ]
        })

        const code=codeGenerationResponse.choices[0].message?.content || ''
        console.log("Generated Code: ", code);
        
        if(!code){
                    await prisma.conversation.create({
                    data:{
                        role:'assistant',
                        content:`Unable to generate code, please try again`,
                        projectId:project.id
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
        // create version
        const version=await prisma.version.create({
            data:{
                code:code.replace(/```[a-z]*\n?/gi,'').replace(/```$/g,'').trim(),
                description:'Initial version',
                projectId:project.id
            }
        })

        await prisma.conversation.create({
            data:{
                role:'assistant',
                content:`I have created your website based on the enhanced prompt. This is the initial version of your website. You can view and edit the code in the project dashboard. If you want to make changes, just let me know!`,
                projectId:project.id
            }
        })

        await prisma.websiteProject.update({
            where:{id:project.id},
            data:{
                current_code:code.replace(/```[a-z]*\n?/gi,'').replace(/```$/g,'').trim(),
                current_version_index:version.id
            }
        })
    }
    catch(err:any){
        await prisma.user.update({
            where:{id:userId},
            data:{
                credits:{increment:5},
            }
        })
        console.log(err);
        res.status(500).json({message:err.code || err.message})
    }
}

// Controller function to get single user project
export const getUserProject=async (req:Request,res:Response)=>{
    try{
        const userId=req.userId
        const {projectId}=req.params

        if(!userId){
            return res.status(401).json({message:"Unauthorized"})
        }

        const user=await prisma.user.findUnique({
            where:{id:userId},
        })

        const project=await prisma.websiteProject.findUnique({
            where:{
                id:projectId as string,
                userId:userId
            },
            include:{
                conversation:{
                    orderBy:{timestamp:'asc'}
                },
                versions:{
                    orderBy:{timestamp:'asc'}
                }
            }
        })

        res.json({
            project
        })

    }
    catch(err:any){
        console.log(err);
        res.status(500).json({message:err.code || err.message})
    }
}

// Controller function to get all user projects
export const getUserProjects=async (req:Request,res:Response)=>{
    try{
        const userId=req.userId
        // const {projectId}=req.params

        if(!userId){
            return res.status(401).json({message:"Unauthorized"})
        }

        const projects=await prisma.websiteProject.findMany({
            where:{
                userId:userId
            },
            orderBy:{
                updatedAt:'desc'
            }
        })

        res.json({
            projects
        })
    }
    catch(err:any){
        console.log(err);
        res.status(500).json({message:err.code || err.message})
    }
}

// Controller function to toggle project publish
export const toggleProjectPublish=async (req:Request,res:Response)=>{
    try{
        const userId=req.userId
        const {projectId}=req.params

        if(!userId){
            return res.status(401).json({message:"Unauthorized"})
        }

        const project=await prisma.websiteProject.findUnique({
            where:{
                id:projectId as string,
                userId:userId
            }
        })

        if(!project){
            return res.status(404).json({message:"Project not found"})
        }

        await prisma.websiteProject.update({
            where:{id:projectId as string},
            data:{
                isPublished:!project.isPublished
            }
        })

        res.json({message:"Project publish status toggled successfully"})
}
    catch(err:any){
        console.log(err);
        res.status(500).json({message:err.code || err.message}) 
    }
}

// Controller function to purchase credits
export const purchaseCredits=async (req:Request,res:Response)=>{}