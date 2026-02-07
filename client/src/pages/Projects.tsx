import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import type { Project } from "../types"
import { Download, Eye, EyeIcon, EyeOff, Loader2Icon, LoaderCircle, LucideClockFading, MessageSquareIcon, Monitor, Save, Send, SmartphoneIcon, Tablet, XIcon, BotIcon } from "lucide-react"
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
  const [input,setInput]=useState<string>('')
  const previewRef=useRef<ProjectPreviewRef>(null)
  const messageRef=useRef<HTMLDivElement>(null)


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

  useEffect(()=>{
    if(messageRef.current){
      messageRef.current.scrollIntoView({behavior:'smooth'})
    }
  },[project?.conversation,isGenerating])

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

  const handleRevisions=async (e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    let interval:number | undefined
    try{
      setIsGenerating(true)
      interval=setInterval(()=>{
        fetchProject()
      },10000)
      const {data}=await api.post(`/api/project/revision/${project.id}`,{message:input})
      fetchProject()
      toast.success(data.message)
      setInput('')
      clearInterval(interval)
      setIsGenerating(false)
    }
    catch(err:any){
      setIsGenerating(false)
      toast.error(err?.response?.data?.message || 'Failed to send message')
      console.log(err);
      if(interval) clearInterval(interval)
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
      <div className="flex flex-wrap items-center gap-2 py-2 px-2 sm:px-3 bg-gray-800">
        {/* Left: Logo + Project Name + Mobile Chat Toggle */}
        <div className="flex gap-2 items-center min-w-0 flex-shrink-0">
          <img className="cursor-pointer size-8 sm:size-10 flex-shrink-0" src="/favicon.svg" onClick={() => navigate("/")} />
          <div className="min-w-0">
            <div className="text-sm truncate max-w-[120px] sm:max-w-[200px]">{project.name}</div>
            <div className="text-xs text-gray-400 hidden sm:block">Previewing last saved version</div>
          </div>
          <div className="sm:hidden flex-shrink-0">
            {!isMenuOpen ? <MessageSquareIcon className="size-5 cursor-pointer" onClick={()=>setIsMenuOpen(true)}/> : <XIcon className="size-5 cursor-pointer" onClick={()=>setIsMenuOpen(false)}/>}
          </div>
        </div>

        {/* Center: Device Toggle (hidden on mobile) */}
        <div className="hidden sm:flex gap-2 ml-2 items-center flex-shrink-0">
          <SmartphoneIcon className={`size-5 cursor-pointer transition-colors ${device==='phone' ? 'text-white' : 'text-gray-400 hover:text-white'}`} onClick={()=>setDevice('phone')}/>
          <Monitor className={`size-5 cursor-pointer transition-colors ${device==='desktop' ? 'text-white' : 'text-gray-400 hover:text-white'}`} onClick={()=>setDevice('desktop')}/>
          <Tablet className={`size-5 cursor-pointer transition-colors ${device==='tablet' ? 'text-white' : 'text-gray-400 hover:text-white'}`} onClick={()=>setDevice('tablet')}/>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm ml-auto">
          <button onClick={()=>saveProject()} disabled={isSaving} className="cursor-pointer border border-gray-600 px-1.5 sm:px-2 py-1 rounded-lg flex gap-1 items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors">
            {isSaving ? <Loader2Icon className="size-4 sm:size-5 animate-spin"/> : <Save className="size-4 sm:size-5"/>}
            <span className="hidden sm:inline">Save</span>
          </button>
          <Link className="cursor-pointer border border-gray-600 px-1.5 sm:px-2 py-1 rounded-lg flex gap-1 items-center hover:bg-white/10 transition-colors" target="_blank" to={`/preview/${projectId}`}>
            <Monitor className="size-4 sm:size-5"/>
            <span className="hidden sm:inline">Preview</span>
          </Link>
          <button onClick={downloadCode} className="cursor-pointer border border-gray-600 px-1.5 sm:px-2 py-1 rounded-lg flex gap-1 items-center hover:bg-white/10 transition-colors">
            <Download className="size-4 sm:size-5"/>
            <span className="hidden sm:inline">Download</span>
          </button>
          <button onClick={()=>togglePublish()} disabled={isPublishing} className="cursor-pointer border border-gray-600 px-1.5 sm:px-2 py-1 rounded-lg flex gap-1 items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors">
            {isPublishing ? <Loader2Icon className="size-4 sm:size-5 animate-spin"/> : project.isPublished ? <EyeIcon className="size-4 sm:size-5"/> : <EyeOff className="size-4 sm:size-5"/>}
            <span className="hidden sm:inline">{project.isPublished ? 'Unpublish' : 'Publish'}</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMenuOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-gray-800 flex flex-col">
            {/* Header with close button */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
              <h2 className="text-white text-sm font-semibold">Chat</h2>
              <button onClick={()=>setIsMenuOpen(false)} className="p-1 hover:bg-gray-700 rounded transition-colors">
                <XIcon className="size-4 text-white"/>
              </button>
            </div>
            
            <div className="flex-1 min-h-0 text-xs text-white px-3 pt-3 overflow-y-auto flex flex-col custom-scrollbar">
              {/* Message container */}
              <div className="flex flex-col flex-1 min-h-0">
                {[...project.conversation,...project.versions].sort((a,b)=>new Date(a.timestamp).getTime()-new Date(b.timestamp).getTime()).map((message,index)=>{
                  const isMessage='content' in message
                  if(isMessage){
                    const msg=message as any
                    const isUser=msg.role==='user'
                    if(isUser){
                      return (
                        <div key={msg.id} className="flex flex-col self-end max-w-[85%] my-1">
                          <div className="bg-indigo-700 text-white p-1.5 rounded text-xs shadow-sm">
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-0.5 self-end">{new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                      )
                    } else {
                      return (
                        <div key={msg.id} className="flex flex-col self-start max-w-[85%] my-1">
                          <div className="flex items-start gap-1.5">
                            <BotIcon className="size-3.5 mt-1 flex-shrink-0" />
                            <div className="bg-gray-600 text-white p-1.5 rounded text-xs shadow-sm flex-1">
                              {msg.content}
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 mt-0.5 ml-5">{new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                      )
                    } 
                  } else {
                    const version=message as any
                    return (
                      <div key={version.id} className="bg-green-700/20 border border-green-600/40 text-white rounded my-2 shadow-sm w-full">
                        <div className="p-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className='font-semibold text-green-400 text-xs'>Code Version Updated</span>
                            <Link 
                              to={`/preview/${project.id}/${version.id}`} 
                              target='_blank'
                              className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                            >
                              <EyeIcon className="size-3"/>
                            </Link>
                          </div>
                          <div className="text-[10px] text-gray-400">{new Date(version.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    )
                  }
                })}
                {isGenerating &&
                <div className="bg-gray-600 text-white p-1.5 rounded my-1 self-start max-w-[85%] shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <BotIcon className='size-3.5' />
                    <LoaderCircle className="size-3 animate-spin" />
                    <span className="text-xs">Generating...</span>
                  </div>
                </div>}
                <div ref={messageRef}/>
              </div>
            </div>
            
            {/* Input Area */}
            <div className="bg-gray-800 px-3 py-2.5 border-t border-gray-700">
              <form onSubmit={handleRevisions} className="relative">
                <textarea
                  className="w-full p-2 pr-10 rounded bg-gray-700 text-white resize-none text-xs"
                  rows={2}
                  placeholder="Type your message..."
                  disabled={isGenerating}
                  value={input}
                  onChange={(e)=>(setInput(e.target.value))}
                ></textarea>
                <button
                  type="submit"
                  className="absolute bottom-2.5 right-1.5 p-1.5 bg-indigo-700 text-white rounded hover:bg-indigo-600 transition flex items-center justify-center"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
        
        {/* Desktop Sidebar */}
        <Sidebar isMenuOpen={isMenuOpen} project={project} setProject={setProject} isGenerating={isGenerating} setIsGenerating={setIsGenerating}/>
        
        <div className="flex-1 min-w-0 h-full">
          <ProjectPreview ref={previewRef} project={project} isGenerating={isGenerating} device={device}/>
        </div>
      </div>
    </div>
  )
}

export default Projects