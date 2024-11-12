import AppHeader from '../components/AppHeader';
import DesignCanvas from '../components/DesignCanvas';

export default function QuiltDesigner() {
  return (
    <div className="h-screen flex flex-col">
      <AppHeader />
      <DesignCanvas gridSize={50} />
    </div>
  );
}