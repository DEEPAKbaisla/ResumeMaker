import {
  BriefcaseBusiness,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import React from "react";

const Personalinfo = ({
  data,
  onChange,
  removeBackground,
  setremoveBackground,
}) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };
  const fields = [
    {
      key: "full_name",
      label: "Full Name",
      icon: User,
      type: "text",
      required: true,
    },
    {
      key: "email",
      label: "Email Address",
      icon: Mail,
      type: "text",
      required: true,
    },
    {
      key: "phone",
      label: "Phone Number",
      icon: Phone,
      type: "text",
      required: true,
    },
    {
      key: "location",
      label: "Location",
      icon: MapPin,
      type: "text",
    },
    {
      key: "profession",
      label: "Profession",
      icon: BriefcaseBusiness,
      type: "text",
    },
    { key: "linkedin", label: "LinkedIn Profile", icon: Linkedin, type: "url" },
    { key: "website", label: "Personal Website", icon: Globe, type: "url" },
  ];
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">
          Personal Information
        </h3>
        <p className="text-sm text-slate-500 mt-1">Get started by adding your basic contact details.</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <label className="cursor-pointer group">
          {data.image ? (
            <div className="relative size-20 rounded-full">
              <img
                src={
                  typeof data.image === "string"
                    ? data.image
                    : URL.createObjectURL(data.image)
                }
                alt="user-image"
                className="w-full h-full rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-green-400 transition-all shadow-sm"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <span className="text-white text-xs font-medium">Change</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-600 hover:text-green-600 hover:border-green-400 hover:bg-green-50 transition-all">
              <div className="p-2 bg-white rounded-full shadow-sm">
                 <User className="size-5" />
              </div>
              <span className="text-sm font-medium">Upload Photo</span>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => handleChange("image", e.target.files[0])}
          />
        </label>
        {typeof data.image === "object" && (
          <div className="flex flex-col gap-1.5 p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-xs font-medium text-slate-600">Remove Background</p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                className="sr-only peer"
                type="checkbox"
                onChange={() => setremoveBackground((prev) => !prev)}
                checked={removeBackground}
              />
              <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-green-500 transition-colors duration-200 shadow-inner"></div>
              <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-5"></span>
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key} className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <Icon className="size-4 text-slate-400" />
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type={field.type}
                value={data[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-slate-800 placeholder-slate-400 font-medium"
                placeholder={`e.g. ${field.label}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Personalinfo;
