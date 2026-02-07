import { useNavigate } from "react-router-dom";
import { dummyProjects, iframeScript } from "../assets/assets";
import type { Project } from "../types";
import { TrashIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/configs/axios";
import { authClient } from "@/lib/auth-client";

const MyProjects = () => {
    const [projects,setProjects]=useState<Project[]>([])
    const [loading,setLoading]=useState(true)
    const {data:session,isPending}=authClient.useSession()

    const fetchProjects=async ()=>{
        try{
            const data=await api.get('/api/user/projects')
            setProjects(data.data.projects)
        }
        catch(err:any){
            toast.error(err?.response?.data?.message || 'Failed to fetch projects')
            console.log(err)
        }
        finally{
            setLoading(false)
        }
    }

    const deleteProject=async (projectId: string)=>{
        try{
            const confirm=window.confirm('Are you sure you want to delete this project? This action cannot be undone.')
            if(!confirm) return
            const { data }=await api.delete('/api/project/'+projectId)
            toast.success(data.message)
            fetchProjects()
        }
        catch(err:any){
            toast.error(err?.response?.data?.message || 'Failed to delete project')
            console.log(err)
        }

    }
    useEffect(()=>{
        if(session?.user && !isPending)
            fetchProjects()
        else if(!isPending && !session?.user){
            toast.error('Please sign in to access your projects')
            navigate('/auth/signin')
        }
    },[session?.user])

    const navigate=useNavigate();

    const buildPreviewHtml = (html: string) => {
        if (!html) return "<html><body style='background:#0f172a;color:#e2e8f0;font-family:Inter,sans-serif;padding:24px;'>No preview available.</body></html>";
        if (html.includes("</body>")) {
            return html.replace("</body>", `${iframeScript}</body>`);
        }
        if (html.includes("</html>")) {
            return html.replace("</html>", `${iframeScript}</html>`);
        }
        return `${html}${iframeScript}`;
    };

  return (
    <div className="w-full py-4 px-4 md:px-16 lg:px-24 xl:px-32">
    {loading ? (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2Icon className="animate-spin size-10 mx-auto"></Loader2Icon>
      </div>
    ) : 
        projects.length===0 ? (
        <div className="w-fit mx-auto my-25">
            <div className="text-4xl font-semibold ">You have no projects</div>
            <div onClick={()=>navigate('/home')} className="cursor-pointer mx-auto my-6 bg-white text-black text-xl rounded-lg px-3 py-1.5 w-fit">Create one</div>
            </div>
    ) : (
    <>
    <div>
        <h1 className="text-3xl font-semibold my-6 ">My Projects</h1>
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {
                projects.map((project)=>(   
                    <div key={project.id} className="group flex flex-col border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        <div onClick={() => navigate(`/projects/${project.id}`)} className="cursor-pointer relative h-48 bg-slate-950 overflow-hidden">
                            {project.current_code ? <iframe
                                title={`preview-${project.id}`}
                                srcDoc={buildPreviewHtml(project.current_code)}
                                className="absolute top-0 left-0 w-355 h-200 origin-top-left pointer-events-none scale-[0.28]"
                                sandbox="allow-scripts allow-same-origin"
                                loading="lazy"
                            /> :<div className="text-center flex items-center justify-center h-full text-gray-500">
                                <div>
                                    No preview available
                                </div>
                                </div>}
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    className="cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition"
                                    onClick={(e) => {
                                        e.stopPropagation() 
                                        navigate(`/preview/${project.id}`)
                                    }}
                                >
                                    Preview
                                </button>
                                <button
                                    className="cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-md bg-white/90 text-slate-900 hover:bg-white transition"
                                    onClick={(e) => {
                                        e.stopPropagation() 
                                        navigate(`/projects/${project.id}`)
                                    }}
                                >
                                    Open
                                </button>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="text-lg font-semibold leading-snug">{project.name}</h2>
                                {project.isPublished && (
                                    <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                        Website
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm mt-1">
                                {project.initial_prompt}
                            </p>
                            <div className="flex items-center justify-between mt-auto pt-4 text-xs text-slate-400">
                                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                                <div onClick={(e)=>{e.stopPropagation(); deleteProject(project.id)}} className="cursor-pointer">
                                    <TrashIcon size={18}></TrashIcon>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                ))
            }
        </div>
    </div>
    </>)
    }    
    </div>
  )
}

export default MyProjects