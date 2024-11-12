import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface MenuItem {
  label: string
  shortcut?: string
}

interface MenuDropdownProps {
  label: string
  items: MenuItem[]
}

export function MenuDropdown({ label, items }: MenuDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="rounded px-2 py-1 text-sm text-[#adadad] hover:bg-[#383838] hover:text-white">
          {label}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] rounded-md border border-[#383838] bg-[#2c2c2c] p-1 shadow-lg"
          sideOffset={5}
        >
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.label}
              className="flex cursor-default items-center justify-between rounded px-2 py-1.5 text-sm text-[#adadad] outline-none hover:bg-[#383838] hover:text-white"
            >
              {item.label}
              {item.shortcut && (
                <span className="text-xs text-[#666666]">{item.shortcut}</span>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}