import { useState } from 'react'

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const menuItems = ['File', 'Edit', 'View', 'Help']

  return (
    <div className="h-8 bg-[#2d2d2d] border-b border-[#404040] flex items-center px-2">
      {menuItems.map((item) => (
        <button
          key={item}
          onClick={() => setActiveMenu(activeMenu === item ? null : item)}
          className={`px-3 py-1 text-sm hover:bg-[#404040] rounded ${
            activeMenu === item ? 'bg-[#404040]' : ''
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  )
}