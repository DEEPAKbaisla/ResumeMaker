import React from "react";
import { Zap, Activity, Shield, FileText, BrainCircuit, TargetIcon } from "lucide-react";

const Features = () => {
  return (
    <div
      id="features"
      className="flex flex-col items-center py-20 px-4 md:px-16 lg:px-24 xl:px-40 bg-slate-50 text-slate-900 scroll-mt-12">
      <div className="flex items-center gap-2 text-sm text-green-700 border border-green-200 bg-green-100 rounded-full px-5 py-1.5 mb-6 shadow-sm">
        <Zap width={14} className="fill-green-600" />
        <span className="font-medium">Simple process</span>
      </div>
      
      <div className="max-w-3xl text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Build your resume in minutes</h2>
        <p className="text-slate-600 text-lg">
          Our streamlined process helps you to create a professional resume with intelligent AI-powered tools and features designed to get you hired.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl relative z-10">
        
        {/* AI Job Match - Full width hero card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 group relative p-8 rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -z-0 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] -z-0" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  <BrainCircuit className="text-white size-6" />
                </div>
                <span className="text-xs font-bold bg-white/20 border border-white/30 px-3 py-1 rounded-full uppercase tracking-wider">
                  AI Powered • New
                </span>
              </div>
              <h3 className="text-3xl font-extrabold mb-3 tracking-tight">
                AI Interview Coach & Resume Matcher
              </h3>
              <p className="text-green-100 text-lg leading-relaxed max-w-2xl">
                Analyze job requirements and your profile to build a winning strategy. Get a match score, uncover critical skill gaps, receive a tailored 7-day prep plan, and practice with custom interview Q&As — all powered by Gemini AI.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                {["Match Score", "Skill Gap Analysis", "7-Day Prep Plan", "Mock Interview Q&A", "Tailored Resume PDF"].map((tag) => (
                  <span key={tag} className="text-xs font-semibold bg-white/20 border border-white/20 px-3 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {/* Visual mock */}
            <div className="w-full lg:w-72 h-44 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-5 flex flex-col justify-between shrink-0 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-green-100 uppercase tracking-wider">Match Score</span>
                <span className="text-2xl font-black text-white">87%</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Technical Skills", pct: 90, color: "bg-white" },
                  { label: "Experience", pct: 80, color: "bg-green-200" },
                  { label: "Keywords", pct: 75, color: "bg-emerald-200" },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-green-100 font-medium">{bar.label}</span>
                      <span className="text-[10px] text-white font-bold">{bar.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className={`h-full ${bar.color} rounded-full opacity-90`} style={{ width: `${bar.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Large Feature Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 group relative p-8 rounded-3xl border border-slate-200 bg-white hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100 rounded-full blur-[80px] -z-10 group-hover:bg-violet-200 transition-all duration-500"></div>
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-violet-100 flex items-center justify-center border border-violet-200 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Activity className="text-violet-600 size-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">Real-Time Analytics</h3>
              <p className="text-slate-600 max-w-sm">
                Get instant insights into your resume's performance, ATS score, and view counts with our live dashboard.
              </p>
            </div>
            <div className="mt-8 relative h-48 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden shadow-inner">
              {/* Fake Dashboard Graphic */}
              <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end gap-2 px-6 pb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                  <div key={i} className="w-full bg-gradient-to-t from-violet-500 to-violet-300 rounded-t-sm shadow-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Standard Feature Card 1 */}
        <div className="group relative p-8 rounded-3xl border border-slate-200 bg-white hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-100 rounded-full blur-[80px] -z-10 group-hover:bg-green-200 transition-all duration-500"></div>
          <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center border border-green-200 mb-6 group-hover:scale-110 transition-transform duration-300">
            <Shield className="text-green-600 size-6" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-slate-800">Bank-Grade Security</h3>
          <p className="text-slate-600">
            End-to-end encryption, 2FA, and full compliance with GDPR standards ensuring your personal data is safe.
          </p>
        </div>

        {/* Standard Feature Card 2 */}
        <div className="group relative p-8 rounded-3xl border border-slate-200 bg-white hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-orange-100 rounded-full blur-[80px] -z-10 group-hover:bg-orange-200 transition-all duration-500"></div>
          <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center border border-orange-200 mb-6 group-hover:scale-110 transition-transform duration-300">
            <FileText className="text-orange-600 size-6" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-slate-800">Customizable Templates</h3>
          <p className="text-slate-600">
            Export professional, ATS-friendly resumes in PDF format tailored for modern hiring systems.
          </p>
        </div>

        {/* Wide Feature Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 group relative p-8 rounded-3xl border border-slate-200 bg-white hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row items-center gap-8">
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] -z-10 group-hover:bg-blue-200 transition-all duration-500"></div>
           <div className="flex-1">
             <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center border border-blue-200 mb-6 group-hover:scale-110 transition-transform duration-300">
               <Zap className="text-blue-600 size-6" />
             </div>
             <h3 className="text-2xl font-bold mb-3 text-slate-800">AI Content Generation</h3>
             <p className="text-slate-600">
               Struggling with what to write? Our AI analyzes your role and generates impactful bullet points and summaries instantly.
             </p>
           </div>
           <div className="w-full sm:w-64 h-40 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden p-4 relative shadow-inner">
              <div className="w-3/4 h-3 bg-slate-200 rounded-full mb-3"></div>
              <div className="w-full h-3 bg-slate-200 rounded-full mb-3"></div>
              <div className="w-5/6 h-3 bg-slate-200 rounded-full mb-3"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center animate-pulse shadow-md">
                 <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Features;

