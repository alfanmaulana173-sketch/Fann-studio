
import React, { useState } from 'react';
import Layout from './components/Layout';
import OutfitSwapper from './components/OutfitSwapper';
import ProductPoster from './components/ProductPoster';
import VideoGenerator from './components/VideoGenerator';
import { AppMode } from './types';
import { Shirt, ShoppingBag, Key, CheckCircle, AlertCircle, ArrowRight, Video } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.OUTFIT_SWAP);
  const [inputKey, setInputKey] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleSaveKey = () => {
    if (inputKey.trim()) {
      setApiKey(inputKey.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveKey();
    }
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.OUTFIT_SWAP:
        return <OutfitSwapper apiKey={apiKey} />;
      case AppMode.PRODUCT_POSTER:
        return <ProductPoster apiKey={apiKey} />;
      case AppMode.VIDEO_GENERATION:
        return <VideoGenerator apiKey={apiKey} />;
      default:
        return <OutfitSwapper apiKey={apiKey} />;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        
        {/* API Key Input Section */}
        <div className="max-w-2xl mx-auto w-full space-y-3">
          {/* Input Row */}
          <div className="bg-white p-2 pl-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2 text-slate-500 min-w-fit">
              <Key className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium hidden sm:inline">Gemini API Key:</span>
            </div>
            <input 
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your AI Studio API Key"
              className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none w-full"
            />
            <button 
              onClick={handleSaveKey}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-w-fit w-full sm:w-auto justify-center shadow-sm"
            >
              Set Key <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Status Bar */}
          <div className={`flex items-center justify-between px-4 py-2 rounded-lg text-xs font-medium border transition-all duration-300 ${
            apiKey 
              ? 'bg-emerald-100 border-emerald-200 text-emerald-700' 
              : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            <div className="flex items-center gap-2">
              {apiKey ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>API Key Active & Ready</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>API Key Not Set - Features Disabled</span>
                </>
              )}
            </div>
            {apiKey && (
              <span className="text-emerald-800/60 font-mono">
                {apiKey.substring(0, 4)}...{apiKey.substring(apiKey.length - 4)}
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center w-full">
          <div className="bg-white p-1 rounded-xl flex gap-1 border border-emerald-100 shadow-sm overflow-x-auto max-w-full">
            <button
              onClick={() => setMode(AppMode.OUTFIT_SWAP)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${mode === AppMode.OUTFIT_SWAP 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'}`}
            >
              <Shirt className="w-4 h-4" />
              Outfit Swap
            </button>
            <button
              onClick={() => setMode(AppMode.PRODUCT_POSTER)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${mode === AppMode.PRODUCT_POSTER 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              Product Poster
            </button>
            <button
              onClick={() => setMode(AppMode.VIDEO_GENERATION)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${mode === AppMode.VIDEO_GENERATION 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'}`}
            >
              <Video className="w-4 h-4" />
              Video Forge
            </button>
          </div>
        </div>

        {/* Feature Container */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
};

export default App;
