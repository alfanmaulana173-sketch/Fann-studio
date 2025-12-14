import React, { useState, useEffect } from 'react';
import { ImageFile, AspectRatio } from '../types';
import ImageUploader from './ImageUploader';
import { generateVideo } from '../services/geminiService';
import { Loader2, Video, Key, Play, Monitor } from 'lucide-react';

const RatioOptions: { label: string; value: AspectRatio }[] = [
  { label: 'Landscape (16:9)', value: AspectRatio.RATIO_16_9 },
  { label: 'Story (9:16)', value: AspectRatio.RATIO_9_16 },
  // Veo strictly supports these two mostly, but we offer UI consistency.
  // Service layer maps others to these.
  { label: 'Square (1:1)', value: AspectRatio.RATIO_1_1 },
  { label: 'Portrait (4:5)', value: AspectRatio.RATIO_4_5 },
];

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [refImage, setRefImage] = useState<ImageFile | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(AspectRatio.RATIO_16_9);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);

  // Check for API key on mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        }
      } catch (e) {
        console.error("Error checking API key status", e);
      } finally {
        setCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success as per prompt instructions to avoid race conditions
      setHasKey(true); 
    } else {
      alert("AI Studio environment not detected.");
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const url = await generateVideo(prompt, refImage || undefined, selectedRatio);
      setVideoUrl(url);
    } catch (err: any) {
      if (err.message && err.message.includes("Requested entity was not found")) {
         setError("API Key session invalid. Please select your key again.");
         setHasKey(false);
      } else {
         setError(err.message || "Video generation failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingKey) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /></div>;
  }

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-2xl mx-auto space-y-6">
        <div className="p-4 bg-indigo-500/10 rounded-full">
           <Video className="w-12 h-12 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold">Cinematic Video Generation</h2>
        <p className="text-slate-400">
          To generate high-quality videos with Veo 3.1, you need to connect your paid Google Cloud Project API key.
        </p>
        <button 
          onClick={handleSelectKey}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
        >
          <Key className="w-4 h-4" />
          Select API Key
        </button>
        <p className="text-xs text-slate-500">
          Learn more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">ai.google.dev/gemini-api/docs/billing</a>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-white">Veo Video Forge</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Turn text and images into cinematic videos. Identity and style from your reference image will be preserved.
        </p>
      </div>

      <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <ImageUploader 
              label="Reference Image (Optional)" 
              image={refImage} 
              onImageChange={setRefImage}
              heightClass="h-40"
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-400" />
                Aspect Ratio
              </label>
              <div className="relative">
                <select
                  value={selectedRatio}
                  onChange={(e) => setSelectedRatio(e.target.value as AspectRatio)}
                  className="w-full appearance-none bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer hover:bg-slate-800/50 transition-colors"
                >
                  {RatioOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-900">
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

          <div className="md:col-span-2 flex flex-col gap-2">
             <label className="text-sm font-medium text-slate-300">Prompt Description</label>
             <textarea 
                className="w-full flex-grow bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none placeholder:text-slate-600"
                placeholder="Describe the scene, movement, camera angles, and lighting..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
             />
          </div>
        </div>

        <button
            onClick={handleGenerate}
            disabled={!prompt || loading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
              ${!prompt || loading 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25'
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Video (This may take a minute)...
              </>
            ) : (
              <>
                <Video className="w-5 h-5" />
                Generate Video
              </>
            )}
        </button>

        {error && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-sm">
              {error}
              {error.includes("API Key") && (
                  <button onClick={handleSelectKey} className="ml-2 underline hover:text-white">Retry Key Selection</button>
              )}
            </div>
        )}
      </div>

      {/* Video Result */}
      {videoUrl && (
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
           <video 
             src={videoUrl} 
             controls 
             autoPlay 
             loop 
             className="w-full aspect-video"
           />
           <div className="p-4 bg-slate-900 flex justify-between items-center">
              <span className="text-sm text-slate-400">Generated with Veo 3.1</span>
              <a href={videoUrl} download="fann-video.mp4" className="text-indigo-400 text-sm hover:text-indigo-300 font-medium">Download MP4</a>
           </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;