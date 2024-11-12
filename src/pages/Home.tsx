import { Link } from 'react-router-dom';
import { DocumentArrowUpIcon, SwatchIcon, ScissorsIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-12">
        Embroidery & Quilting Studio
      </h1>
      
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Link
          to="/convert"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <DocumentArrowUpIcon className="h-12 w-12 text-indigo-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Convert Files</h2>
          <p className="text-gray-600">
            Convert images and PDFs to embroidery machine formats
          </p>
        </Link>

        <Link
          to="/quilt-designer"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <SwatchIcon className="h-12 w-12 text-indigo-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Quilt Designer</h2>
          <p className="text-gray-600">
            Design beautiful quilting patterns with our easy-to-use tools
          </p>
        </Link>

        <Link
          to="/embroidery-designer"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <ScissorsIcon className="h-12 w-12 text-indigo-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Embroidery Designer</h2>
          <p className="text-gray-600">
            Create custom embroidery designs from scratch
          </p>
        </Link>
      </div>

      <section className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Projects</h2>
        <div className="grid gap-4">
          {/* Sample projects - will be dynamic in the future */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Flower Pattern</h3>
                <p className="text-sm text-gray-500">Embroidery • 2 hours ago</p>
              </div>
              <button className="text-indigo-600 hover:text-indigo-800">
                Open
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}