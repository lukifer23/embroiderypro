import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Layers,
  Image,
  FileText,
  Settings
} from 'lucide-react'

const tabs = [
  { icon: Layers, label: 'Layers' },
  { icon: Image, label: 'Assets' },
  { icon: FileText, label: 'Pages' },
  { icon: Settings, label: 'Settings' }
]

export function LeftSidebar() {
  return (
    <div className="w-[240px] bg-[#2c2c2c] border-r border-[#1e1e1e] flex">
      <div className="w-10 bg-[#252525] py-2 flex flex-col items-center gap-1">
        {tabs.map((Tab) => (
          <button
            key={Tab.label}
            className="p-2 rounded text-[#adadad] hover:bg-[#3e3e3e] hover:text-white transition-colors"
            title={Tab.label}
          >
            <Tab.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      
      <div className="flex-1">
        <div className="h-9 border-b border-[#1e1e1e] flex items-center px-3">
          <span className="text-[13px] font-medium text-[#adadad]">Layers</span>
        </div>
        <ScrollArea className="h-[calc(100vh-2.25rem)]">
          <div className="p-2">
            <div className="text-[13px] text-[#666]">No layers yet</div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}