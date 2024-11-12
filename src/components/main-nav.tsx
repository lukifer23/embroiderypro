import { MenuDropdown } from './menu-dropdown'

const fileMenu = [
  { label: 'New File', shortcut: '⌘N' },
  { label: 'Open...', shortcut: '⌘O' },
  { label: 'Save', shortcut: '⌘S' },
]

const editMenu = [
  { label: 'Undo', shortcut: '⌘Z' },
  { label: 'Redo', shortcut: '⌘⇧Z' },
  { label: 'Cut', shortcut: '⌘X' },
]

const viewMenu = [
  { label: 'Zoom In', shortcut: '⌘+' },
  { label: 'Zoom Out', shortcut: '⌘-' },
  { label: 'Fit', shortcut: '⌘0' },
]

export function MainNav() {
  return (
    <nav className="h-8 bg-figma-surface border-b border-figma-border flex items-center px-2">
      <div className="flex items-center gap-2">
        <MenuDropdown label="File" items={fileMenu} />
        <MenuDropdown label="Edit" items={editMenu} />
        <MenuDropdown label="View" items={viewMenu} />
      </div>
      <div className="mx-2 h-3 w-px bg-figma-border" />
      <div className="text-[13px] text-figma-text-secondary">
        <span className="text-figma-text">Design Studio</span>
        <span className="mx-1 text-[#666]">/</span>
        <span>Untitled</span>
      </div>
    </nav>
  )
}