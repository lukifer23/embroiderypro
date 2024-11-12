import { Link, useLocation } from 'react-router-dom';
import {
  Square2StackIcon,
  ArrowPathIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const location = useLocation();
  
  return (
    <nav className="h-12 bg-white border-b border-gray-200">
      <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5">
          <Square2StackIcon className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-semibold text-gray-900">Design Studio</span>
        </Link>
        
        <div className="flex h-full">
          {[
            { path: '/convert', icon: ArrowPathIcon, label: 'Convert' },
            { path: '/quilt-designer', icon: Squares2X2Icon, label: 'Quilt' },
            { path: '/embroidery-designer', icon: Square2StackIcon, label: 'Embroidery' },
          ].map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-1.5 px-3 h-full border-b-2 text-sm font-medium ${
                location.pathname === path
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}