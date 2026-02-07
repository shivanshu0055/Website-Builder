import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import type { Project } from "../types"
import { Download, Eye, EyeIcon, EyeOff, Loader2Icon, LucideClockFading, MessageSquareIcon, Monitor, Save, SmartphoneIcon, Tablet, XIcon } from "lucide-react"
import Sidebar from "../components/Sidebar"
import ProjectPreview, { type ProjectPreviewRef } from "../components/ProjectPreview"
import { toast } from "sonner"
import api from "@/configs/axios"
import { authClient } from "@/lib/auth-client"
// import { S } from "node_modules/@daveyplate/better-auth-ui/dist/auth-ui-provider-3JMiYGSS"
// import { set } from "better-auth"

const Projects = () => {
  const { projectId }=useParams()
  const navigate=useNavigate()

  const [project,setProject]=useState<Project|null>(null)
  const [loading,setLoading]=useState(true)
  const [isGenerating,setIsGenerating]=useState(false)
  const [device,setDevice]=useState<'desktop'|'phone'|'tablet'>('desktop')
  const [isMenuOpen,setIsMenuOpen]=useState(true)
  const [isSaving,setIsSaving]=useState(false)
  const [isPublishing,setIsPublishing]=useState(false)
  const previewRef=useRef<ProjectPreviewRef>(null)


  const fetchProject=async ()=>{
    try{
      const { data }=await api.get('/api/user/project/'+projectId)
      setProject(data.project)
      setIsGenerating(data.project.current_code ? false : true)
      setLoading(false)
    }
    catch(err:any){
      toast.error(err?.response?.data?.message || 'Failed to fetch project data')
      setLoading(false)
      navigate('/')
    }
  }

  const { data:session,isPending }=authClient.useSession()

  useEffect(()=>{
    if(session?.user){
      fetchProject()
    }
    else if(!isPending && !session?.user){
      toast.error('Please sign in to access your projects')
      navigate('/auth/signin')
    }
  },[session])

  useEffect(()=>{
    if(project && !project.current_code && isGenerating){
      const intervalId=setInterval(()=>{
        fetchProject()
      },5000)
      return ()=>clearInterval(intervalId)
    }
  },[projectId, isGenerating])

  const downloadCode=()=>{
    const code=previewRef.current?.getCode() || project?.current_code
    if(!code){
      if(isGenerating) return
      return
    }
    const blob=new Blob([code],{type:'text/html'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url
    a.download=`index.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const saveProject=async ()=>{
    try{
        if(!previewRef.current) return
        const code=previewRef.current.getCode()
        if(!code) return
        setIsSaving(true)
        const { data }=await api.put(`/api/project/save/${projectId}`,{code})
        toast.success(data.message)
        // setIsSaving(false)
    }catch(err:any){
        toast.error(err?.response?.data?.message || 'Failed to save project')
        // setIsSaving(false)
        console.log(err)
    }finally{
      setIsSaving(false)
    }
  }

  const togglePublish=async ()=>{
    try{
      setIsPublishing(true)
      const { data }=await api.get(`/api/user/publish-toggle/${projectId}`)
      toast.success(data.message)
      setProject(prev=> prev ? {...prev,isPublished:!prev.isPublished} : prev)
    }
    catch(err:any){
      toast.error(err?.response?.data?.message || 'Failed to update publish status')
      console.log(err)
    }finally{
      setIsPublishing(false)
    }
  }
  if(loading){
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2Icon className="animate-spin size-10 mx-auto"></Loader2Icon>
        </div>
    )
  }

  if(!project){
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="text-2xl ">Unable to load the project data</div>
        </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* NAVBAR */}
      <div className="flex py-2 px-2 bg-gray-800">
        <div className="w-[30%] flex gap-2 items-center ">
          <div>
          <img className="cursor-pointer size-10" src="/favicon.svg" onClick={() => navigate("/")}></img>
          </div>
        <div>
          <div className="text-sm">{project.name}</div>
          <div className="text-xs">Previewing last saved version</div>
        </div>
        <div className="sm:hidden">
        {!isMenuOpen ? <MessageSquareIcon onClick={()=>setIsMenuOpen(true)}></MessageSquareIcon> : <XIcon onClick={()=>setIsMenuOpen(false)}></XIcon>}
        </div>
        </div>
        <div className="flex justify-between w-full ">
        <div className="hidden sm:flex sm:gap-3 ml-5 items-center">
          <SmartphoneIcon onClick={()=>setDevice('phone')}></SmartphoneIcon>
          <Monitor onClick={()=>setDevice('desktop')}></Monitor>
          <Tablet onClick={()=>setDevice('tablet')}></Tablet>
        </div>
        <div className="flex gap-2 items-center text-sm">
          <button onClick={()=>saveProject()} disabled={isSaving} className="cursor-pointer border-2 px-2 py-1 rounded-lg flex gap-1 items-center disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? <Loader2Icon className="size-5 animate-spin"/> : <Save className="size-5"/>}
            Save
          </button>
          <Link className="cursor-pointer border-2 px-2 py-1 rounded-lg flex gap-1 items-center" target="_blank" to={`/preview/${projectId}`}><Monitor className="size-5"/> Preview</Link>
          <button onClick={downloadCode} className="cursor-pointer border-2 px-2 py-1 rounded-lg flex gap-1 items-center"><Download className="size-5"/> Download</button>
          <button onClick={()=>togglePublish()} disabled={isPublishing} className="cursor-pointer border-2 px-2 py-1 rounded-lg flex gap-1 items-center disabled:opacity-50 disabled:cursor-not-allowed">
            {isPublishing ? <Loader2Icon className="size-5 animate-spin"/> : project.isPublished ? <EyeIcon className="size-5"/> : <EyeOff className="size-5"/>}
            {project.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <Sidebar isMenuOpen={isMenuOpen} project={project} setProject={setProject} isGenerating={isGenerating} setIsGenerating={setIsGenerating}></Sidebar>
        <div className="flex-1 min-w-0 h-full">
          <ProjectPreview ref={previewRef} project={project} isGenerating={isGenerating} device={device}></ProjectPreview>
        </div>
      </div>
    </div>
  )
}

export default Projects