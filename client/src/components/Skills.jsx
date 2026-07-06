import { Plus, Sparkles, X } from "lucide-react";
import React, { useState } from "react";

const Skills = ({ data, onChange }) => {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !data.includes(trimmed)) {
      onChange([...data, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Skills</h3>
          <p className="text-sm text-slate-500">Add technical and soft skills.</p>
        </div>
        <button
          onClick={addSkill}
          disabled={!newSkill.trim()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="size-4" /> Add Skill
        </button>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter a skill (e.g., JavaScript, Leadership)"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
        />

        {data.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.map((skill, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => removeSkill(idx)}
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400">No skills added yet.</p>
        )}

        <div className="bg-indigo-50 p-3 rounded-lg">
          <p className="text-sm text-indigo-800">
            <strong>Tip:</strong> Include 8‑12 relevant skills, mixing technical and soft abilities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Skills;
