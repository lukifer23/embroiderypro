import { Link, useLocation } from 'react-router-dom';
import {
  Square2StackIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function AppHeader() {
  const location = useLocation();
  
  return (
    <header className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-3">
      <div className="flex items-center space-x-2">
        <Link to="/" className="flex items-center space-x-2">
          <Square2StackIcon className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium">Design Studio</span>
        </Link>
        <div className="h-4 w-px bg-gray-200 mx-2" />
        <nav className="flex items-center space-x-1">
          {[
            { path: '/convert', icon: ArrowPathIcon, label: 'Convert' },
            { path: '/quilt-designer', icon: Squares2X2Icon, label: 'Quilt' },
            { path: '/embroidery-designer', icon: Square2StackIcon, label: 'Embroidery' },
          ].map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`inline-flex items-center px-2 h-7 rounded-md text-xs font-medium ${
                location.pathname === path
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5 mr-1" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center space-x-1">
        <button className="p-1.5 rounded-md text-gray-500 hover:bg-gray-50">
          <Cog6ToothIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}