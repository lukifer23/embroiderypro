import { Menu } from '@headlessui/react';

const menuItems = {
  file: [
    { label: 'New', shortcut: '⌘N' },
    { label: 'Open', shortcut: '⌘O' },
    { label: 'Save', shortcut: '⌘S' },
    { label: 'Export', shortcut: '⌘E' },
  ],
  edit: [
    { label: 'Undo', shortcut: '⌘Z' },
    { label: 'Redo', shortcut: '⌘⇧Z' },
    { label: 'Cut', shortcut: '⌘X' },
    { label: 'Copy', shortcut: '⌘C' },
    { label: 'Paste', shortcut: '⌘V' },
  ],
  view: [
    { label: 'Zoom In', shortcut: '⌘+' },
    { label: 'Zoom Out', shortcut: '⌘-' },
    { label: 'Fit to Screen', shortcut: '⌘0' },
    { label: 'Show Grid', shortcut: '⌘G' },
  ],
};

function MenuDropdown({ label, items }: { label: string; items: typeof menuItems.file }) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="px-2 py-1 text-figma text-figma-text-secondary hover:text-figma-text-primary hover:bg-figma-hover rounded-sm">
        {label}
      </Menu.Button>
      <Menu.Items className="absolute left-0 mt-1 w-56 bg-figma-surface rounded-md shadow-lg border border-figma-border py-1 z-50">
        {items.map((item) => (
          <Menu.Item key={item.label}>
            {({ active }) => (
              <button
                className={`w-full px-3 py-1 text-left text-figma flex justify-between items-center ${
                  active ? 'bg-figma-hover text-figma-text-primary' : 'text-figma-text-secondary'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-figma-text-tertiary">{item.shortcut}</span>
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}

export default function TopMenuBar() {
  return (
    <div className="h-7 flex items-center border-b border-figma-border bg-figma-surface px-1">
      <div className="flex items-center gap-1">
        <MenuDropdown label="File" items={menuItems.file} />
        <MenuDropdown label="Edit" items={menuItems.edit} />
        <MenuDropdown label="View" items={menuItems.view} />
      </div>
      <div className="mx-2 h-3 w-px bg-figma-border" />
      <div className="text-figma text-figma-text-secondary">
        <span className="text-figma-blue hover:text-figma-blue-hover cursor-pointer">Design Studio</span>
        <span className="mx-1 text-figma-text-tertiary">/</span>
        <span>Untitled</span>
      </div>
    </div>
  );
}