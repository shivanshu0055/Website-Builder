import { X } from "lucide-react"
import { useEffect, useState } from "react"

interface EditorPanelProps {
  selectedElement:{
    tagName:string,
    className:string,
    text:string,
    styles:{
        padding:string,
        margin:string,
        backgroundColor:string,
        color:string,
        fontSize:string,
    }
  }|null,
  onUpdate:(updates:any)=>void,
    onClose:()=>void
}

const EditorPanel = ({ selectedElement,onUpdate,onClose }:EditorPanelProps) => {

    const [values,setValues]=useState(selectedElement)

    useEffect(()=>{
        setValues(selectedElement)
    },[selectedElement])

    if(!selectedElement || !values){
        return null
    }

    const handleChange=(field:string, value:string)=>{
        const newValues={...values,[field]:value}
        if(field in values.styles){
            newValues.styles={...values.styles,[field]:value}
        }
        setValues(newValues)
        onUpdate({[field]:value} )
    }

    const handleStyleChange=(styleName:string,value:string)=>{
        const newValues={...values,styles:{...values.styles,[styleName]:value}}
        setValues(newValues)
        onUpdate({styles:{[styleName]:value}})
    }

    return (
        <div className="absolute top-4 right-4 z-20 w-[320px] max-w-[90vw] rounded-lg border border-white/10 bg-gray-900/95 text-white shadow-xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h3 className="text-sm font-semibold">Edit Element</h3>
                <button onClick={onClose} className="rounded-md p-1 text-white/80 hover:text-white hover:bg-white/10" aria-label="Close editor panel">
                    <X className="size-4" />
                </button>
            </div>
            <div className="space-y-4 px-4 py-3">
                <div className="space-y-2">
                    <label className="text-xs text-white/70">Text Content</label>
                    <textarea
                        className="w-full rounded-md border border-white/10 bg-gray-800/80 px-3 py-2 text-sm outline-none focus:border-white/30"
                        rows={3}
                        value={values.text}
                        onChange={(e)=>{
                            const newText=e.target.value
                            handleChange('text',newText)
                        }}
                    ></textarea>
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-white/70">Class Name</label>
                    <input
                        className="w-full rounded-md border border-white/10 bg-gray-800/80 px-3 py-2 text-sm outline-none focus:border-white/30"
                        type='text'
                        value={values.className}
                        onChange={(e)=>handleChange('className',e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-xs text-white/70">Padding</label>
                        <input
                            className="w-full rounded-md border border-white/10 bg-gray-800/80 px-3 py-2 text-sm outline-none focus:border-white/30"
                            type='text'
                            value={values.styles.padding}
                            onChange={(e)=>handleStyleChange('padding',e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-white/70">Margin</label>
                        <input
                            className="w-full rounded-md border border-white/10 bg-gray-800/80 px-3 py-2 text-sm outline-none focus:border-white/30"
                            type='text'
                            value={values.styles.margin}
                            onChange={(e)=>handleStyleChange('margin',e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-white/70">Font Size</label>
                        <input
                            className="w-full rounded-md border border-white/10 bg-gray-800/80 px-3 py-2 text-sm outline-none focus:border-white/30"
                            type='text'
                            value={values.styles.fontSize}
                            onChange={(e)=>handleStyleChange('fontSize',e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-white/70">Background</label>
                        <input
                            className="h-10 w-full rounded-md border border-white/10 bg-gray-800/80 p-1"
                            type='color'
                            value={values.styles.backgroundColor==='rgba(0, 0, 0, 0)' ? '#ffffff' : values.styles.backgroundColor}
                            onChange={(e)=>handleStyleChange('backgroundColor',e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-white/70">Text Color</label>
                        <input
                            className="h-10 w-full rounded-md border border-white/10 bg-gray-800/80 p-1"
                            type='color'
                            value={values.styles.color}
                            onChange={(e)=>handleStyleChange('color',e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditorPanel