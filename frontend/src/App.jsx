import { useState } from 'react';

function App() {
  const [mode, setMode] = useState('image'); // 'image' or 'attributes'

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            AI Product Description Generator
          </h1>
          <p className="text-gray-400 mt-2">Create compelling product descriptions with the power of AI.</p>
        </header>

        {/* Mode Selector */}
        <div className="flex justify-center mb-8 bg-gray-800 rounded-lg p-1.5">
          <button
            onClick={() => setMode('image')}
            className={`w-full py-2 px-4 rounded-md transition-colors ${mode === 'image' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
          >
            Generate from Image
          </button>
          <button
            onClick={() => setMode('attributes')}
            className={`w-full py-2 px-4 rounded-md transition-colors ${mode === 'attributes' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
          >
            Generate from Attributes
          </button>
        </div>

        {/* Main Content Area */}
        <main className="bg-gray-800 p-8 rounded-lg shadow-2xl">
          {mode === 'image' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Image-to-Description Mode</h2>
              {/* Placeholder for image upload form */}
              <div className="text-center text-gray-500">[Image Upload Form Will Go Here]</div>
            </div>
          )}
          {mode === 'attributes' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Attribute-to-Description Mode</h2>
              {/* Placeholder for attributes form */}
              <div className="text-center text-gray-500">[Attributes Form Will Go Here]</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

