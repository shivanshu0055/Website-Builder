
import { Route, Routes, useLocation } from "react-router-dom"
import Pricing from "./pages/Pricing"
import Projects from "./pages/Projects"
import MyProjects from "./pages/MyProjects"
import Preview from "./pages/Preview"
import Community from "./pages/Community"
import Home from "./pages/Home"
import Navbar from "./components/Navbar"
import View from "./pages/View"
import { Toaster } from "sonner"
import AuthPage from "./pages/Authpage"
import Settings from "./pages/Settings"
// import { Settings } from "lucide-react"

const App = () => {
  const { pathname}=useLocation()

  const hideNavbar= pathname.startsWith('/auth') || pathname.startsWith('/preview/') && pathname!=='/projects' || pathname.startsWith('/view/') || pathname.startsWith('/projects/')

  return (
    <div>
      <Toaster/>
      {!hideNavbar &&<Navbar></Navbar>}
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/auth/:pathname" element={<AuthPage />} />
        <Route path="/account/settings" element={<Settings />}></Route>
        <Route path="/pricing" element={<Pricing />}></Route>
        <Route path="/projects/:projectId" element={<Projects />}></Route>
        <Route path="/projects" element={<MyProjects />}></Route>
        <Route path="/preview/:projectId" element={<Preview />}></Route>
        <Route path="/preview/:projectId/:versionId" element={<Preview />}></Route>
        <Route path="/community" element={<Community />}></Route>
        <Route path="/view/:projectId" element={<View />}></Route>
      </Routes>
    </div>
  )
}

export default App