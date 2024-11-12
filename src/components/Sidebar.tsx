import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDesign } from '../contexts/DesignContext';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  MousePointer2, Hand, Square, Circle, Triangle, 
  Hexagon, Star, Heart, Pentagon, Octagon, Type, 
  Pencil, ChevronLeft, ChevronRight, Image, Shapes,
  Grid, Crop
} from 'lucide-react';
import { fabric } from 'fabric';

const shapes = [
  { id: 'shape_rectangle', icon: Square, label: 'Rectangle (R)' },
  { id: 'shape_circle', icon: Circle, label: 'Circle (C)' },
  { id: 'shape_triangle', icon: Triangle, label: 'Triangle (T)' },
  { id: 'shape_hexagon', icon: Hexagon, label: 'Hexagon' },
  { id: 'shape_star', icon: Star, label: 'Star' },
  { id: 'shape_heart', icon: Heart, label: 'Heart' },
  { id: 'shape_pentagon', icon: Pentagon, label: 'Pentagon' },
  { id: 'shape_octagon', icon: Octagon, label: 'Octagon' }
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    fabricCanvas,
    selectedTool,
    setSelectedTool,
    setSidebarExpanded,
    setExportArea,
    currentColor
  } = useDesign();

  const handleToolClick = (toolId: string) => {
    setSelectedTool(toolId);
    if (!fabricCanvas) return;

    // Reset all modes
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = true;
    fabricCanvas.defaultCursor = 'default';
    fabricCanvas.hoverCursor = 'pointer';
    fabricCanvas.moveCursor = 'move';

    // Remove all event listeners
    fabricCanvas.off('mouse:down');
    fabricCanvas.off('mouse:move');
    fabricCanvas.off('mouse:up');

    switch (toolId) {
      case 'select':
        fabricCanvas.selection = true;
        break;

      case 'hand':
        fabricCanvas.selection = false;
        fabricCanvas.defaultCursor = 'grab';
        fabricCanvas.hoverCursor = 'grab';
        fabricCanvas.moveCursor = 'grabbing';
        let isDragging = false;
        let lastPosX = 0;
        let lastPosY = 0;

        fabricCanvas.on('mouse:down', (e) => {
          isDragging = true;
          lastPosX = e.e.clientX;
          lastPosY = e.e.clientY;
        });

        fabricCanvas.on('mouse:move', (e) => {
          if (!isDragging) return;
          const vpt = fabricCanvas.viewportTransform!;
          vpt[4] += e.e.clientX - lastPosX;
          vpt[5] += e.e.clientY - lastPosY;
          lastPosX = e.e.clientX;
          lastPosY = e.e.clientY;
          fabricCanvas.requestRenderAll();
        });

        fabricCanvas.on('mouse:up', () => {
          isDragging = false;
        });
        break;

      case 'pen':
        fabricCanvas.isDrawingMode = true;
        fabricCanvas.freeDrawingBrush.width = 2;
        fabricCanvas.freeDrawingBrush.color = currentColor;
        break;

      case 'text':
        fabricCanvas.on('mouse:down', (e) => {
          if (!e.pointer) return;
          const text = new fabric.IText('Click to edit', {
            left: e.pointer.x,
            top: e.pointer.y,
            fontSize: 20,
            fill: currentColor
          });
          fabricCanvas.add(text);
          fabricCanvas.setActiveObject(text);
        });
        break;

      default:
        if (toolId.startsWith('shape_')) {
          fabricCanvas.on('mouse:down', (e) => {
            if (!e.pointer) return;
            let shape;

            switch (toolId) {
              case 'shape_rectangle':
                shape = new fabric.Rect({
                  left: e.pointer.x,
                  top: e.pointer.y,
                  width: 100,
                  height: 100,
                  fill: currentColor
                });
                break;
              case 'shape_circle':
                shape = new fabric.Circle({
                  left: e.pointer.x,
                  top: e.pointer.y,
                  radius: 50,
                  fill: currentColor
                });
                break;
              case 'shape_triangle':
                shape = new fabric.Triangle({
                  left: e.pointer.x,
                  top: e.pointer.y,
                  width: 100,
                  height: 100,
                  fill: currentColor
                });
                break;
              // Add other shapes...
            }

            if (shape) {
              fabricCanvas.add(shape);
              fabricCanvas.setActiveObject(shape);
            }
          });
        }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !fabricCanvas) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      fabric.Image.fromURL(event.target.result.toString(), (img) => {
        const maxWidth = fabricCanvas.width! * 0.8;
        const maxHeight = fabricCanvas.height! * 0.8;
        const scale = Math.min(
          maxWidth / img.width!,
          maxHeight / img.height!
        );

        img.scale(scale);
        img.set({
          left: (fabricCanvas.width! - img.width! * scale) / 2,
          top: (fabricCanvas.height! - img.height! * scale) / 2
        });

        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);

        // Create selection area for export
        const rect = new fabric.Rect({
          left: img.left,
          top: img.top,
          width: img.width! * scale,
          height: img.height! * scale,
          fill: 'transparent',
          stroke: '#00ff00',
          strokeWidth: 2,
          strokeDashArray: [5, 5]
        });
        
        setExportArea(rect);
        fabricCanvas.add(rect);
        fabricCanvas.renderAll();
      });
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <motion.div 
      className={`bg-figma-surface border-r border-figma-border flex flex-col ${
        isExpanded ? 'w-48' : 'w-12'
      }`}
      initial={false}
      animate={{ width: isExpanded ? 192 : 48 }}
    >
      <div className="p-1 space-y-0.5">
        <button
          onClick={() => handleToolClick('select')}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
            selectedTool === 'select'
              ? 'bg-figma-hover text-figma-text'
              : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
          }`}
        >
          <MousePointer2 className="w-4 h-4" />
          {isExpanded && <span>Select (V)</span>}
        </button>

        <button
          onClick={() => handleToolClick('hand')}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
            selectedTool === 'hand'
              ? 'bg-figma-hover text-figma-text'
              : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
          }`}
        >
          <Hand className="w-4 h-4" />
          {isExpanded && <span>Hand (H)</span>}
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                selectedTool.startsWith('shape_')
                  ? 'bg-figma-hover text-figma-text'
                  : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
              }`}
            >
              <Shapes className="w-4 h-4" />
              {isExpanded && <span>Shapes (S)</span>}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[180px] bg-figma-surface rounded-md shadow-lg border border-figma-border p-1"
              sideOffset={5}
            >
              {shapes.map((shape) => (
                <DropdownMenu.Item
                  key={shape.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover outline-none cursor-default"
                  onSelect={() => handleToolClick(shape.id)}
                >
                  <shape.icon className="w-4 h-4" />
                  <span>{shape.label}</span>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <button
          onClick={() => handleToolClick('text')}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
            selectedTool === 'text'
              ? 'bg-figma-hover text-figma-text'
              : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
          }`}
        >
          <Type className="w-4 h-4" />
          {isExpanded && <span>Text (T)</span>}
        </button>

        <button
          onClick={() => handleToolClick('pen')}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
            selectedTool === 'pen'
              ? 'bg-figma-hover text-figma-text'
              : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
          }`}
        >
          <Pencil className="w-4 h-4" />
          {isExpanded && <span>Pen (P)</span>}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
            selectedTool === 'image'
              ? 'bg-figma-hover text-figma-text'
              : 'text-figma-text-secondary hover:text-figma-text hover:bg-figma-hover'
          }`}
        >
          <Image className="w-4 h-4" />
          {isExpanded && <span>Import Image</span>}
        </button>
      </div>

      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          setSidebarExpanded(!isExpanded);
        }}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-figma-surface border border-figma-border rounded-full flex items-center justify-center text-figma-text-secondary hover:text-figma-text"
      >
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </motion.div>
  );
}