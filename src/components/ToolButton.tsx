interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

export default function ToolButton({ icon, label, onClick, active }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm ${
        active 
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-gray-700 hover:bg-gray-50'
      } transition-colors`}
    >
      <span className="w-4 h-4">{icon}</span>
      <span className="font-medium truncate">{label}</span>
    </button>
  );
}