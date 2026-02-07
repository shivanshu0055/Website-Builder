import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { dummyProjects } from "../assets/assets"
import ProjectPreview from "../components/ProjectPreview"
import type { Project } from "../types"
import api from "@/configs/axios"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"

const View = () => {
  const {projectId}=useParams()
  const [project,setProject]=useState<Project | null>(null)
  const [loading,setLoading]=useState(true)

  const fetchProject=async ()=>{
    try{
      const {data}=await api.get('/api/project/preview/'+projectId)
      setProject(data.project)
      setLoading(false)
    }catch(err:any){
      toast.error(err?.response?.data?.message || 'Failed to fetch project')
      console.log(err)
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchProject()
  }, [projectId])
  
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
    </div>
  )
}

export default View