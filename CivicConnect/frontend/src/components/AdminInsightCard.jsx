import { useState } from 'react';
import axios from 'axios';
import { Bot, Loader2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function AdminAiInsight({ grievanceId }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calls the endpoint we just verified works
      const response = await axios.get(`http://localhost:8080/api/ai/explain/${grievanceId}`);
      
      // Handle case where backend returns an error string in JSON
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setExplanation(response.data);
    } catch (err) {
      setError("AI Service Unavailable (Quota limit or Network error). Please try again in 1 minute.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // State 1: Initial (Show Button)
  if (!explanation && !loading && !error) {
    return (
      <button 
        onClick={fetchExplanation}
        className="mt-3 flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-2 rounded-lg transition-colors border border-purple-200"
      >
        <Bot size={16} />
        ASK AI TO EXPLAIN THIS
      </button>
    );
  }

  // State 2: Loading
  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg animate-pulse">
        <Loader2 size={16} className="animate-spin" />
        Analyzing grievance details...
      </div>
    );
  }

  // State 3: Error
  if (error) {
    return (
      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-center gap-2">
        <AlertTriangle size={16} />
        {error}
        <button onClick={fetchExplanation} className="underline ml-2">Retry</button>
      </div>
    );
  }

  // State 4: Success (Show the 4 Fields)
  return (
    <div className="mt-4 bg-white border border-purple-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-purple-50 px-4 py-2 border-b border-purple-100 flex items-center gap-2">
        <Bot size={16} className="text-purple-600" />
        <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">AI Executive Summary</span>
      </div>
      
      <div className="p-4 space-y-4">
        {/* 1. Plain English Summary */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Simplification</h4>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">"{explanation.plain_english_summary}"</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 2. Key Problem */}
          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
            <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase mb-1">
              <AlertTriangle size={12} /> Core Issue
            </h4>
            <p className="text-xs text-red-800 font-semibold">{explanation.key_problem}</p>
          </div>

          {/* 3. Next Action */}
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase mb-1">
              <CheckCircle2 size={12} /> Recommended Action
            </h4>
            <p className="text-xs text-emerald-800 font-semibold">{explanation.what_admin_should_do_next}</p>
          </div>
        </div>

        {/* 4. Consequences */}
        <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
          <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Risks if Ignored</h4>
            <p className="text-xs text-slate-600 italic">{explanation.possible_consequences_if_ignored}</p>
          </div>
        </div>
      </div>
    </div>
  );
}