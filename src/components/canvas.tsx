export function Canvas() {
  return (
    <div className="flex-1 bg-[#1e1e1e] relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[600px] bg-white rounded-lg shadow-2xl" />
      </div>
      
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <button className="px-2 py-1 text-xs bg-[#2c2c2c] text-[#adadad] rounded hover:bg-[#3e3e3e] transition-colors">
          100%
        </button>
      </div>
    </div>
  )
}