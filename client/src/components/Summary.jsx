import { Loader2, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../configs/api.js";

const Summary = ({ data, onChange, setResumeData }) => {
  const { token } = useSelector((state) => state.auth);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = async () => {
    try {
      setIsGenerating(true);
      const prompt = `enhance my professional summary ${data}`;
      const response = await api.post(
        "/api/ai/enhance-pro-sum",
        { userContent: prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResumeData((prev) => ({
        ...prev,
        professional_summary: response.data.enhanceContent,
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Professional Summary
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Write a compelling overview of your career.
          </p>
        </div>
        <button
          disabled={isGenerating || !data}
          onClick={generateSummary}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
          {isGenerating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {isGenerating ? "Enhancing..." : "AI Enhance"}
        </button>
      </div>

      <div className="space-y-3">
        <textarea
          rows={7}
          value={data || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-slate-800 placeholder-slate-400 font-medium resize-none"
          placeholder="e.g. Results-driven Software Engineer with 5+ years of experience building scalable web applications..."
        />
        <p className="text-xs font-medium text-slate-400 text-center">
          Tip: Keep it concise (3-4 sentences) and focus on your most relevant achievements.
        </p>
      </div>
    </div>
  );
};

export default Summary;
