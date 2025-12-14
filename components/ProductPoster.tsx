import React, { useState } from 'react';
import { ImageFile, AspectRatio } from '../types';
import ImageUploader from './ImageUploader';
import { generateProductPoster } from '../services/geminiService';
import { Loader2, Zap, Download, ShoppingBag, Monitor } from 'lucide-react';

const RatioOptions: { label: string; value: AspectRatio }[] = [
  { label: 'Square (1:1)', value: AspectRatio.RATIO_1_1 },
  { label: 'Portrait (4:5)', value: AspectRatio.RATIO_4_5 },
  { label: 'Story (9:16)', value: AspectRatio.RATIO_9_16 },
  { label: 'Landscape (16:9)', value: AspectRatio.RATIO_16_9 },
  { label: 'Photo (3:2)', value: AspectRatio.RATIO_3_2 },
];

interface ProductPosterProps {
  apiKey: string;
}

const ProductPoster: React.FC<ProductPosterProps> = ({ apiKey }) => {
  const [productImg, setProductImg] = useState<ImageFile | null>(null);
  const [logoImg, setLogoImg] = useState<ImageFile | null>(null);
  const [theme, setTheme] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(AspectRatio.RATIO_1_1);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productImg || !theme || !apiKey) return;

    setLoading(true);
    setError(null);
    setResultImg(null);

    try {
      const result = await generateProductPoster(
        apiKey,
        productImg, 
        theme, 
        logoImg || undefined, 
        selectedRatio
      );
      setResultImg(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate poster.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-3xl font-bold text-emerald-950">Commercial Studio</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Upload a simple product photo. We'll remove the background and place it in a professional marketing setting.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-6">
            <ImageUploader 
              label="Product Photo" 
              image={productImg} 
              onImageChange={setProductImg}
              heightClass="h-56"
            />
            
            <ImageUploader 
              label="Brand Logo (Optional)" 
              image={logoImg} 
              onImageChange={setLogoImg}
              heightClass="h-24"
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-900">Background Theme & Vibe</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none h-32 placeholder:text-slate-400"
                placeholder="e.g., A minimalist marble podium with soft morning sunlight and monstera leaves shadows..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-900 ml-1 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-600" />
                Output Aspect Ratio
              </label>
              <div className="relative">
                <select
                  value={selectedRatio}
                  onChange={(e) => setSelectedRatio(e.target.value as AspectRatio)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  {RatioOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white">
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!productImg || !theme || loading || !apiKey}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md
                ${!productImg || !theme || loading || !apiKey
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-500/25'
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Designing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Poster
                </>
              )}
            </button>
            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</p>}
          </div>
        </div>

        {/* Preview */}
        <div className="w-full lg:w-2/3">
           <div className="h-full min-h-[600px] bg-white p-2 rounded-2xl border border-emerald-100 shadow-sm flex flex-col relative">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white pointer-events-none" />
             
             {resultImg ? (
               <div className="relative w-full h-full flex items-center justify-center group bg-slate-50 rounded-xl border border-slate-100">
                 <img 
                    src={resultImg} 
                    alt="Promo Poster" 
                    className="max-w-full max-h-[80vh] object-contain shadow-xl rounded-lg" 
                 />
                 <a 
                   href={resultImg} 
                   download="fann-promo.png"
                   className="absolute bottom-8 right-8 px-6 py-3 bg-white text-emerald-900 font-bold rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 flex items-center gap-2 border border-emerald-100"
                 >
                   <Download className="w-4 h-4 text-emerald-600" />
                   Download Poster
                 </a>
               </div>
             ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-4 bg-slate-50/50">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-30 text-emerald-400" />
                  <p className="text-lg font-medium text-slate-600">Your Masterpiece Awaits</p>
                  <p className="text-sm opacity-70">Generated posters appear here</p>
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPoster;