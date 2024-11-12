interface ToolSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function ToolSection({ title, children }: ToolSectionProps) {
  return (
    <div>
      <h3 className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
        {title}
      </h3>
      <div className="py-1">
        {children}
      </div>
    </div>
  );
}