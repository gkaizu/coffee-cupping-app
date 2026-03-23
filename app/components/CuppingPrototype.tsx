import React, { useState } from 'react';
import { Plus, Minus, Coffee, Save, Calculator } from 'lucide-react';

/**
 * SCA (Specialty Coffee Association) 準拠のカッピングフォーム・コンポーネント
 */

type ScoringCategory = {
  id: string;
  name: string;
  description: string;
};

const CATEGORIES: ScoringCategory[] = [
  { id: 'fragrance', name: 'Fragrance / Aroma', description: 'Dry and wet evaluation' },
  { id: 'flavor', name: 'Flavor', description: 'The overall taste profile' },
  { id: 'aftertaste', name: 'Aftertaste', description: 'Length and quality of finish' },
  { id: 'acidity', name: 'Acidity', description: 'Brightness and intensity' },
  { id: 'body', name: 'Body', description: 'Weight and texture' },
];

export default function CuppingPrototype() {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES.map(c => [c.id, 6.0]))
  );
  const [defects, setDefects] = useState({ cups: 0, intensity: 0 });

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) - (defects.cups * defects.intensity);

  const adjustScore = (id: string, delta: number) => {
    setScores(prev => ({
      ...prev,
      [id]: Math.min(Math.max(prev[id] + delta, 0), 10)
    }));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coffee className="text-amber-700" />
            Coffee Cupping App
          </h1>
          <p className="text-slate-500 text-sm">SCA Standard Protocol v1.0</p>
        </div>
        <div className="bg-amber-100 text-amber-900 px-4 py-2 rounded-xl border border-amber-200 shadow-sm">
          <span className="text-xs uppercase font-bold block">Total Score</span>
          <span className="text-2xl font-black">{totalScore.toFixed(2)}</span>
        </div>
      </header>

      <section className="space-y-4">
        {CATEGORIES.map((category) => (
          <div key={category.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">{category.name}</h3>
              <p className="text-xs text-slate-400">{category.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => adjustScore(category.id, -0.25)}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Minus size={18} />
              </button>
              <div className="w-12 text-center">
                <span className="text-lg font-mono font-bold">{scores[category.id].toFixed(2)}</span>
              </div>
              <button 
                type="button"
                onClick={() => adjustScore(category.id, 0.25)}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8 bg-red-50 p-6 rounded-2xl border border-red-100">
        <h3 className="font-bold text-red-900 flex items-center gap-2 mb-4">
          <Calculator size={18} />
          Defects (自動計算)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-red-700 font-bold block mb-1">CUPS (0-5)</label>
            <input 
              type="number" 
              min="0" max="5"
              value={defects.cups}
              onChange={(e) => setDefects({...defects, cups: parseInt(e.target.value) || 0})}
              className="w-full bg-white border border-red-200 rounded-lg p-2 text-center font-bold"
            />
          </div>
          <div>
            <label className="text-xs text-red-700 font-bold block mb-1">INTENSITY (2 or 4)</label>
            <select 
              value={defects.intensity}
              onChange={(e) => setDefects({...defects, intensity: parseInt(e.target.value) || 0})}
              className="w-full bg-white border border-red-200 rounded-lg p-2 text-center font-bold appearance-none"
            >
              <option value="0">None</option>
              <option value="2">2 (Taint)</option>
              <option value="4">4 (Fault)</option>
            </select>
          </div>
        </div>
      </section>

      <footer className="mt-8 pb-12">
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
          <Save size={20} />
          Save Cupping Log
        </button>
        <p className="mt-4 text-center text-xs text-slate-400">
          Single Table Design に基づき DynamoDB へ保存されます
        </p>
      </footer>
    </div>
  );
}