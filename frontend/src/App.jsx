import { useState } from 'react';

// Use HF Space API in production
const API_BASE_URL = 'https://khushaal-product-description-generator.hf.space';

function App() {
  const [mode, setMode] = useState('attributes');
  const [productAttributes, setProductAttributes] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSeoKeywords, setImageSeoKeywords] = useState('');

  const scrollToGenerator = () => {
    document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
  };

  const handleAttributeSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDescription('');

    fetch(`${API_BASE_URL}/generate-description/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attributes: productAttributes, keywords: seoKeywords }),
    })
    .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
    .then(data => setDescription(data.description))
    .catch(err => {
      setError('Failed to generate description. The AI models might be warming up (takes ~5 min on first request).');
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

    fetch(`${API_BASE_URL}/generate-from-image/`, {
      method: 'POST',
      body: formData,
    })
    .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
    .then(data => setDescription(data.description))
    .catch(err => {
      setError('Failed to generate description from image. The AI models might be warming up (takes ~5 min on first request).');
      console.error('Error:', err);
    })
    .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 mb-4">
              AI Product Description Generator
            </h1>
            <p className="text-2xl text-gray-300 mb-4 max-w-3xl mx-auto font-light">
              Because writing "premium quality product" 500 times gets old.
            </p>
            <p className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto">
              An MLOps showcase featuring automated CI/CD, DVC model versioning, 
              Prometheus monitoring, and enough Docker containers to make a DevOps engineer weep tears of joy.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a 
                href="https://github.com/khushaal-chaudhary/Product_Description_Generator_Demo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View Source Code
              </a>
              <button
                onClick={scrollToGenerator}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg transition transform hover:scale-105"
              >
                Try It Now
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MLOps Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-2">The MLOps Kitchen Sink</h2>
        <p className="text-gray-400 text-center mb-8">Everything but the actual kitchen sink (working on that)</p>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-teal-500 transition">
            <div className="text-teal-400 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Automated Testing</h3>
            <p className="text-gray-400">12+ pytest cases that actually run before deployment. Revolutionary, I know.</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-cyan-500 transition">
            <div className="text-cyan-400 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Model Versioning</h3>
            <p className="text-gray-400">DVC tracks 7GB of AI goodness. Git for models, because "model_final_v2_actually_final_for_real.pkl" wasn't cutting it.</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-sky-500 transition">
            <div className="text-sky-400 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Production Monitoring</h3>
            <p className="text-gray-400">Prometheus metrics for when you want to know exactly how your API is performing (or crashing).</p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 mb-16">
          <h3 className="text-2xl font-semibold text-white mb-4">Technology Stack</h3>
          <p className="text-gray-400 mb-4">AKA "Buzzword Bingo Winner 2025"</p>
          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <span className="font-semibold text-teal-400">Backend:</span> FastAPI, PyTorch, Transformers
            </div>
            <div>
              <span className="font-semibold text-teal-400">AI Models:</span> BLIP (Vision) + Gemma 2B (Text)
            </div>
            <div>
              <span className="font-semibold text-teal-400">MLOps:</span> DVC, pytest, Prometheus, GitHub Actions
            </div>
            <div>
              <span className="font-semibold text-teal-400">Deployment:</span> Docker, Hugging Face Spaces
            </div>
          </div>
        </div>

        {/* Main Application */}
        <div id="generator" className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white text-center">The Magic Happens Here</h2>
            <p className="text-gray-400 text-center mt-2">Upload an image or describe your product. AI does the rest. You take the credit.</p>
          </div>

          <div className="p-6">
            <div className="flex justify-center mb-8 bg-slate-900/50 rounded-lg p-1.5">
              <button
                onClick={() => setMode('image')}
                className={`w-full py-2 px-4 rounded-md transition-all font-semibold ${mode === 'image' ? 'bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg text-white' : 'hover:bg-slate-700 text-white'}`}
              >
                📸 Image Mode
              </button>
              <button
                onClick={() => setMode('attributes')}
                className={`w-full py-2 px-4 rounded-md transition-all font-semibold ${mode === 'attributes' ? 'bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg text-white' : 'hover:bg-slate-700 text-white'}`}
              >
                ✍️ Text Mode
              </button>
            </div>

            {mode === 'image' ? (
              <form onSubmit={handleImageSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Product Image
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-slate-600 hover:border-teal-500 transition px-6 py-10">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-4">
                        <label className="cursor-pointer rounded-md font-semibold text-teal-400 hover:text-teal-500">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                        </label>
                        <p className="text-gray-400">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>

                {imagePreview && (
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-2">Preview:</p>
                    <img src={imagePreview} alt="Preview" className="rounded-lg max-h-60 w-auto mx-auto shadow-lg border border-slate-700" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SEO Keywords (Optional)
                  </label>
                  <input
                    type="text"
                    value={imageSeoKeywords}
                    onChange={(e) => setImageSeoKeywords(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., summer fashion, casual wear"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !selectedImage}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:opacity-50"
                >
                  {isLoading ? '🤖 Generating...' : '✨ Generate from Image'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAttributeSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Attributes
                  </label>
                  <input
                    type="text"
                    value={productAttributes}
                    onChange={(e) => setProductAttributes(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., red cotton t-shirt, size M, breathable fabric"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., summer fashion, casual wear"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:opacity-50"
                >
                  {isLoading ? '🤖 Generating...' : '✨ Generate Description'}
                </button>
              </form>
            )}

            {(error || description) && (
              <div className="mt-8 pt-6 border-t border-slate-700">
                {error && (
                  <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
                    {error}
                  </div>
                )}
                {description && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Your AI-Generated Masterpiece:</h3>
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg text-gray-200">
                      {description}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">About This Project</h3>
              <p className="text-gray-400 text-sm">
                A portfolio demonstration of end-to-end MLOps practices. Built to showcase modern ML engineering skills 
                and occasionally generate decent product descriptions.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Technologies</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>FastAPI & PyTorch</li>
                <li>DVC & GitHub Actions</li>
                <li>Docker & Prometheus</li>
                <li>Hugging Face Transformers</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex flex-col space-y-3">
                <a href="https://khushaalchaudhary.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-400 transition flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Portfolio Website
                </a>
                <a href="https://github.com/khushaal-chaudhary" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-400 transition flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub Profile
                </a>
                <a href="https://linkedin.com/in/khushaal-chaudhary" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-400 transition flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn Profile
                </a>
                <a href="mailto:khushaalchaudhary@outlook.com" className="text-gray-400 hover:text-teal-400 transition flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Me
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>Built with FastAPI, React, and PyTorch. Deployed on Hugging Face Spaces & Vercel.</p>
            <p className="mt-2">© 2025 Khushaal Chaudhary. MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;