import React, { useEffect } from 'react'
import type { Message, Project, Version } from '../types'
import { Link } from 'react-router-dom'
import { BotIcon, EyeIcon, LoaderCircle, Send } from 'lucide-react'
import api from '@/configs/axios'
import { toast } from 'sonner'
// import { set } from 'better-auth'

interface SidebarProps {
  isMenuOpen: boolean
  project: Project
  setProject: (project: Project) => void
  isGenerating: boolean
  setIsGenerating: (isGenerating: boolean) => void
}


const Sidebar = ({isMenuOpen,project,setProject,isGenerating,setIsGenerating}: SidebarProps) => {
  const messageRef=React.useRef<HTMLDivElement>(null)
  const [input,setInput]=React.useState<string>('')

  const handleRollback=async (versionId:string)=>{
    try{
      const confirm=window.confirm('Are you sure you want to rollback to this version? This action cannot be undone.')
      if(!confirm) return
      setIsGenerating(true)
      const { data }=await api.get('/api/project/rollback/'+project.id+'/'+versionId)
      const{data:data2}=await api.get('/api/user/project/'+project.id)
      toast.success(data.message)
      setProject(data2.project)
      setIsGenerating(false)
    } 
    catch(error:any){
      setIsGenerating(false)
      toast.error(error?.response?.data?.message || 'Failed to rollback')
      console.log(error)
    }
  }

  const fetchProject=async () =>{
    try{
      const {data}=await api.get('/api/user/project/'+project.id)
      setProject(data.project)
    }
    catch(error:any){
      toast.error(error?.response?.data?.message || 'Failed to fetch project data')
      console.log(error)
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

  useEffect(()=>{
    if(messageRef.current){
      messageRef.current.scrollIntoView({behavior:'smooth'})
    }
  },[project.conversation,isGenerating])

  return (
    <div className={`h-full text-sm bg-gray-800 text-white transition-all duration-300 ease-in-out hidden sm:flex flex-col ${isMenuOpen ? 'w-[25%] min-w-[280px] px-4 pt-4' : 'w-0 px-0 overflow-hidden'} overflow-y-auto custom-scrollbar`}>
      {isMenuOpen && (
        <>
      {/* <div className='flex flex-col'> */}
      {/* Message containter */}
      <div className="flex flex-col flex-1">
      {[...project.conversation,...project.versions].sort((a,b)=>new Date(a.timestamp).getTime()-new Date(b.timestamp).getTime()).map((message,index)=>{
        const isMessage='content' in message
        if(isMessage){
          const msg=message as Message
          const isUser=msg.role==='user'
          if(isUser){
            return (
              <div key={msg.id} className="flex flex-col self-end max-w-[80%] my-2">
                <div className="bg-indigo-700 text-white p-2 rounded-md shadow-md">
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400 mt-1 self-end">{new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
            )
          } else {
            return (
              <div key={msg.id} className="flex flex-col self-start max-w-[80%] my-2">
                <div className="flex items-start gap-2">
                  <BotIcon className="size-5 mt-1 flex-shrink-0" />
                  <div className="bg-gray-600 text-white p-2 rounded-md shadow-md flex-1">
                    {msg.content}
                  </div>
                </div>
                <span className="text-xs text-gray-400 mt-1 ml-6">{new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
            )
          } 
        }
        else{
          const version=message as Version
          return (
            <div key={version.id} className="bg-green-700/20 border border-green-600/40 text-white rounded-lg my-3 shadow-md w-full">
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className='font-semibold text-green-400'>Code Version Updated</span>
                  <Link 
                    to={`/preview/${project.id}/${version.id}`} 
                    target='_blank'
                    className="p-1.5 hover:bg-gray-700/50 rounded-md transition-colors"
                    title="Preview this version"
                  >
                    <EyeIcon className="size-4"/>
                  </Link>
                </div>
                <div className="text-xs text-gray-400">{new Date(version.timestamp).toLocaleString()}</div>
                <div className="pt-1">
                  {project.current_version_index === version.id ? (
                    <div className="bg-gray-700/50 text-gray-300 px-3 py-2 rounded-md text-center text-sm font-medium">
                      Current Version
                    </div>
                  ) : 
                  <button 
                    onClick={() => handleRollback(version.id)} 
                    className="w-full bg-green-600/80 hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Rollback to this version
                  </button>}
                </div>
              </div>
            </div>
          )
        }
      })}
      <div>
        {isGenerating &&
        <div className="bg-gray-600 text-white p-2 rounded-md my-2 self-start max-w-[80%] shadow-md">
          <div className="flex items-center gap-2">
            <BotIcon className='size-5' />
            <LoaderCircle className="size-4 animate-spin" />
            <span>Generating response...</span>
          </div>
          </div>}
      </div>
      <div ref={messageRef}/>
      </div>
      {/* Input Area */}
      <div className="sticky bottom-0 -mx-4 bg-gray-800 px-4 py-4 border-t border-gray-700">
        <form onSubmit={handleRevisions} className="relative">
          <textarea
            className="w-full p-2 pr-12 rounded-md bg-gray-700 text-white resize-none"
            rows={3}
            placeholder="Type your message..."
            disabled={isGenerating}
            value={input}
            onChange={(e)=>(setInput(e.target.value))}
          ></textarea>
          <button
            type="submit"
            className="absolute bottom-4 right-2 p-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-600 transition flex items-center justify-center"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </button>
        </form>
      </div>
      </>
      )}
    {/* </div> */}
    </div>
  )
}

export default Sidebar