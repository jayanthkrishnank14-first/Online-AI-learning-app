import React, { useState } from 'react';
import { BrainCircuitIcon } from './Icons';
import { analyzeProgress } from '../services/geminiService';
import { StudentProfile, StudentResult } from '../types';

interface ProgressMentorProps {
  role: 'STUDENT' | 'TEACHER';
  data: StudentResult[] | StudentProfile[];
}

const ProgressMentor: React.FC<ProgressMentorProps> = ({ role, data }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    const result = await analyzeProgress(role, data);
    setAnalysis(result);
    setIsLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-100 shadow-sm relative overflow-hidden mt-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <BrainCircuitIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">AI {role === 'STUDENT' ? 'Learning Mentor' : 'Classroom Insight'}</h3>
          <p className="text-sm text-slate-500">
            {role === 'STUDENT' 
              ? "Get personalized feedback and study tips based on your performance." 
              : "Identify at-risk students and get teaching recommendations."}
          </p>
        </div>
      </div>

      {!analysis ? (
        <button 
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full bg-white border border-indigo-200 text-indigo-700 font-bold py-4 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              Analyzing Performance Data...
            </>
          ) : (
            <>Analyze Progress & Get Recommendations &rarr;</>
          )}
        </button>
      ) : (
        <div className="animate-fade-in space-y-4">
          <div className="prose prose-indigo text-slate-700 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm max-w-none">
            {analysis.split('\n').map((paragraph, idx) => (
               <p key={idx} className="mb-2 last:mb-0 leading-relaxed">{paragraph}</p>
            ))}
          </div>
          <button 
            onClick={() => setAnalysis(null)}
            className="text-xs text-slate-400 hover:text-indigo-600 font-medium underline"
          >
            Refresh Analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressMentor;