import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  shortcut?: string;
}

function MenuItem({ icon, label, onClick, shortcut }: MenuItemProps) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={onClick}
          className={`${
            active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
          } group flex w-full items-center px-3 py-2 text-sm gap-2`}
        >
          <span className="w-4 h-4">{icon}</span>
          <span className="flex-1">{label}</span>
          {shortcut && (
            <span className="text-xs text-gray-500">{shortcut}</span>
          )}
        </button>
      )}
    </Menu.Item>
  );
}

interface MenuGroupProps {
  label: string;
  items: MenuItemProps[];
}

function MenuGroup({ label, items }: MenuGroupProps) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded">
        {label}
        <ChevronDownIcon className="h-4 w-4" />
      </Menu.Button>
      <Menu.Items className="absolute left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 focus:outline-none">
        <div className="py-1">
          {items.map((item, index) => (
            <MenuItem key={index} {...item} />
          ))}
        </div>
      </Menu.Items>
    </Menu>
  );
}

export default function MenuBar() {
  return (
    <div className="h-8 px-2 flex items-center gap-1 bg-white border-b border-gray-200">
      <MenuGroup
        label="File"
        items={[
          { icon: "📄", label: "New", onClick: () => {}, shortcut: "⌘N" },
          { icon: "💾", label: "Save", onClick: () => {}, shortcut: "⌘S" },
          { icon: "📤", label: "Export", onClick: () => {}, shortcut: "⌘E" },
        ]}
      />
      <MenuGroup
        label="Edit"
        items={[
          { icon: "↩️", label: "Undo", onClick: () => {}, shortcut: "⌘Z" },
          { icon: "↪️", label: "Redo", onClick: () => {}, shortcut: "⌘⇧Z" },
          { icon: "📋", label: "Copy", onClick: () => {}, shortcut: "⌘C" },
          { icon: "📋", label: "Paste", onClick: () => {}, shortcut: "⌘V" },
        ]}
      />
      <MenuGroup
        label="View"
        items={[
          { icon: "🔍", label: "Zoom In", onClick: () => {}, shortcut: "⌘+" },
          { icon: "🔍", label: "Zoom Out", onClick: () => {}, shortcut: "⌘-" },
          { icon: "📏", label: "Show Grid", onClick: () => {}, shortcut: "⌘G" },
        ]}
      />
    </div>
  );
}