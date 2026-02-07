import { useState } from "react";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import api from "@/configs/axios";
import { Navigate, useNavigate } from "react-router-dom";

const Home = () => {

    const [input, setInput]=useState('');
    const [loading,setLoading]=useState(false);
    const { data:session }=authClient.useSession()
    const navigate=useNavigate()

    const onSubmitHandler = async (e:React.FormEvent) => {
        e.preventDefault();
        try{
          if(!session?.user){
            toast.error('Please sign in to create a project')
            return
          }else if (!input.trim()){
            toast.error('Please provide a valid input')
            return
          }
          setLoading(true)
          const { data }=await api.post("/api/user/project",{initial_prompt:input})
          setLoading(false)
          navigate(`/projects/${data.projectId}`)
        }
        catch(err:any){
          console.log(err)
          toast.error(err?.response?.data?.message || 'Failed to create project')
          setLoading(false)
        }
    }

  return (
    <>
      <section className="min-h-screen flex flex-col items-center justify-center text-white px-4 py-12 sm:py-16 lg:py-20">
          {/* BACKGROUND IMAGE */}
          {/* <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/hero/bg-gradient-2.png" className="absolute inset-0 -z-10 size-full opacity" alt="" /> */}

        <a href="https://prebuiltui.com" className="inline-flex items-center gap-2 border border-slate-700 hover:border-slate-600 rounded-full p-1 pr-4 text-xs sm:text-sm transition-colors group">
          <span className="bg-blue-400 text-xs px-3 py-1 rounded-full font-medium">NEW</span>
          <p className="flex items-center gap-1.5 text-gray-300 group-hover:text-white transition-colors">
            <span className="hidden sm:inline">Try 30 days free trial option</span>
            <span className="sm:hidden">30 days free trial</span>
            <svg className="mt-px size-3" width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m1 1 4 3.5L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </p>
        </a>

        <h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mt-6 sm:mt-8 max-w-5xl leading-tight tracking-tight">
          Turn thoughts into websites <span className="bg-blue-400 bg-clip-text text-transparent">instantly</span>, with AI.
        </h1>

        <p className="text-center text-base sm:text-lg text-gray-400 max-w-2xl mt-4 sm:mt-6 px-4">
          Create, customize and present faster than ever with intelligent design powered by AI.
        </p>

        <form onSubmit={onSubmitHandler} className="w-full max-w-3xl mt-8 sm:mt-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-indigo-600/30 hover:border-indigo-600/50 focus-within:border-indigo-600/70 focus-within:ring-4 focus-within:ring-indigo-600/20 transition-all shadow-lg">
            <textarea 
              onChange={e => setInput(e.target.value)} 
              value={input}
              className="bg-transparent outline-none text-gray-200 placeholder:text-gray-500 resize-none w-full text-sm sm:text-base" 
              rows={4} 
              placeholder="Describe your website in details... (e.g., 'Create a modern portfolio website with a hero section, projects gallery, and contact form')" 
              required 
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <span className="text-xs text-gray-500">Press Enter to submit</span>
              <button 
                type="submit"
                disabled={loading} 
                className="flex items-center justify-center gap-2 bg-white text-black rounded-lg px-5 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/50 min-w-[140px]"
              >
                {!loading ? (
                  <>
                    <span>Create with AI</span>
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </>
                ) : (
                  <>
                    <Loader2 className="animate-spin size-5" />
                    <span>Creating...</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="w-full max-w-6xl mt-16 sm:mt-20 lg:mt-24">
          <p className="text-center text-xs sm:text-sm text-gray-500 uppercase tracking-wider mb-8 sm:mb-10">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 opacity-60 hover:opacity-80 transition-opacity">
            <img className="h-6 sm:h-7 md:h-8 w-auto grayscale hover:grayscale-0 transition-all" src="https://saasly.prebuiltui.com/assets/companies-logo/framer.svg" alt="Framer" />
            <img className="h-6 sm:h-7 md:h-8 w-auto grayscale hover:grayscale-0 transition-all" src="https://saasly.prebuiltui.com/assets/companies-logo/huawei.svg" alt="Huawei" />
            <img className="h-6 sm:h-7 md:h-8 w-auto grayscale hover:grayscale-0 transition-all" src="https://saasly.prebuiltui.com/assets/companies-logo/instagram.svg" alt="Instagram" />
            <img className="h-6 sm:h-7 md:h-8 w-auto grayscale hover:grayscale-0 transition-all" src="https://saasly.prebuiltui.com/assets/companies-logo/microsoft.svg" alt="Microsoft" />
            <img className="h-6 sm:h-7 md:h-8 w-auto grayscale hover:grayscale-0 transition-all" src="https://saasly.prebuiltui.com/assets/companies-logo/walmart.svg" alt="Walmart" />
          </div>
        </div>
      </section>
      </>
  )
}

export default Home