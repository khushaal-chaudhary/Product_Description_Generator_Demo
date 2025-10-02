import { useState } from 'react';

function App() {
  const [mode, setMode] = useState('attributes');
  
  // State for Attributes Form
  const [productAttributes, setProductAttributes] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for Image Form
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSeoKeywords, setImageSeoKeywords] = useState('');


  const handleAttributeSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDescription('');

    fetch('http://127.0.0.1:8000/generate-description/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attributes: productAttributes, keywords: seoKeywords }),
    })
    .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
    .then(data => setDescription(data.description))
    .catch(err => {
      setError('Failed to generate description. Please ensure the backend server is running.');
      console.error('Error:', err);
    })
    .finally(() => setIsLoading(false));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleImageSubmit = (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setDescription('');

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('keywords', imageSeoKeywords);

    fetch('http://127.0.0.1:8000/generate-from-image/', {
      method: 'POST',
      body: formData, // No 'Content-Type' header needed, browser sets it for FormData
    })
    .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
    .then(data => {
      setDescription(data.description);
    })
    .catch(err => {
      setError('Failed to generate description from image. Please ensure the backend server is running.');
      console.error('Error:', err);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            AI Product Description Generator
          </h1>
          <p className="text-gray-400 mt-2">Create compelling product descriptions with the power of AI.</p>
        </header>

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

        <main className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-2xl">
          {mode === 'image' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Image-to-Description Mode</h2>
              <form onSubmit={handleImageSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Product Image
                    </label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-600 px-6 py-10">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="mt-4 flex text-sm leading-6 text-gray-400">
                          <label htmlFor="image-upload" className="relative cursor-pointer rounded-md bg-gray-800 font-semibold text-purple-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-purple-500">
                            <span>Upload a file</span>
                            <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-400">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-300 mb-2">Image Preview:</p>
                      <img src={imagePreview} alt="Selected preview" className="rounded-lg max-h-60 w-auto mx-auto shadow-lg" />
                    </div>
                  )}

                   <div>
                    <label htmlFor="image-seo" className="block text-sm font-medium text-gray-300 mb-2">
                      SEO Keywords (Optional)
                    </label>
                    <input
                      type="text"
                      id="image-seo"
                      value={imageSeoKeywords}
                      onChange={(e) => setImageSeoKeywords(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      placeholder="Enter keywords, separated by commas"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !selectedImage}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  >
                    {isLoading ? 'Generating...' : 'Generate from Image'}
                  </button>
                </div>
              </form>
            </div>
          )}
          {mode === 'attributes' && (
             <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Attribute-to-Description Mode</h2>
              <form onSubmit={handleAttributeSubmit}>
                <div className="space-y-6">
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
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  >
                    {isLoading ? 'Generating...' : 'Generate Description'}
                  </button>
                </div>
              </form>
            </div>
          )}
           {(error || description) && (
              <div className="mt-8 pt-6 border-t border-gray-700">
                {error && (
                  <div className="mb-4 bg-red-900 border border-red-700 text-red-200 p-3 rounded-md text-center">
                    {error}
                  </div>
                )}
                {description && (
                  <div>
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

