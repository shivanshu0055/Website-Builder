import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { dummyProjects } from "../assets/assets"
import ProjectPreview from "../components/ProjectPreview"
import type { Project, Version } from "../types"
import { toast } from "sonner"
import api from "@/configs/axios"
import { authClient } from "@/lib/auth-client"
import { Loader2Icon } from "lucide-react"

const Preview = () => {
  const [project, setProject]=useState<Project | null>(null)
  const [loading, setLoading]=useState<boolean>(true)
  const [code, setCode]=useState<string>('')
  const { projectId,versionId }=useParams()

  const fetchProject=async ()=>{
    try{
      const {data}=await api.get('/api/project/preview/'+projectId)
      setProject(data.project)
      setCode(data.project.current_code)
      if(versionId){
        data.project.versions.forEach((version:Version)=>{
          if(version.id===versionId){
            setCode(version.code)
          }
        })
      }
      setLoading(false)
    }
    catch(err:any){
      toast.error(err?.response?.data?.message || 'Failed to fetch project preview')
      console.log(err)
      setLoading(false)
    }
  }
  const {data:session,isPending}=authClient.useSession()

  useEffect(()=>{
    if(session?.user && !isPending){
    fetchProject()
    }
    else if(!isPending && !session?.user){
      toast.error('Please sign in to view project preview')
    } 
  }, [projectId,session])

  if(loading){
    return (
        <div className="w-full h-screen flex items-center justify-center">
          <Loader2Icon className="animate-spin size-10"></Loader2Icon>
        </div>
    )
  }

  return (
    <div className="w-full h-screen">
      {project && <ProjectPreview project={project} isGenerating={false} showEditorPanel={false}/>}
    </div>  )
}

export default Preview