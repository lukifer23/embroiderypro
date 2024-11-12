import AppHeader from '../components/AppHeader';
import DesignCanvas from '../components/DesignCanvas';

export default function EmbroideryDesigner() {
  return (
    <div className="h-screen flex flex-col">
      <AppHeader />
      <DesignCanvas gridSize={20} />
    </div>
  );
}