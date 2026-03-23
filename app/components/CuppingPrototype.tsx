import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Coffee, 
  Save, 
  Calculator, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Sparkles, 
  Check,
  AlertTriangle
} from 'lucide-react';

/**
 * Global Professional Version (English UI) - SCA Protocol v2.5 Hybrid
 * * Optimized UX for Speed:
 * 1. Quick-jump Sliders: One-tap to jump between integer scores (e.g., 6.0 to 8.0).
 * 2. Fine-tune Buttons: +/- 0.25 for precision.
 * 3. Responsive Scaling: Visual tick marks for integer scores.
 */

type RadarMetrics = {
  acidity: number;
  body: number;
  bitterness: number;
  aroma: number;
  sweetness: number;
};

type IntensityMetrics = {
  fragrance_dry: number;
  fragrance_break: number;
  acidity: number;
  body: number;
};

const FLAVOR_CATEGORIES = [
  { 
    name: 'Fruity/Berry', 
    activeClass: 'bg-rose-700 text-white', 
    inactiveClass: 'bg-rose-50 text-rose-700 border-rose-200',
    tags: ['Blueberry', 'Raspberry', 'Strawberry', 'Citrus', 'Apple', 'Peach'] 
  },
  { 
    name: 'Floral', 
    activeClass: 'bg-indigo-700 text-white', 
    inactiveClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    tags: ['Jasmine', 'Rose', 'Lavender', 'Hibiscus'] 
  },
  { 
    name: 'Nutty/Choco', 
    activeClass: 'bg-amber-900 text-white', 
    inactiveClass: 'bg-amber-50 text-amber-900 border-amber-200',
    tags: ['Almond', 'Hazelnut', 'Dark Chocolate', 'Milk Chocolate', 'Caramel'] 
  },
  { 
    name: 'Spicy/Herbal', 
    activeClass: 'bg-emerald-900 text-white', 
    inactiveClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    tags: ['Cinnamon', 'Black Tea', 'Mint', 'Herb'] 
  },
];

const SENSORY_CATEGORIES = [
  { id: 'fragrance_aroma', name: 'Fragrance / Aroma', hasIntensity: true, intensityLabels: ['Dry', 'Break'] },
  { id: 'flavor', name: 'Flavor', hasIntensity: false },
  { id: 'aftertaste', name: 'Aftertaste', hasIntensity: false },
  { id: 'acidity', name: 'Acidity', hasIntensity: true, intensityLabels: ['Intensity'] },
  { id: 'body', name: 'Body', hasIntensity: true, intensityLabels: ['Level'] },
  { id: 'balance', name: 'Balance', hasIntensity: false },
  { id: 'overall', name: 'Overall', hasIntensity: false },
];

