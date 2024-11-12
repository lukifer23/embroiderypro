import { useState } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import { DesignProvider } from './contexts/DesignContext';

export default function App() {
  return (
    <DesignProvider>
      <div className="h-screen flex flex-col bg-figma-bg text-figma-text">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <Canvas />
        </div>
      </div>
    </DesignProvider>
  );
}