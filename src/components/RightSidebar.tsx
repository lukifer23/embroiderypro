export default function RightSidebar() {
  return (
    <div className="w-60 bg-[#2c2c2c] border-l border-[#404040]">
      <div className="h-9 border-b border-[#404040] flex items-center px-3">
        <span className="text-[13px] font-medium text-[#adadad]">Properties</span>
      </div>
      <div className="p-3 space-y-4">
        <div>
          <label className="block text-[11px] text-[#666666] mb-1.5">Width</label>
          <input
            type="number"
            className="w-full bg-[#1e1e1e] border border-[#404040] rounded px-2 py-1 text-[13px] text-[#adadad]"
            defaultValue={800}
          />
        </div>
        <div>
          <label className="block text-[11px] text-[#666666] mb-1.5">Height</label>
          <input
            type="number"
            className="w-full bg-[#1e1e1e] border border-[#404040] rounded px-2 py-1 text-[13px] text-[#adadad]"
            defaultValue={600}
          />
        </div>
      </div>
    </div>
  )
}