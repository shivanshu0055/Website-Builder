import { forwardRef, useRef, useImperativeHandle, useState, useEffect } from 'react'
import type { Project } from '../types'
import { iframeScript } from '../assets/assets'
import EditorPanel from './EditorPanel'

export interface ProjectPreviewRef {
  getCode:()=>string | undefined
}

interface ProjectPreviewProps {
  project:Project,
  isGenerating:boolean,
  device?:'desktop' | 'tablet' | 'phone',
  showEditorPanel?:boolean
}

const ProjectPreview = forwardRef<ProjectPreviewRef,ProjectPreviewProps>(({
  project,isGenerating,device='desktop',showEditorPanel=true
}:ProjectPreviewProps,ref) => {

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedElement,setSelectedElement]=useState<HTMLElement|null>(null);

  const handleUpdate=(updates:any)=>{
    if(iframeRef.current?.contentWindow){
      iframeRef.current.contentWindow.postMessage({type:'UPDATE_ELEMENT',payload:updates},'*')
    }
  }
  useImperativeHandle(ref,()=>({
    getCode:()=>{
      const doc=iframeRef.current?.contentDocument
      if(!doc) return undefined
      // remove the outline which gets created while selecting element
      doc.querySelectorAll('.ai-selected-element,[data-ai-selected]').forEach
      (
        el=>{el.classList.remove('ai-selected-element')
        el.removeAttribute('data-ai-selected');
        (el as HTMLElement).style.outline='' 
      })

      // remove injected style + script from document
      const previewStyle=doc.getElementById('ai-preview-style')
      if(previewStyle) previewStyle.remove()

      const previewScript=doc.getElementById('ai-preview-script')
      if(previewScript) previewScript.remove()
      
      // serialize clean HTML
      const html=doc.documentElement.outerHTML
      return html
    }
  }))

  useEffect(()=>{
    const handeMessage=(event:MessageEvent)=>{
      if(event.data.type==='ELEMENT_SELECTED'){
        setSelectedElement(event.data.payload)
    }else if(event.data.type==='CLEAR_SELECTION'){
        setSelectedElement(null)
    }
    }
    window.addEventListener('message',handeMessage)
    return ()=>{
      window.removeEventListener('message',handeMessage)
    }
  },[])

  const transformElement=(element:HTMLElement|any)=>{
    if(!element) return null
    if (element.styles || element.text !== undefined) {
      return {
        tagName: element.tagName || '',
        className: element.className || '',
        text: element.text ?? '',
        styles: {
          padding: element.styles?.padding || '',
          margin: element.styles?.margin || '',
          backgroundColor: element.styles?.backgroundColor || '',
          color: element.styles?.color || '',
          fontSize: element.styles?.fontSize || ''
        }
      }
    }

    const elementStyle = element.style || {}
    return {
      tagName: element.tagName || '',
      className: element.className || '',
      text: element.textContent || '',
      styles: {
        padding: elementStyle.padding || '',
        margin: elementStyle.margin || '',
        backgroundColor: elementStyle.backgroundColor || '',
        color: elementStyle.color || '',
        fontSize: elementStyle.fontSize || ''
      }
    }
  }

  const injectPreview=(html:string)=>{
    if(!html) return ""
    if(!showEditorPanel) return html

    if(html.includes("</body>")){
      return html.replace("</body>",iframeScript+"</body>")
    }
    else{
      return html+iframeScript
    }
  }

  return (
    <div className='relative w-full h-full'>
      {project.current_code ? (
        <iframe
          ref={iframeRef}
          title="Project Preview"
          srcDoc={injectPreview(project.current_code)}
          className={`border-0 ${device === 'phone' ? 'w-[375px] h-[667px] border border-black mx-auto' : device === 'tablet' ? 'w-[768px] h-full border border-black mx-auto' : 'w-full h-full'}`}
        ></iframe>
        // {showEditorPanel && selectedElement && (<EditorPanel selectedElement={selectedElement} onUpdate={handleUpdate} onClose={() => setSelectedElement(null)}/>)}
      
      ) : isGenerating ? (  
        <div className="flex items-center justify-center w-full h-full bg-slate-950/5">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative">
              <div className="h-36 w-36 rounded-full border-8 border-slate-300/40 border-t-slate-900 animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-4 border-slate-500/40 border-b-slate-900 animate-spin [animation-duration:1.6s]"></div>
              <div className="absolute inset-10 rounded-full bg-slate-900/5 animate-pulse"></div>
            </div>
            <div className="text-xl font-semibold tracking-wide">Generating preview</div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.2s]"></span>
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.1s]"></span>
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"></span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-center">
            <div className="text-lg">No code available to preview.</div>
          </div>
        </div>
      )}
      {showEditorPanel && selectedElement && (
        <EditorPanel
          selectedElement={transformElement(selectedElement)}
          onUpdate={handleUpdate}
          onClose={()=>setSelectedElement(null)}
        />
      )}
    </div>
  )
})

export default ProjectPreview