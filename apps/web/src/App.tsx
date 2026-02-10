import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold text-gray-900">Precium</h1>
            <p className="text-sm text-gray-600 mt-1">
              Smart Price Comparison Application
            </p>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Welcome to Precium
        </h2>
        <p className="text-gray-600 mb-6">
          Your smart price comparison platform is under construction.
        </p>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800 font-semibold">
              ✓ Monorepo structure created
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800 font-semibold">
              ✓ Development environment ready
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-800 font-semibold">
              ⚙️ Backend API: http://localhost:3001
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
