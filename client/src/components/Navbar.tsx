import { authClient } from '@/lib/auth-client';
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import {UserButton} from '@daveyplate/better-auth-ui';
import api from '@/configs/axios';
import { toast } from 'sonner';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate=useNavigate();
    const { data:session }=authClient.useSession()
    const [credits,setCredits]=useState(0)

    const getCredits=async ()=>{
      try{
        const { data }=await api.get('/api/user/credits')
        setCredits(data.credits)
      }
      catch(err){
        toast.error('Failed to fetch credits')
        console.log(err)
      }
    }

    useEffect(()=>{
      if(session?.user)
        getCredits()
    },[session?.user])

  return (
    <>
    <nav className="sticky top-0 z-50 flex items-center justify-between w-full py-3 sm:py-4 px-4 md:px-8 lg:px-16 xl:px-24 backdrop-blur-xl bg-gray-900/80 border-b border-slate-700/50 text-white shadow-lg">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/favicon.svg" alt="Logo" className='h-10 w-10 sm:h-12 sm:w-12 transition-transform group-hover:scale-110'/>
              <span className="hidden sm:inline text-lg font-bold text-white">WebsiteBuilder</span>
            </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium">Home</Link>
            <Link to="/projects" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium">My Projects</Link>
            <Link to="/community" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium">Community</Link>
            <Link to="/pricing" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors font-medium">Pricing</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!session?.user ? (
              <button 
                onClick={()=>navigate('/auth/signin')} 
                className="px-5 py-2 bg-white text-black hover:bg-gray-200 active:scale-95 transition-all rounded-lg font-semibold"
              >
                Get started
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full">
                  <svg className="size-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-semibold text-sm">{credits}</span>
                  <span className="text-xs text-gray-400">Credits</span>
                </div>
                <UserButton size='icon'></UserButton>
              </>
            )}
          </div>

          <button 
            id="open-menu" 
            className="md:hidden p-2 hover:bg-white/10 rounded-lg active:scale-90 transition-all" 
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
          </button>
        </nav>

        {menuOpen && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md text-white flex flex-col items-center justify-center md:hidden animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-6 text-xl">
              <Link 
                to="/" 
                onClick={()=>setMenuOpen(false)}
                className="px-6 py-3 hover:bg-white/10 rounded-lg transition-colors w-48 text-center"
              >
                Home
              </Link>
              <Link 
                to="/projects" 
                onClick={()=>setMenuOpen(false)}
                className="px-6 py-3 hover:bg-white/10 rounded-lg transition-colors w-48 text-center"
              >
                My Projects
              </Link>
              <Link 
                to="/community" 
                onClick={()=>setMenuOpen(false)}
                className="px-6 py-3 hover:bg-white/10 rounded-lg transition-colors w-48 text-center"
              >
                Community
              </Link>
              <Link 
                to="/pricing" 
                onClick={()=>setMenuOpen(false)}
                className="px-6 py-3 hover:bg-white/10 rounded-lg transition-colors w-48 text-center"
              >
                Pricing
              </Link>
              
              {session?.user && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mt-4">
                  <svg className="size-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-semibold">{credits}</span>
                  <span className="text-sm text-gray-400">Credits</span>
                </div>
              )}

              {!session?.user && (
                <button 
                  onClick={()=>{
                    setMenuOpen(false)
                    navigate('/auth/signin')
                  }} 
                  className="px-8 py-3 bg-white text-black hover:bg-gray-200 transition-all rounded-lg font-semibold mt-4"
                >
                  Get started
                </button>
              )}
            </div>

            <button 
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition-all active:scale-90" 
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        )}
        </>
  )
}

export default Navbar