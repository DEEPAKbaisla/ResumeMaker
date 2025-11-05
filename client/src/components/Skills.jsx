import { Plus, Sparkles, X } from "lucide-react";
import React, { useState } from "react";

const Skills = ({ data, onChange }) => {
  const [newSkill, setNewSkill] = useState("");
  const addSkill = () => {
    if (newSkill.trim() && !data.includes(newSkill.trim())) {
      onChange([...data, newSkill.trim()]);
      setNewSkill("");
    }
  };
  const removeSkills = (indexToRemove) => {
    // onChange(data.filter((_, index) => indexToRemove));
    onChange(data.filter((_, index) => index !== indexToRemove));
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };
  return (
    <div className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          Skills
        </h3>
        <p className="text-sm text-gray-500">
          Add your technical and soft Skills
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter a Skill (e.g.,JavaScript ,Project Managment)"
          className="flex-1 px-3 py-2 text-sm"
          onChange={(e) => setNewSkill(e.target.value)}
          value={newSkill}
          onKeyDown={handleKeyPress}
        />
        <button
          onClick={addSkill}
          disabled={!newSkill.trim()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-1g hover:bg-blue-700 transition-colors disabled: opacity-50">
          <Plus className="size-4" /> Add
        </button>
      </div>
      {data.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.map((Skills, index) => (
            <span
              key={index}
              className="flex item-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {Skills}
              <button
                onClick={() => {
                  removeSkills(index);
                }}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 text-gray-500">
          <Sparkles className="w-10 h-10 mx-auto mb-2 text-gray-300" />
        </div>
      )}
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong>Add 8-12 relevant skils.Include both technical
          skills (programming languages ,tools) and soft skills (leadership ,
          communication)
        </p>
      </div>
    </div>
  );
};

export default Skills;
