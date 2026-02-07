import { useNavigate } from "react-router-dom";
import type { Project } from "../types";
import { dummyProjects, iframeScript } from "../assets/assets";
import { TrashIcon, Loader2Icon, Folder } from "lucide-react";
import api from "@/configs/axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// import { useState } from "react";

const Community = () => {
//   const projects: Project[] = [...dummyProjects];
    const [projects,setProjects]=useState<Project[]>([])
    const [loading,setLoading]=useState(true)
    const navigate=useNavigate();


    const fetchProjects=async ()=>{
    try{
        const { data }=await api.get('/api/project/published')
        setProjects(data.projects)
    }
    catch(err:any){
        toast.error(err?.response?.data?.message || 'Failed to fetch projects')
        console.log(err)
    }
    finally{
        setLoading(false)
    }
}

    useEffect(()=>{
        fetchProjects()
    },[])

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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto">
            <Folder className="size-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-3xl font-bold text-white mb-2">No Published Projects</h2>
            <p className="text-gray-400 mb-2">There are no published projects in the community yet.</p>
            <p className="text-gray-500 text-sm">Check back later or visit My Projects to publish your own website.</p>
          </div>
        </div>
    ) : (
    <>
    <div>
        <h1 className="text-3xl font-semibold my-6 ">Community Published Projects</h1>
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {
                projects.map((project)=>(   
                    <div key={project.id} className="group flex flex-col border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
                        <div onClick={() => navigate(`/view/${project.id}`)} className="cursor-pointer relative h-48 bg-slate-950 overflow-hidden">
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
                                        navigate(`/view/${project.id}`)
                                    }}
                                >
                                    View
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
                                <div onClick={(e)=>{e.stopPropagation()}} className="font-semibold">
                                    {project.user?.name}
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

export default Community