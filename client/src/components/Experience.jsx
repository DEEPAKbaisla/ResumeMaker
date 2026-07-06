import {
  Briefcase,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Check,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import api from "../configs/api";
import toast from "react-hot-toast";

const Experience = ({ data, onChange }) => {
  const { token } = useSelector((state) => state.auth);
  const [generatingIndex, setGeneratingIndex] = useState(-1);

  const addExperience = () => {
    const newExp = {
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      description: "",
      is_current: false,
    };
    onChange([...data, newExp]);
  };

  const removeExperience = (idx) => {
    onChange(data.filter((_, i) => i !== idx));
  };

  const updateExperience = (idx, field, value) => {
    const updated = [...data];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const enhanceDescription = async (idx) => {
    setGeneratingIndex(idx);
    const exp = data[idx];
    const prompt = `enhance this job description ${exp.description} for the position of ${exp.position} at ${exp.company}.`;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // console.log(config);

      const { data: resp } = await api.post(
        "/api/ai/enhance-job-desc",
        { userContent: prompt },
        config,
      );
      updateExperience(idx, "description", resp.enhanceContent);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setGeneratingIndex(-1);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Professional Experience
          </h3>
          <p className="text-sm text-slate-500">Add your work history.</p>
        </div>
        <button
          onClick={addExperience}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
          <Plus className="size-4" /> Add Experience
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-600 mb-2">No experience added yet.</p>
          <p className="text-sm text-slate-500">
            Click "Add Experience" to start.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((exp, idx) => (
            <div
              key={idx}
              className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm relative group">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h4 className="font-semibold text-slate-800">
                  Experience #{idx + 1}
                </h4>
                <button
                  onClick={() => removeExperience(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(idx, "company", e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm"
                />
                <input
                  type="text"
                  placeholder="Job Title"
                  value={exp.position}
                  onChange={(e) =>
                    updateExperience(idx, "position", e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm"
                />
                <input
                  type="month"
                  placeholder="Start Date"
                  value={exp.start_date}
                  onChange={(e) =>
                    updateExperience(idx, "start_date", e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm"
                />
                <input
                  type="month"
                  placeholder="End Date"
                  value={exp.end_date}
                  onChange={(e) =>
                    updateExperience(idx, "end_date", e.target.value)
                  }
                  disabled={exp.is_current}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none disabled:opacity-50 disabled:bg-slate-100 focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm"
                />
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Check className="size-4 text-slate-500" /> Currently Working
                  <input
                    type="checkbox"
                    checked={exp.is_current || false}
                    onChange={(e) =>
                      updateExperience(idx, "is_current", e.target.checked)
                    }
                    className="ml-2"
                  />
                </label>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-slate-700">
                    Job Description
                  </label>
                  <button
                    onClick={() => enhanceDescription(idx)}
                    disabled={
                      generatingIndex === idx || !exp.position || !exp.company
                    }
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors disabled:opacity-50">
                    {generatingIndex === idx ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {generatingIndex === idx ? "Enhancing..." : "Enhance AI"}
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Describe responsibilities and achievements..."
                  value={exp.description}
                  onChange={(e) =>
                    updateExperience(idx, "description", e.target.value)
                  }
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Experience;
