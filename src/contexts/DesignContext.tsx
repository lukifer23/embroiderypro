import React, { createContext, useContext, useState } from 'react';
import { fabric } from 'fabric';

export type Tool = 'select' | 'hand' | 'shapes' | 'pen' | 'text' | 'image' | 'line' |
  'shape_rectangle' | 'shape_circle' | 'shape_triangle' | 'shape_hexagon' | 
  'shape_star' | 'shape_heart' | 'shape_pentagon' | 'shape_octagon';

export interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  data: any;
}

interface DesignContextType {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  fabricCanvas: fabric.Canvas | null;
  setFabricCanvas: (canvas: fabric.Canvas | null) => void;
  selectedObject: fabric.Object | null;
  setSelectedObject: (obj: fabric.Object | null) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  exportArea: fabric.Rect | null;
  setExportArea: (area: fabric.Rect | null) => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [layers, setLayers] = useState<Layer[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [exportArea, setExportArea] = useState<fabric.Rect | null>(null);

  return (
    <DesignContext.Provider value={{
      selectedTool,
      setSelectedTool,
      layers,
      setLayers,
      showGrid,
      setShowGrid,
      gridSize,
      setGridSize,
      currentColor,
      setCurrentColor,
      fabricCanvas,
      setFabricCanvas,
      selectedObject,
      setSelectedObject,
      sidebarExpanded,
      setSidebarExpanded,
      exportArea,
      setExportArea
    }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const context = useContext(DesignContext);
  if (context === undefined) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
}