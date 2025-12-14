import React, { useState } from 'react';
import Layout from './components/Layout';
import OutfitSwapper from './components/OutfitSwapper';
import VideoGenerator from './components/VideoGenerator';
import ProductPoster from './components/ProductPoster';
import { AppMode } from './types';
import { Shirt, Video, ShoppingBag } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.OUTFIT_SWAP);

  const renderContent = () => {
    switch (mode) {
      case AppMode.OUTFIT_SWAP:
        return <OutfitSwapper />;
      case AppMode.VIDEO_GEN:
        return <VideoGenerator />;
      case AppMode.PRODUCT_POSTER:
        return <ProductPoster />;
      default:
        return <OutfitSwapper />;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
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