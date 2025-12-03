import React, { useState, useCallback } from 'react';
import { TriangleViz } from './components/TriangleViz';
import { analyzeTradeOffs } from './services/geminiService';
import { AnalysisStatus } from './types';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
  // Geometry state
  // Initial values set to create the "impossible" void in the center
  // separation > radius * sqrt(3) (approx 1.732 * radius)
  // Let radius = 120. Threshold separation ~ 207.
  const [radius, setRadius] = useState(130);
  const [separation, setSeparation] = useState(230); // 230 > 130 * 1.732, so void exists
  const [rotation, setRotation] = useState(0);

  // Analysis state
  const [context, setContext] = useState('');
  const [analysis, setAnalysis] = useState<string>('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);

  const handleAnalysis = useCallback(async () => {
    if (!context.trim()) return;
    
    setStatus(AnalysisStatus.LOADING);
    setAnalysis('');
    
    try {
      const result = await analyzeTradeOffs(context);
      setAnalysis(result);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (e) {
      setAnalysis('Could not generate analysis. Please ensure API Key is valid.');
      setStatus(AnalysisStatus.ERROR);
    }
  }, [context]);

  // Calculate geometric ratio to display
  // Ratio > 1.732 means "Impossible" (Hole in middle)
  // Ratio < 1.732 means "Possible" (Overlap in middle)
  const ratio = separation / radius;
  const isImpossible = ratio > Math.sqrt(3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400">
            The Impossible Triangle
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Pick two: <span className="text-cyan-400 font-bold">Fast</span>, <span className="text-pink-400 font-bold">Good</span>, or <span className="text-yellow-400 font-bold">Cheap</span>. 
            You usually can't have all three.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Visualization Column */}
          <div className="lg:col-span-7 space-y-6">
            <TriangleViz 
              radius={radius} 
              separation={separation} 
              rotation={rotation}
            />
            
            {/* Controls */}
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-semibold text-slate-300">Geometry Controls</h3>
                <span className={`text-xs px-2 py-1 rounded font-mono ${isImpossible ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                  {isImpossible ? 'STATUS: IMPOSSIBLE (Center Void)' : 'STATUS: UTOPIA (Center Overlap)'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <label>Circle Radius</label>
                    <span className="text-slate-500">{radius}px</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="180"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <label>Separation</label>
                    <span className="text-slate-500">{separation}px</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="350"
                    value={separation}
                    onChange={(e) => setSeparation(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
                  />
                  <p className="text-xs text-slate-500 pt-1">
                    Gap appears when Separation &gt; {Math.floor(radius * 1.732)}px
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl h-full flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-2xl">🤖</span> AI Trade-off Analyzer
                </h2>
                <p className="text-slate-400 text-sm">
                  Describe a project or situation, and Gemini will explain why you can't have it all.
                </p>
              </div>

              <div className="space-y-4 flex-grow">
                <div>
                  <label htmlFor="context" className="block text-sm font-medium text-slate-300 mb-2">
                    Project Context
                  </label>
                  <textarea
                    id="context"
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="e.g., Developing a new mobile game, Renovating a historic house, Cooking a gourmet dinner..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                  />
                </div>
                
                <button
                  onClick={handleAnalysis}
                  disabled={status === AnalysisStatus.LOADING || !context.trim()}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2
                    ${status === AnalysisStatus.LOADING 
                      ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 hover:shadow-cyan-500/25'
                    }`}
                >
                  {status === AnalysisStatus.LOADING ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Trade-offs'
                  )}
                </button>

                {/* Analysis Result */}
                {(status === AnalysisStatus.SUCCESS || status === AnalysisStatus.ERROR) && (
                  <div className={`mt-6 p-4 rounded-lg border ${status === AnalysisStatus.ERROR ? 'bg-red-900/20 border-red-800' : 'bg-slate-800/50 border-slate-700'}`}>
                     {status === AnalysisStatus.ERROR ? (
                       <p className="text-red-400">{analysis}</p>
                     ) : (
                       <div className="prose prose-invert prose-sm max-w-none">
                         <ReactMarkdown>{analysis}</ReactMarkdown>
                       </div>
                     )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Info Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-800">
          <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-800/50 hover:border-cyan-500/30 transition-colors">
            <h3 className="text-cyan-400 font-bold text-lg mb-2">快 (Fast)</h3>
            <p className="text-slate-400 text-sm">
              Time to market, delivery speed, responsiveness. Focusing here often requires sacrificing deep testing or low cost.
            </p>
          </div>
          <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-800/50 hover:border-pink-500/30 transition-colors">
            <h3 className="text-pink-400 font-bold text-lg mb-2">准 (Accurate/Good)</h3>
            <p className="text-slate-400 text-sm">
              Quality, scope, precision, reliability. High quality usually takes time or costs significant money.
            </p>
          </div>
          <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-800/50 hover:border-yellow-500/30 transition-colors">
            <h3 className="text-yellow-400 font-bold text-lg mb-2">省 (Cheap)</h3>
            <p className="text-slate-400 text-sm">
              Budget, resource efficiency, low cost. Saving money often means cutting corners on quality or speed.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
