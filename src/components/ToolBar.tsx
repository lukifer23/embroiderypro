import { motion } from 'framer-motion';
import {
  CursorArrowRaysIcon,
  HandRaisedIcon,
  Square2StackIcon,
  PencilIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const tools = [
  { id: 'move', icon: CursorArrowRaysIcon, shortcut: 'V' },
  { id: 'hand', icon: HandRaisedIcon, shortcut: 'H' },
  { id: 'frame', icon: Square2StackIcon, shortcut: 'F' },
  { id: 'pen', icon: PencilIcon, shortcut: 'P' },
  { id: 'image', icon: PhotoIcon, shortcut: 'I' }
];

export default function ToolBar() {
  return (
    <motion.div 
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-figma-surface rounded-lg border border-figma-border shadow-lg"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      <div className="p-1 space-y-0.5">
        {tools.map(tool => (
          <motion.button
            key={tool.id}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-figma-hover text-figma-text-secondary hover:text-figma-text-primary transition-colors duration-150"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`${tool.id.charAt(0).toUpperCase() + tool.id.slice(1)} (${tool.shortcut})`}
          >
            <tool.icon className="w-4 h-4" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}