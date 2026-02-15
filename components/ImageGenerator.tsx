
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GeneratedImage } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let base64Data = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
      }

      if (base64Data) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: `data:image/png;base64,${base64Data}`,
          prompt: prompt,
          timestamp: new Date()
        };
        setImages(prev => [newImage, ...prev]);
        setPrompt('');
      } else {
        alert('Model returned no image data. Please try a different prompt.');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      alert('Failed to generate image. Ensure your prompt is safe and API key is valid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 backdrop-blur-sm">
        <h2 className="text-3xl font-bold mb-2">Image Forge</h2>
        <p className="text-gray-400 mb-8">Manifest your imagination using Gemini 2.5 Flash Image.</p>
        
        <form onSubmit={generateImage} className="relative max-w-2xl">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create in detail..."
            className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-6 py-5 pr-20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px] transition-all"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute right-4 bottom-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Forging...
              </div>
            ) : (
              'Forge Image'
            )}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:scale-[1.02] transition-transform duration-500 shadow-xl">
            <img 
              src={img.url} 
              alt={img.prompt} 
              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
              <p className="text-sm text-gray-200 line-clamp-3 mb-4">{img.prompt}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = img.url;
                    link.download = `lumina-${img.id}.png`;
                    link.click();
                  }}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors border border-gray-700"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {images.length === 0 && !isLoading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-3xl">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Your creation gallery is empty. Start forging above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
