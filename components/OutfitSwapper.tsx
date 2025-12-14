import React, { useState } from 'react';
import { ImageFile, PoseType, AspectRatio } from '../types';
import ImageUploader from './ImageUploader';
import { swapOutfit } from '../services/geminiService';
import { ArrowRight, Loader2, Download, Shirt, Sparkles, User, Monitor, Package } from 'lucide-react';

const PoseOptions: { label: string; value: PoseType }[] = [
  { label: 'Original Pose', value: PoseType.ORIGINAL },
  { label: 'Standing Front', value: PoseType.STANDING_FRONT },
  { label: 'Contrapposto', value: PoseType.CONTRAPPOSTO },
  { label: 'Walking', value: PoseType.WALKING },
  { label: 'Hand on Hip', value: PoseType.HAND_ON_HIP },
  { label: 'Crossed Legs', value: PoseType.CROSSED_LEGS },
  { label: 'Sitting Casual', value: PoseType.SITTING_CASUAL },
  { label: 'Shoulder Turn', value: PoseType.SHOULDER_TURN },
  { label: 'Three Quarter', value: PoseType.THREE_QUARTER },
];

const RatioOptions: { label: string; value: AspectRatio }[] = [
  { label: 'Square (1:1)', value: AspectRatio.RATIO_1_1 },
  { label: 'Portrait (4:5)', value: AspectRatio.RATIO_4_5 },
  { label: 'Story (9:16)', value: AspectRatio.RATIO_9_16 },
  { label: 'Landscape (16:9)', value: AspectRatio.RATIO_16_9 },
  { label: 'Photo (3:2)', value: AspectRatio.RATIO_3_2 },
];

interface OutfitSwapperProps {
  apiKey: string;
}

const OutfitSwapper: React.FC<OutfitSwapperProps> = ({ apiKey }) => {
  const [characterImg, setCharacterImg] = useState<ImageFile | null>(null);
  const [outfitImg, setOutfitImg] = useState<ImageFile | null>(null);
  const [handheldImg, setHandheldImg] = useState<ImageFile | null>(null);
  const [selectedPose, setSelectedPose] = useState<PoseType>(PoseType.ORIGINAL);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(AspectRatio.RATIO_1_1);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!characterImg || !outfitImg || !apiKey) return;

    setLoading(true);
    setError(null);
    setResultImg(null);

    try {
      const result = await swapOutfit(
        apiKey,
        characterImg, 
        outfitImg, 
        selectedPose, 
        selectedRatio,
        handheldImg || undefined
      );
      setResultImg(result);
    } catch (err: any) {
      setError(err.message || "Failed to swap outfit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-emerald-950">Virtual Wardrobe</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Upload a character and a reference outfit. Optionally add a product for the character to hold.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Input Section */}
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <ImageUploader 
            label="1. Character Image" 
            image={characterImg} 
            onImageChange={setCharacterImg} 
          />
          
          <div className="flex items-center justify-center">
             <div className="p-2 bg-emerald-50 rounded-full border border-emerald-100">
               <ArrowRight className="w-4 h-4 text-emerald-600 rotate-90 md:rotate-0" />
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <ImageUploader 
              label="2. Outfit Reference" 
              image={outfitImg} 
              onImageChange={setOutfitImg}
              heightClass="h-40"
            />
             <ImageUploader 
              label="3. Handheld Item (Optional)" 
              image={handheldImg} 
              onImageChange={setHandheldImg}
              heightClass="h-40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-900 ml-1 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                Target Pose
              </label>
              <div className="relative">
                <select
                  value={selectedPose}
                  onChange={(e) => setSelectedPose(e.target.value as PoseType)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  {PoseOptions.map((option) => (
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-900 ml-1 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-600" />
                Aspect Ratio
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
          </div>
          
          {selectedPose !== PoseType.ORIGINAL && (
            <p className="text-xs text-emerald-600 ml-1">
              Note: Changing pose will reconstruct the body while keeping identity.
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!characterImg || !outfitImg || loading || !apiKey}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md mt-4
              ${!characterImg || !outfitImg || loading || !apiKey
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-500/25'
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shirt className="w-5 h-5" />
                Swap Outfit
              </>
            )}
          </button>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="h-full min-h-[400px] bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col">
           <span className="text-sm font-medium text-emerald-900 ml-1 mb-4">Result</span>
           <div className="flex-grow flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden relative p-2">
             {resultImg ? (
               <div className="relative w-full h-full flex items-center justify-center group">
                 <img src={resultImg} alt="Swapped Outfit" className="max-w-full max-h-full object-contain shadow-sm rounded" />
                 <a 
                   href={resultImg} 
                   download="fann-outfit-swap.png"
                   className="absolute bottom-6 right-6 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                 >
                   <Download className="w-5 h-5" />
                 </a>
               </div>
             ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center border border-emerald-100 shadow-sm">
                    <Sparkles className="w-8 h-8 text-emerald-300" />
                  </div>
                  <p className="text-slate-400">Generated image will appear here</p>
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitSwapper;