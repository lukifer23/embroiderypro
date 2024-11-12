import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileConverter() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Handle file conversion here
        console.log('File loaded:', file.name);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf']
    }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Convert Files</h1>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        <p className="text-lg mb-2">
          {isDragActive
            ? "Drop the files here..."
            : "Drag 'n' drop files here, or click to select files"}
        </p>
        <p className="text-sm text-gray-500">
          Supports PNG, JPG, GIF, and PDF files
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Conversion Queue</h2>
        {/* Queue will be implemented here */}
        <p className="text-gray-500 text-center py-4">No files in queue</p>
      </div>
    </div>
  );
}