export default function CuppingPrototype() {
  const [activeCupTab, setActiveCupTab] = useState(1);
  const [showSca, setShowSca] = useState(true);
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<{name: string, activeClass: string}[]>([]);
  const [tagLimit, setTagLimit] = useState(2);

  useEffect(() => {
    const handleResize = () => setTagLimit(window.innerWidth >= 768 ? 5 : 2);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- State Management ---
  const [radar, setRadar] = useState<RadarMetrics>({
    acidity: 3, body: 3, bitterness: 3, aroma: 3, sweetness: 3,
  });

  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(SENSORY_CATEGORIES.map(c => [c.id, 6.0]))
  );

  const [intensities, setIntensities] = useState<IntensityMetrics>({
    fragrance_dry: 3,
    fragrance_break: 3,
    acidity: 3,
    body: 3,
  });

  const [checks, setChecks] = useState({
    uniformity: [true, true, true, true, true],
    cleanCup: [true, true, true, true, true],
    sweetness: [true, true, true, true, true],
  });

  const [defects, setDefects] = useState({ cups: 0, type: 2 });

  // --- Handlers ---
  const adjustRadar = (key: keyof RadarMetrics, delta: number) => {
    setRadar(prev => ({ ...prev, [key]: Math.min(Math.max(prev[key] + delta, 1), 5) }));
  };

  const setScore = (id: string, value: number) => {
    setScores(prev => ({ ...prev, [id]: Math.min(Math.max(value, 0), 10) }));
  };

  const adjustScore = (id: string, delta: number) => {
    setScores(prev => ({
      ...prev,
      [id]: Math.min(Math.max(prev[id] + delta, 0), 10)
    }));
  };

  const updateIntensity = (key: keyof IntensityMetrics, value: number) => {
    setIntensities(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tagName: string, activeClass: string) => {
    setSelectedTags(prev => 
      prev.find(t => t.name === tagName) 
        ? prev.filter(t => t.name !== tagName) 
        : [...prev, { name: tagName, activeClass }]
    );
  };

  const toggleCheck = (category: keyof typeof checks, index: number) => {
    setChecks(prev => {
      const newList = [...prev[category]];
      newList[index] = !newList[index];
      return { ...prev, [category]: newList };
    });
  };

  // --- Scoring Logic ---
  const cupScore = useMemo(() => {
    const sensoryTotal = Object.values(scores).reduce((a, b) => a + b, 0);
    const consistencyTotal = [...checks.uniformity, ...checks.cleanCup, ...checks.sweetness].filter(Boolean).length * 2;
    const defectDeduction = defects.cups * defects.type;
    return sensoryTotal + consistencyTotal - defectDeduction;
  }, [scores, checks, defects]);

  return (
    <div className="max-w-2xl mx-auto text-slate-900 pb-40 relative font-sans antialiased bg-slate-50/50">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm px-2 sm:px-4 pt-4 pb-2 border-b-4 border-amber-500 shadow-md">
        <header>
          <div className="flex items-center justify-between mb-3 gap-1">
            <h1 className="text-sm sm:text-lg font-black italic flex items-center gap-1 shrink-0">
              <Coffee className="text-amber-700" fill="currentColor" size={20} />
              <span className="hidden xs:inline tracking-tighter uppercase">Cupping Log Pro</span>
              <span className="xs:hidden font-black">CUP LOG</span>
            </h1>
            <div className="flex gap-0.5 sm:gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-lg shrink-0">
              {[1, 2, 3, 4, 5].map(n => (
                <button 
                  key={n}
                  onClick={() => setActiveCupTab(n)}
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded flex items-center justify-center text-xs sm:text-base font-black transition-all border ${activeCupTab === n ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-transparent text-slate-400'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-[#0f172a] text-white p-3 sm:p-5 rounded-2xl flex items-center justify-between shadow-xl min-h-[70px] sm:min-h-[90px]">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <span className="text-[10px] sm:text-xs font-black text-amber-500 uppercase tracking-widest leading-none">Total Cup Score</span>
              <div className="flex gap-1 flex-wrap overflow-hidden">
                {selectedTags.length > 0 ? (
                  <>
                    {selectedTags.slice(0, tagLimit).map(tag => (
                      <span key={tag.name} className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded border border-white/10 font-bold uppercase shrink-0 ${tag.activeClass}`}>
                        {tag.name}
                      </span>
                    ))}
                    {selectedTags.length > tagLimit && <span className="text-[10px] text-slate-500 font-bold">+{selectedTags.length - tagLimit}</span>}
                  </>
                ) : (
                  <span className="text-[10px] text-slate-500 font-bold italic uppercase tracking-tighter">Evaluating Profile...</span>
                )}
              </div>
            </div>
            <span className="text-4xl sm:text-5xl font-black text-white tabular-nums leading-none ml-2 shrink-0">{cupScore.toFixed(2)}</span>
          </div>
        </header>
      </div>

      <div className="px-3 sm:px-4 mt-6 space-y-6">
        
        {/* Quick Radar (1-5) */}
        <section className="bg-white p-3 sm:p-5 rounded-3xl shadow-sm border-2 border-slate-100">
          <h2 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Tag size={18} /> Quick Radar (1-5)
          </h2>
          <div className="space-y-4">
            {(Object.keys(radar) as Array<keyof RadarMetrics>).map((key) => (
              <div key={key} className="flex items-center justify-between py-1 gap-1">
                <span className="text-sm sm:text-base font-black capitalize text-slate-800 w-20 sm:w-28 shrink-0">{key}</span>
                <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
                  <button onClick={() => adjustRadar(key, -1)} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full active:scale-95 transition-all text-slate-600"><Minus size={18}/></button>
                  <div className="flex gap-1.5 items-center">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <div key={val} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 ${radar[key] >= val ? 'bg-amber-600 border-amber-700 shadow-sm' : 'bg-slate-100 border-slate-200'}`} />
                    ))}
                  </div>
                  <button onClick={() => adjustRadar(key, 1)} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full active:scale-95 transition-all text-slate-600"><Plus size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Flavor Tags */}
        <section className="bg-white p-3 sm:p-5 rounded-3xl shadow-sm border-2 border-slate-100">
          <h2 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" /> Flavor tags
          </h2>
          <div className="space-y-6">
            {FLAVOR_CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <h3 className="text-sm sm:text-base font-black text-slate-500 mb-3 border-l-4 border-slate-200 pl-2 uppercase">{cat.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.tags.map(tag => {
                    const isSelected = selectedTags.some(t => t.name === tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag, cat.activeClass)}
                        className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all ${isSelected ? `${cat.activeClass} border-transparent shadow-lg scale-105` : `${cat.inactiveClass} hover:border-slate-400`}`}
                      >
                        {isSelected && <Check size={12} sm:size={14} strokeWidth={3} className="inline mr-1" />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Professional SCA Protocol Section */}
        <section className="bg-white p-3 sm:p-5 rounded-3xl shadow-sm border-2 border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calculator size={18} /> Professional SCA Scoring
            </h2>
            <button onClick={() => setShowSca(!showSca)} className="p-2 bg-slate-50 rounded-full active:bg-slate-100 transition-colors">
              {showSca ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
            </button>
          </div>

          {showSca && (
            <div className="space-y-10 animate-in fade-in duration-300 pb-4">
              
              {/* Sensory Categories with Quick-Jump Sliders */}
              {SENSORY_CATEGORIES.map((cat) => (
                <div key={cat.id} className="p-4 sm:p-6 rounded-2xl bg-slate-50 border-2 border-transparent hover:border-amber-100 transition-all space-y-6">
                  {/* Category Header and Numeric Score */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-black text-slate-800 leading-tight break-words uppercase">{cat.name}</h4>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">{cat.description}</p>
                    </div>
                    <div className="bg-[#0f172a] text-amber-400 px-4 py-1.5 rounded-lg border border-amber-900/50 shadow-inner">
                      <span className="font-mono font-black text-xl sm:text-2xl tabular-nums">{scores[cat.id].toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Quick-Jump Slider and Precise Control */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => adjustScore(cat.id, -0.25)} 
                        className="w-10 h-10 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-200 active:bg-slate-100"
                      >
                        <Minus size={20}/>
                      </button>

                      <div className="flex-1 relative pt-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.25"
                          value={scores[cat.id]}
                          onChange={(e) => setScore(cat.id, parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                        {/* Scale Guides (Tick Marks) */}
                        <div className="flex justify-between w-full px-1 mt-2 text-[9px] font-black text-slate-300">
                          <span>0</span>
                          <span>|</span>
                          <span>|</span>
                          <span className="text-slate-400">6</span>
                          <span>|</span>
                          <span className="text-slate-400">8</span>
                          <span>|</span>
                          <span>|</span>
                          <span>10</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => adjustScore(cat.id, 0.25)} 
                        className="w-10 h-10 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-200 active:bg-slate-100"
                      >
                        <Plus size={20}/>
                      </button>
                    </div>
                  </div>

                  {/* Intensity Sliders (Internal recorded only) */}
                  {cat.hasIntensity && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-slate-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recorded Intensity (Not in score)</p>
                      {cat.id === 'fragrance_aroma' ? (
                        <>
                          {['fragrance_dry', 'fragrance_break'].map((ikey, idx) => (
                            <div key={ikey} className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-slate-400 w-10 uppercase">{cat.intensityLabels?.[idx]}</span>
                              <div className="flex-1 flex justify-between gap-1">
                                {[1, 2, 3, 4, 5].map((val) => (
                                  <button
                                    key={val}
                                    onClick={() => updateIntensity(ikey as keyof IntensityMetrics, val)}
                                    className={`flex-1 h-1.5 rounded-full transition-all ${intensities[ikey as keyof IntensityMetrics] >= val ? 'bg-amber-400' : 'bg-slate-200'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-400 w-10 uppercase">{cat.intensityLabels?.[0]}</span>
                          <div className="flex-1 flex justify-between gap-1">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                key={val}
                                onClick={() => updateIntensity(cat.id as keyof IntensityMetrics, val)}
                                className={`flex-1 h-1.5 rounded-full transition-all ${intensities[cat.id as keyof IntensityMetrics] >= val ? 'bg-amber-400' : 'bg-slate-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Consistency Items */}
              <div className="space-y-4 pt-6 border-t-4 border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Consistency Checks (5-Cup Score)</h3>
                {['uniformity', 'cleanCup', 'sweetness'].map((id) => (
                  <div key={id} className="p-4 rounded-2xl bg-white border-2 border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm sm:text-base font-black text-slate-700 capitalize">{id.replace(/([A-Z])/g, ' $1')}</h4>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <div key={i} className={`w-3 h-1 rounded-full ${checks[id as keyof typeof checks][i] ? 'bg-amber-500' : 'bg-slate-100'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      {checks[id as keyof typeof checks].map((checked, i) => (
                        <button
                          key={i}
                          onClick={() => toggleCheck(id as any, i)}
                          className={`flex-1 h-12 rounded-xl border-2 sm:border-4 transition-all flex items-center justify-center ${checked ? 'bg-amber-500 border-amber-600 shadow-inner' : 'bg-slate-50 border-slate-200'}`}
                        >
                           {checked && <Check className="text-white" size={24} strokeWidth={4} />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Defects Section */}
              <div className="p-5 rounded-3xl bg-red-50 border-2 border-red-100 mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-red-500" size={22} />
                  <h4 className="text-sm font-black text-red-900 uppercase">Defects Deduction</h4>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-red-700 uppercase tracking-widest">Number of Cups with issues (0-5)</label>
                    <div className="flex gap-2">
                       {[0, 1, 2, 3, 4, 5].map(n => (
                         <button 
                           key={n}
                           onClick={() => setDefects({...defects, cups: n})}
                           className={`flex-1 py-3 rounded-xl font-black text-sm transition-all border-2 ${defects.cups === n ? 'bg-red-600 border-red-700 text-white shadow-md' : 'bg-white border-red-200 text-red-900'}`}
                         >
                           {n}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-red-700 uppercase tracking-widest">Intensity Type</label>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setDefects({...defects, type: 2})}
                        className={`flex-1 py-3 rounded-xl border-2 font-black text-xs uppercase transition-all ${defects.type === 2 ? 'bg-red-600 border-red-700 text-white' : 'bg-white border-red-200 text-red-900'}`}
                      >
                        Taint (-2)
                      </button>
                      <button 
                        onClick={() => setDefects({...defects, type: 4})}
                        className={`flex-1 py-3 rounded-xl border-2 font-black text-xs uppercase transition-all ${defects.type === 4 ? 'bg-red-800 border-red-950 text-white' : 'bg-white border-red-200 text-red-900'}`}
                      >
                        Fault (-4)
                      </button>
                    </div>
                  </div>
                </div>
                {defects.cups > 0 && (
                  <div className="mt-4 pt-3 border-t border-red-200 text-center">
                    <p className="text-[11px] text-red-600 font-black uppercase tracking-widest">
                      Final Deduction: -{defects.cups * defects.type}.00 pts
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Final Observations */}
        <section className="bg-white p-3 sm:p-5 rounded-3xl shadow-sm border-2 border-slate-100">
          <h2 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MessageSquare size={18} /> Final Observations
          </h2>
          <textarea 
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm sm:text-base focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 min-h-[140px] outline-none transition-all placeholder:text-slate-300"
            placeholder="Complex flavor notes, mouthfeel texture, or structural balance..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-30">
        <button className="max-w-2xl mx-auto w-full bg-[#0f172a] text-white py-5 rounded-3xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] transition-all hover:bg-black uppercase tracking-widest">
          <Save size={24} /> 
          SAVE FINAL LOG
        </button>
      </div>
    </div>
  );
}