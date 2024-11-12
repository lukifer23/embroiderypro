import { 
  MousePointer2,
  Hand,
  Square,
  Pencil,
  Type,
  Image
} from 'lucide-react'

const tools = [
  { icon: MousePointer2, label: 'Select (V)' },
  { icon: Hand, label: 'Hand (H)' },
  { icon: Square, label: 'Frame (F)' },
  { icon: Pencil, label: 'Pen (P)' },
  { icon: Type, label: 'Text (T)' },
  { icon: Image, label: 'Image (I)' }
]

export function Toolbar() {
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 bg-[#2c2c2c] rounded-md border border-[#1e1e1e] shadow-lg p-0.5">
      {tools.map((Tool) => (
        <button
          key={Tool.label}
          className="p-2 rounded hover:bg-[#3e3e3e] text-[#adadad] hover:text-white transition-colors"
          title={Tool.label}
        >
          <Tool.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}