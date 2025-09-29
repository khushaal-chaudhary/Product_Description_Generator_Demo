    import { useState } from 'react';

    function App() {
      const [mode, setMode] = useState('attributes'); // Default to attributes for easier testing
      
      // State for the Attributes Form
      const [productAttributes, setProductAttributes] = useState('');
      const [seoKeywords, setSeoKeywords] = useState('');
      const [description, setDescription] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState(null);

      const handleAttributeSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setDescription('');

        fetch('http://127.0.0.1:8000/generate-description/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attributes: productAttributes,
            keywords: seoKeywords,
          }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setDescription(data.description);
        })
        .catch(err => {
          setError('Failed to generate description. Please ensure the backend server is running.');
          console.error('Error:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
      };


      return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 md:p-10">
          <div className="w-full max-w-4xl">
            {/* ... rest of the JSX is the same ... */}
            {/* Header */}
            <header className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                AI Product Description Generator
              </h1>
              <p className="text-gray-400 mt-2">Create compelling product descriptions with the power of AI.</p>
            </header>

            {/* Mode Selector */}
            <div className="flex justify-center mb-8 bg-gray-800 rounded-lg p-1.5 shadow-inner">
              <button
                onClick={() => setMode('image')}
                className={`w-full py-2 px-4 rounded-md transition-colors font-semibold ${mode === 'image' ? 'bg-purple-600 shadow-md' : 'hover:bg-gray-700'}`}
              >
                Generate from Image
              </button>
              <button
                onClick={() => setMode('attributes')}
                className={`w-full py-2 px-4 rounded-md transition-colors font-semibold ${mode === 'attributes' ? 'bg-purple-600 shadow-md' : 'hover:bg-gray-700'}`}
              >
                Generate from Attributes
              </button>
            </div>

            {/* Main Content Area */}
            <main className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl">
              {mode === 'image' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-center">Image-to-Description Mode</h2>
                  <div className="text-center text-gray-500 py-10">[Image Upload Form Will Go Here]</div>
                </div>
              )}
              {mode === 'attributes' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-center">Attribute-to-Description Mode</h2>
                  <form onSubmit={handleAttributeSubmit}>
                    <div className="space-y-6">
                      {/* Product Attributes Input */}
                      <div>
                        <label htmlFor="attributes" className="block text-sm font-medium text-gray-300 mb-2">
                          Product Attributes (e.g., "red t-shirt, cotton, size M")
                        </label>
                        <input
                          type="text"
                          id="attributes"
                          value={productAttributes}
                          onChange={(e) => setProductAttributes(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                          placeholder="Enter product features, separated by commas"
                          required
                        />
                      </div>

                      {/* SEO Keywords Input */}
                      <div>
                        <label htmlFor="seo" className="block text-sm font-medium text-gray-300 mb-2">
                          SEO Keywords (e.g., "summer fashion, casual wear")
                        </label>
                        <input
                          type="text"
                          id="seo"
                          value={seoKeywords}
                          onChange={(e) => setSeoKeywords(e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                          placeholder="Enter keywords, separated by commas"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                      >
                        {isLoading ? 'Generating...' : 'Generate Description'}
                      </button>
                    </div>
                  </form>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="mt-6 bg-red-900 border border-red-700 text-red-200 p-3 rounded-md text-center">
                      {error}
                    </div>
                  )}

                  {/* Result Area */}
                  {description && (
                    <div className="mt-8 pt-6 border-t border-gray-700">
                      <h3 className="text-xl font-semibold mb-3">Generated Description:</h3>
                      <div className="bg-gray-900 p-4 rounded-md text-gray-200 whitespace-pre-wrap">
                        {description}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      );
    }

    export default App;
    

