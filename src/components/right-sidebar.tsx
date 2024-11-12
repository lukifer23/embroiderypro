import { ScrollArea } from '@/components/ui/scroll-area'

export function RightSidebar() {
  return (
    <div className="w-[240px] bg-[#2c2c2c] border-l border-[#1e1e1e]">
      <div className="h-9 border-b border-[#1e1e1e] flex items-center px-3">
        <span className="text-[13px] font-medium text-[#adadad]">Properties</span>
      </div>
      <ScrollArea className="h-[calc(100vh-2.25rem)]">
        <div className="p-3 space-y-4">
          <div>
            <label className="block text-[11px] text-[#666] mb-1.5">Width</label>
            <input
              type="number"
              className="w-full bg-[#1e1e1e] border border-[#1e1e1e] rounded px-2 py-1 text-[13px] text-[#adadad]"
              defaultValue={800}
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#666] mb-1.5">Height</label>
            <input
              type="number"
              className="w-full bg-[#1e1e1e] border border-[#1e1e1e] rounded px-2 py-1 text-[13px] text-[#adadad]"
              defaultValue={600}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}