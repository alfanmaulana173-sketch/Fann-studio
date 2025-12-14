import React, { useState } from 'react';
import Layout from './components/Layout';
import OutfitSwapper from './components/OutfitSwapper';
import VideoGenerator from './components/VideoGenerator';
import ProductPoster from './components/ProductPoster';
import { AppMode } from './types';
import { Shirt, Video, ShoppingBag, Key, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

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
      case AppMode.VIDEO_GEN:
        return <VideoGenerator apiKey={apiKey} />;
      case AppMode.PRODUCT_POSTER:
        return <ProductPoster apiKey={apiKey} />;
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
          <div className="bg-slate-800/80 p-2 pl-4 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-sm flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2 text-slate-400 min-w-fit">
              <Key className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-medium hidden sm:inline">Gemini API Key:</span>
            </div>
            <input 
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your AI Studio API Key"
              className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full"
            />
            <button 
              onClick={handleSaveKey}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-w-fit w-full sm:w-auto justify-center"
            >
              Set Key <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Status Bar */}
          <div className={`flex items-center justify-between px-4 py-2 rounded-lg text-xs font-medium border transition-all duration-300 ${
            apiKey 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
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
              <span className="text-slate-500 font-mono">
                {apiKey.substring(0, 4)}...{apiKey.substring(apiKey.length - 4)}
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center w-full">
          <div className="bg-slate-800/50 p-1 rounded-xl flex gap-1 border border-slate-700/50 backdrop-blur-sm overflow-x-auto max-w-full">
            <button
              onClick={() => setMode(AppMode.OUTFIT_SWAP)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${mode === AppMode.OUTFIT_SWAP 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            >
              <Shirt className="w-4 h-4" />
              Outfit Swap
            </button>
            <button
              onClick={() => setMode(AppMode.VIDEO_GEN)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${mode === AppMode.VIDEO_GEN 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            >
              <Video className="w-4 h-4" />
              Veo Video
            </button>
            <button
              onClick={() => setMode(AppMode.PRODUCT_POSTER)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${mode === AppMode.PRODUCT_POSTER 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              Product Poster
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