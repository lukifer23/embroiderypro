export function RightPanel() {
  return (
    <div className="w-60 bg-[#2d2d2d] border-l border-[#404040] p-2">
      <div className="text-sm font-medium mb-2">Properties</div>
      <div className="space-y-2">
        <div className="text-sm">
          <label className="block text-gray-400 mb-1">Width</label>
          <input
            type="number"
            className="w-full bg-[#1e1e1e] border border-[#404040] rounded px-2 py-1"
            defaultValue={800}
          />
        </div>
        <div className="text-sm">
          <label className="block text-gray-400 mb-1">Height</label>
          <input
            type="number"
            className="w-full bg-[#1e1e1e] border border-[#404040] rounded px-2 py-1"
            defaultValue={600}
          />
        </div>
      </div>
    </div>
  )
}