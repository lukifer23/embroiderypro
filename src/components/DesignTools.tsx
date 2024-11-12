import {
  CursorArrowRaysIcon,
  Square2StackIcon,
  PhotoIcon,
  PencilIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';

export default function DesignTools() {
  return (
    <div className="w-10 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-1 space-y-1">
        <button className="p-1.5 rounded bg-indigo-50 text-indigo-600">
          <CursorArrowRaysIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 rounded text-gray-600 hover:bg-gray-50">
          <Square2StackIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 rounded text-gray-600 hover:bg-gray-50">
          <PencilIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 rounded text-gray-600 hover:bg-gray-50">
          <PhotoIcon className="h-4 w-4" />
        </button>
      </div>
      
      <div className="mt-auto p-1 border-t border-gray-200 space-y-1">
        <button className="p-1.5 rounded text-gray-600 hover:bg-gray-50">
          <ArrowUturnLeftIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 rounded text-gray-600 hover:bg-gray-50">
          <ArrowUturnRightIcon className="h-4 w-4" />
        </button>
        <button className="p-1.5 rounded text-gray-600 hover:bg-gray-50">
          <ArrowsPointingOutIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}