import { useEffect } from 'react';
import { motion } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  MousePointer2, 
  Hand, 
  Shapes,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Star,
  Heart,
  Pentagon,
  Octagon,
  Pencil, 
  Type, 
  Image,
  Trash2,
  Grid,
  MinusIcon
} from 'lucide-react';
import { useDesign } from '../contexts/DesignContext';
import type { Tool } from '../contexts/DesignContext';

const mainTools = [
  { id: 'select' as Tool, icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'hand' as Tool, icon: Hand, label: 'Hand', shortcut: 'H' },
  { id: 'shapes' as Tool, icon: Shapes, label: 'Shapes', shortcut: 'S' },
  { id: 'pen' as Tool, icon: Pencil, label: 'Pen', shortcut: 'P' },
  { id: 'text' as Tool, icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'image' as Tool, icon: Image, label: 'Image', shortcut: 'I' },
  { id: 'line' as Tool, icon: MinusIcon, label: 'Line', shortcut: 'L' }
];

const shapes = [
  { id: 'frame', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'triangle', icon: Triangle, label: 'Triangle' },
  { id: 'hexagon', icon: Hexagon, label: 'Hexagon' },
  { id: 'star', icon: Star, label: 'Star' },
  { id: 'heart', icon: Heart, label: 'Heart' },
  { id: 'pentagon', icon: Pentagon, label: 'Pentagon' },
  { id: 'octagon', icon: Octagon, label: 'Octagon' }
];

export default function Toolbar() {
  const { 
    selectedTool, 
    setSelectedTool, 
    showGrid,
    setShowGrid,
    strokeWidth,
    setStrokeWidth,
    fill,
    setFill,
    isDrawingLine,
    setIsDrawingLine,
    lineStartPoint,
    setLineStartPoint
  } = useDesign();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      const tool = mainTools.find(t => t.shortcut.toLowerCase() === e.key.toLowerCase());
      if (tool) {
        setSelectedTool(tool.id);
        if (tool.id === 'line') {
          setIsDrawingLine(false);
          setLineStartPoint(null);
        }
      }
      if (e.key.toLowerCase() === 'g') {
        setShowGrid(!showGrid);
      }
      if (e.key === 'Escape' && isDrawingLine) {
        setIsDrawingLine(false);
        setLineStartPoint(null);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [setSelectedTool, showGrid, setShowGrid, isDrawingLine, setIsDrawingLine, setLineStartPoint]);

  return (
    <motion.div 
      className="absolute left-4 top-1/2 -translate-y-1/2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex flex-col gap-1 bg-figma-surface rounded-lg border border-figma-border p-1 shadow-lg">
        {mainTools.map((tool) => (
          tool.id === 'shapes' ? (
            <DropdownMenu.Root key={tool.id}>
              <DropdownMenu.Trigger asChild>
                <button
                  className={`p-2 rounded transition-colors group relative
                    ${selectedTool.startsWith('shape_') 
                      ? 'bg-figma-hover text-figma-text' 
                      : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
                    }`}
                  title={`${tool.label} (${tool.shortcut})`}
                >
                  <tool.icon className="w-4 h-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="w-72 bg-figma-surface border border-figma-border rounded-lg shadow-lg p-3 ml-2"
                  sideOffset={5}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-2">
                      {shapes.map((shape) => (
                        <button
                          key={shape.id}
                          onClick={() => setSelectedTool(`shape_${shape.id}` as Tool)}
                          className={`p-2 rounded transition-colors flex flex-col items-center gap-1
                            ${selectedTool === `shape_${shape.id}`
                              ? 'bg-figma-hover text-figma-text'
                              : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
                            }`}
                        >
                          <shape.icon className="w-4 h-4" />
                          <span className="text-xs">{shape.label}</span>
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs text-figma-text-secondary mb-2">
                        Stroke Width
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 4, 8].map((width) => (
                          <button
                            key={width}
                            onClick={() => setStrokeWidth(width)}
                            className={`flex-1 p-2 rounded transition-colors
                              ${strokeWidth === width
                                ? 'bg-figma-hover text-figma-text'
                                : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
                              }`}
                          >
                            {width}px
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-figma-text-secondary mb-2">
                        Fill Style
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFill('solid')}
                          className={`flex-1 p-2 rounded transition-colors
                            ${fill === 'solid'
                              ? 'bg-figma-hover text-figma-text'
                              : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
                            }`}
                        >
                          Solid
                        </button>
                        <button
                          onClick={() => setFill('outline')}
                          className={`flex-1 p-2 rounded transition-colors
                            ${fill === 'outline'
                              ? 'bg-figma-hover text-figma-text'
                              : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
                            }`}
                        >
                          Outline
                        </button>
                      </div>
                    </div>
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id);
                if (tool.id === 'line') {
                  setIsDrawingLine(false);
                  setLineStartPoint(null);
                }
              }}
              className={`p-2 rounded transition-colors group relative
                ${selectedTool === tool.id 
                  ? 'bg-figma-hover text-figma-text' 
                  : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
                }`}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <tool.icon className="w-4 h-4" />
            </button>
          )
        ))}

        <div className="w-full h-px bg-figma-border my-1" />
        
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded transition-colors
            ${showGrid 
              ? 'bg-figma-hover text-figma-text' 
              : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
            }`}
          title="Toggle Grid (G)"
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          className="p-2 rounded text-figma-text-secondary hover:text-red-400 hover:bg-figma-hover"
          title="Delete selected (Del)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}