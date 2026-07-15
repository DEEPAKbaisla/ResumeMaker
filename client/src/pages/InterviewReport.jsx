import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  DownloadIcon,
  BrainIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircle2Icon,
  CalendarIcon,
  BookOpenIcon,
  UserCheckIcon,
  FileTextIcon,
  LoaderCircleIcon,
  InfoIcon,
  LightbulbIcon,
  BookmarkCheckIcon,
} from "lucide-react";
import api from "../configs/api";

const InterviewReport = () => {
  const { token } = useSelector((state) => state.auth);
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("plan"); // "plan" | "technical" | "behavioral" | "context"
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [checkedTasks, setCheckedTasks] = useState({});

  useEffect(() => {
    fetchReportDetails();
  }, [interviewId]);

  // Load checked tasks progress from localStorage
  useEffect(() => {
    if (report) {
      const savedProgress = localStorage.getItem(`interview_prep_progress_${interviewId}`);
      if (savedProgress) {
        try {
          setCheckedTasks(JSON.parse(savedProgress));
        } catch (e) {
          console.error("Error loading task progress", e);
        }
      }
    }
  }, [report, interviewId]);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/interview/report/${interviewId}`, {
        headers: { Authorization: token },
      });
      setReport(data.interviewReport);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load interview report details");
    } finally {
      setLoading(false);
    }
  };

 
  const toggleQuestion = (id) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTaskToggle = (dayIndex, taskIndex) => {
    const key = `day-${dayIndex}-task-${taskIndex}`;
    const newChecked = {
      ...checkedTasks,
      [key]: !checkedTasks[key],
    };
    setCheckedTasks(newChecked);
    localStorage.setItem(`interview_prep_progress_${interviewId}`, JSON.stringify(newChecked));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] font-sans">
        <LoaderCircleIcon className="size-10 text-green-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading report details...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 font-sans px-6">
        <div className="size-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertCircleIcon className="size-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Report Not Found</h2>
        <p className="text-slate-500 text-sm mt-2 mb-8">
          The requested interview preparation report could not be found or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate("/app/interview-prep")}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const score = report.matchScore || 0;
  
  // Calculate SVG circular stroke values
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Rating styles
  let scoreColorClass = "text-red-600";
  let scoreCircleGradient = "from-red-500 to-rose-600";
  let feedbackText = "Needs Improvement. Consider reviewing the skill gaps and completing the 7-day preparation plan to build confidence.";
  
  if (score >= 75) {
    scoreColorClass = "text-green-600";
    scoreCircleGradient = "from-green-500 to-emerald-600";
    feedbackText = "Excellent Fit! Your profile matches the key job criteria. Focus on practicing the Q&As and downloading your tailored resume.";
  } else if (score >= 50) {
    scoreColorClass = "text-orange-500";
    scoreCircleGradient = "from-amber-500 to-orange-600";
    feedbackText = "Good Fit. You satisfy many parameters. Complete the daily checklist plan to fill the missing gaps identified below.";
  }

  // Count total tasks vs checked tasks
  let totalTasksCount = 0;
  let completedTasksCount = 0;
  report.preparationPlan?.forEach((dayPlan, dayIdx) => {
    dayPlan.tasks?.forEach((_, taskIdx) => {
      totalTasksCount++;
      if (checkedTasks[`day-${dayIdx}-task-${taskIdx}`]) {
        completedTasksCount++;
      }
    });
  });
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <>
      <Helmet>
        <title>{`Interview Prep: ${report.title || "Job match"} | ResumeMaker`}</title>
        <meta name="description" content="Detailed resume matching score, skill gaps, custom 7-day plan, and customized interview preparation advice." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-10 font-sans text-slate-800 pb-28">
        
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 print:hidden">
          <button
            onClick={() => navigate("/app/interview-prep")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors cursor-pointer self-start sm:self-auto">
            <ArrowLeftIcon className="size-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-5 py-3 rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer text-sm">
              <DownloadIcon className="size-4" />
              Print/Save Prep Report
            </button>
            
          </div>
        </div>

        {/* Title */}
        <div className="mb-10">
          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase tracking-wide border border-slate-200 print:hidden">
            Analysis Report
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-3 max-w-4xl leading-tight">
            {report.title}
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-1.5 font-medium">
            <CalendarIcon className="size-4" />
            Generated on {new Date(report.createdAt).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Top Summary Section: Match Score and Skill Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Match Score Card */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            
            {/* Score Ring */}
            <div className="relative size-32 shrink-0 flex items-center justify-center">
              <svg className="size-full -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-slate-100 fill-none"
                  strokeWidth="8"
                />
                {/* Colored Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-green-600 fill-none transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-slate-800">{score}%</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fit Score</p>
              </div>
            </div>

            {/* Score Meta */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Resume Matching Fit</h2>
              <p className="text-slate-500 text-xs leading-relaxed">
                {feedbackText}
              </p>
            </div>
          </div>

          {/* Skill Gaps Card */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <AlertCircleIcon className="size-5 text-slate-600" />
                Identified Skill Gaps
              </h2>
              <p className="text-slate-400 text-xs mb-4 font-medium">
                Gemini detected these missing keywords or technologies from the job requirements.
              </p>

              {report.skillGaps?.length === 0 ? (
                <p className="text-green-600 text-sm font-semibold flex items-center gap-1.5 mt-2 bg-green-50/50 p-3 rounded-xl border border-green-100 border-dashed">
                  <CheckCircle2Icon className="size-4" />
                  No significant skill gaps found! Your resume perfectly covers the job criteria.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {report.skillGaps?.map((gap, idx) => {
                    let badgeColor = "bg-red-50 text-red-700 border-red-100";
                    if (gap.severity === "medium") {
                      badgeColor = "bg-orange-50 text-orange-700 border-orange-100";
                    } else if (gap.severity === "low") {
                      badgeColor = "bg-yellow-50 text-yellow-800 border-yellow-200";
                    }

                    return (
                      <span
                        key={idx}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 capitalize ${badgeColor}`}>
                        <span className={`size-1.5 rounded-full shrink-0 ${
                          gap.severity === "high" ? "bg-red-600" : gap.severity === "medium" ? "bg-orange-500" : "bg-yellow-500"
                        }`} />
                        {gap.skill}
                        <span className="text-[10px] font-medium opacity-60">({gap.severity})</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs and Main Content */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-4 min-h-[600px]">
          
          {/* Tab Sidebar */}
          <div className="bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-1.5 print:hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">Sections</h3>
            
            <button
              onClick={() => setActiveTab("plan")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer text-left ${
                activeTab === "plan"
                  ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}>
              <BookmarkCheckIcon className="size-4" />
              7-Day Prep Plan
              {progressPercent > 0 && (
                <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  activeTab === "plan" ? "bg-green-700 text-white" : "bg-green-100 text-green-700"
                }`}>
                  {progressPercent}%
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("technical")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer text-left ${
                activeTab === "technical"
                  ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}>
              <BookOpenIcon className="size-4" />
              Technical Questions
              <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${
                activeTab === "technical" ? "bg-green-700 text-white" : "bg-slate-200 text-slate-600"
              }`}>
                5
              </span>
            </button>

            <button
              onClick={() => setActiveTab("behavioral")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer text-left ${
                activeTab === "behavioral"
                  ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}>
              <UserCheckIcon className="size-4" />
              Behavioral Questions
              <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${
                activeTab === "behavioral" ? "bg-green-700 text-white" : "bg-slate-200 text-slate-600"
              }`}>
                5
              </span>
            </button>

            <button
              onClick={() => setActiveTab("context")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer text-left ${
                activeTab === "context"
                  ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}>
              <FileTextIcon className="size-4" />
              Submission Context
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="lg:col-span-3 print:col-span-4 p-8">
            
            {/* 7-DAY PREPARATION ROADMAP */}
            {activeTab === "plan" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-xl font-bold text-slate-900">7-Day Interview Preparation Timeline</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Check off tasks as you prepare. Progress is saved locally.
                  </p>
                  
                  {/* Progress Bar */}
                  {totalTasksCount > 0 && (
                    <div className="mt-4 flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                      <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 transition-all duration-500 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 shrink-0">
                        {completedTasksCount} / {totalTasksCount} Completed ({progressPercent}%)
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {report.preparationPlan?.map((dayPlan, dayIdx) => (
                    <div key={dayIdx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-green-700 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                          Day {dayPlan.day}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm md:text-base flex-1 ml-4 line-clamp-1">
                          {dayPlan.focus}
                        </h4>
                      </div>
                      
                      <div className="p-5 divide-y divide-slate-100">
                        {dayPlan.tasks?.map((task, taskIdx) => {
                          const taskKey = `day-${dayIdx}-task-${taskIdx}`;
                          const isChecked = checkedTasks[taskKey] || false;
                          return (
                            <label
                              key={taskIdx}
                              className={`flex items-start gap-3.5 py-3 cursor-pointer group select-none transition-colors ${
                                isChecked ? "text-slate-400 line-through" : "text-slate-700"
                              }`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTaskToggle(dayIdx, taskIdx)}
                                className="mt-1 size-4 rounded text-green-600 focus:ring-green-500 border-slate-300"
                              />
                              <span className="text-sm font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                                {task}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TECHNICAL QUESTIONS AND GUIDANCE */}
            {activeTab === "technical" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Custom Technical Questions</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Based on your skills and the job requirement. Click on a question to expand its answers.
                  </p>
                </div>

                <div className="space-y-4">
                  {report.technicalQuestions?.map((q, idx) => {
                    const qId = `tech-${idx}`;
                    const isExpanded = expandedQuestions[qId] || false;

                    return (
                      <div
                        key={idx}
                        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                          isExpanded ? "border-green-600 shadow-md" : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}>
                        
                        {/* Header click toggle */}
                        <button
                          onClick={() => toggleQuestion(qId)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer font-bold text-slate-800 text-sm md:text-base gap-4">
                          <span className="flex gap-3 items-start">
                            <span className="size-6 rounded-full bg-green-50 text-green-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-green-100">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{q.question}</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUpIcon className="size-5 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDownIcon className="size-5 text-slate-400 shrink-0" />
                          )}
                        </button>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/50 animate-in fade-in duration-300">
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                              <InfoIcon className="size-5 text-blue-600 shrink-0 mt-0.5" />
                              <div>
                                <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1">Interviewer's Intention</h5>
                                <p className="text-blue-950 text-sm leading-relaxed font-medium">
                                  {q.intention}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-green-50/30 rounded-xl border border-green-100 flex items-start gap-3">
                              <LightbulbIcon className="size-5 text-green-600 shrink-0 mt-0.5" />
                              <div>
                                <h5 className="text-xs font-bold text-green-900 uppercase tracking-wide mb-1">How to Structure Your Answer</h5>
                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                                  {q.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BEHAVIORAL QUESTIONS */}
            {activeTab === "behavioral" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Custom Behavioral Questions</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Targeting key cultural values, leadership traits, and team fit. Click to expand.
                  </p>
                </div>

                <div className="space-y-4">
                  {report.behavioralQuestions?.map((q, idx) => {
                    const qId = `beh-${idx}`;
                    const isExpanded = expandedQuestions[qId] || false;

                    return (
                      <div
                        key={idx}
                        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                          isExpanded ? "border-green-600 shadow-md" : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}>
                        
                        <button
                          onClick={() => toggleQuestion(qId)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer font-bold text-slate-800 text-sm md:text-base gap-4">
                          <span className="flex gap-3 items-start">
                            <span className="size-6 rounded-full bg-green-50 text-green-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-green-100">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{q.question}</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUpIcon className="size-5 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDownIcon className="size-5 text-slate-400 shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/50 animate-in fade-in duration-300">
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                              <InfoIcon className="size-5 text-blue-600 shrink-0 mt-0.5" />
                              <div>
                                <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1">Interviewer's Intention</h5>
                                <p className="text-blue-950 text-sm leading-relaxed font-medium">
                                  {q.intention}
                                </p>
                              </div>
                            </div>

                            <div className="p-4 bg-green-50/30 rounded-xl border border-green-100 flex items-start gap-3">
                              <LightbulbIcon className="size-5 text-green-600 shrink-0 mt-0.5" />
                              <div>
                                <h5 className="text-xs font-bold text-green-900 uppercase tracking-wide mb-1">How to Structure Your Answer</h5>
                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                                  {q.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CONTEXT INFORMATION SUBMITTED */}
            {activeTab === "context" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-xl font-bold text-slate-900">Submission Details</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    The details you entered when running this matching analysis.
                  </p>
                </div>

                <div className="space-y-6">
                  {report.selfDescription && (
                    <div className="border border-slate-200 p-6 rounded-2xl bg-slate-50/50">
                      <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-2">Self Description / Objectives</h4>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {report.selfDescription}
                      </p>
                    </div>
                  )}

                  <div className="border border-slate-200 p-6 rounded-2xl bg-slate-50/50">
                    <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-2">Job Description Text</h4>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium max-h-[350px] overflow-y-auto">
                      {report.jobDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </>
  );
};

export default InterviewReport;
