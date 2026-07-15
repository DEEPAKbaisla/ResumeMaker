import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import {
  BrainIcon,
  SparklesIcon,
  UploadIcon,
  FileTextIcon,
  CalendarIcon,
  AwardIcon,
  ChevronRightIcon,
  BriefcaseIcon,
  UserIcon,
  PlusIcon,
  TrashIcon,
  LoaderCircleIcon,
  CheckCircle2Icon,
  DownloadIcon,
} from "lucide-react";
import api from "../configs/api";

const InterviewPrep = () => {
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [pastReports, setPastReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  
  // Form state
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showNewAnalysisForm, setShowNewAnalysisForm] = useState(false);

  // Delete states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reportsInLastHour = pastReports.filter(
    (report) => new Date(report.createdAt) >= new Date(Date.now() - 60 * 60 * 1000)
  );

  // Animated loader steps state
  const [loaderStep, setLoaderStep] = useState(0);
  const loaderSteps = [
    "Reading and parsing your resume PDF...",
    "Analyzing job description keywords...",
    "Evaluating match score and candidate fit...",
    "Identifying critical skill gaps & severity...",
    "Generating 7-day custom preparation tasks...",
    "Drafting behavioral & technical interview Q&As..."
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  // Animate the loader text
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      setLoaderStep(0);
      interval = setInterval(() => {
        setLoaderStep((prev) => (prev < loaderSteps.length - 1 ? prev + 1 : prev));
      }, 3000);
    } else {
      setLoaderStep(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const { data } = await api.get("/api/interview", {
        headers: { Authorization: token },
      });
      setPastReports(data.interviewReports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load past reports");
    } finally {
      setReportsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file only");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reportsInLastHour.length >= 5) {
      toast.error("You have reached the limit of 5 interview reports per hour. Please try again later.");
      return;
    }
    if (!resumeFile) {
      toast.error("Please upload your resume PDF");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste the job description");
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);

    try {
      const { data } = await api.post("/api/interview", formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast.success("Interview report generated successfully!");
      setIsAnalyzing(false);
      navigate(`/app/interview-prep/${data.interviewReport._id}`);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error(error.response?.data?.message || "Failed to generate interview report");
      setIsAnalyzing(false);
    }
  };

  const handleDownloadResume = async (reportId) => {
    const toastId = toast.loading("Generating tailored resume PDF...");
    try {
      const response = await api.post(
        `/api/interview/resume/pdf/${reportId}`,
        {},
        {
          headers: { Authorization: token },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `tailored_resume_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success("Resume PDF downloaded!", { id: toastId });
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error("Failed to download tailored PDF resume", { id: toastId });
    }
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    try {
      const { data } = await api.delete(`/api/interview/report/${reportToDelete}`, {
        headers: { Authorization: token },
      });
      toast.success(data.message || "Report deleted successfully");
      setPastReports((prev) => prev.filter((r) => r._id !== reportToDelete));
      setShowDeleteModal(false);
      setReportToDelete(null);
    } catch (error) {
      console.error("Delete report failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete report");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Interview Prep & Resume Matcher | ResumeMaker</title>
        <meta
          name="description"
          content="Review resume match scores, find missing skills, and prepare for interviews with a personalized AI plan."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-12 font-sans text-slate-800 pb-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200 pb-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <BrainIcon className="size-8 text-green-600 animate-pulse" />
                AI Interview Coach & Matcher
              </h1>
              <span className="inline-block bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {reportsInLastHour.length}/5 Analyses (Last Hour)
              </span>
            </div>
            <p className="text-slate-500">
              Evaluate your resume match with target jobs and prepare for interviews with custom guidance.
            </p>
          </div>
          
          {!showNewAnalysisForm && (
            <button
              onClick={() => {
                if (reportsInLastHour.length >= 5) {
                  toast.error("You have reached the limit of 5 interview reports per hour. Please try again later.");
                } else {
                  setShowNewAnalysisForm(true);
                }
              }}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer">
              <PlusIcon className="size-5" />
              New Analysis
            </button>
          )}
        </div>

        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="size-20 rounded-full bg-green-50 flex items-center justify-center mb-6 relative">
                <LoaderCircleIcon className="size-12 text-green-600 animate-spin" />
                <SparklesIcon className="size-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Profile</h2>
              <p className="text-slate-500 text-sm max-w-sm mb-8">
                Our Gemini AI is comparing your resume to the job description and preparing your mock questions. This will take about 15-20 seconds.
              </p>

              {/* Progress Steps */}
              <div className="w-full space-y-4 text-left border border-slate-100 bg-slate-50 p-6 rounded-2xl">
                {loaderSteps.map((stepText, idx) => {
                  const isActive = idx === loaderStep;
                  const isCompleted = idx < loaderStep;
                  return (
                    <div key={idx} className="flex items-center gap-3 transition-opacity duration-300">
                      {isCompleted ? (
                        <CheckCircle2Icon className="size-5 text-green-600 shrink-0" />
                      ) : isActive ? (
                        <LoaderCircleIcon className="size-5 text-green-600 animate-spin shrink-0" />
                      ) : (
                        <div className="size-5 rounded-full border-2 border-slate-200 shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          {idx + 1}
                        </div>
                      )}
                      <span className={`text-sm font-medium ${isActive ? "text-green-700 font-bold" : isCompleted ? "text-slate-500" : "text-slate-300"}`}>
                        {stepText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* New Analysis Form Component */}
        {showNewAnalysisForm && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-12 animate-in slide-in-from-top-6 duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <SparklesIcon className="size-5 text-green-600" />
                Start Match Analysis
              </h2>
              <button
                onClick={() => {
                  setShowNewAnalysisForm(false);
                  setResumeFile(null);
                  setJobDescription("");
                  setSelfDescription("");
                }}
                className="text-sm font-medium text-slate-400 hover:text-slate-600 px-3 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Form: Inputs */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Target Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={8}
                    onChange={(e) => setJobDescription(e.target.value)}
                    value={jobDescription}
                    placeholder="Paste the job description of the role you are applying for here..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all font-medium text-slate-800 placeholder-slate-400 text-sm leading-relaxed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Self Description / Additional Context (Optional)
                  </label>
                  <textarea
                    rows={4}
                    onChange={(e) => setSelfDescription(e.target.value)}
                    value={selfDescription}
                    placeholder="Provide details about your career goals, target salary, specific experiences you want highlighted, or anything else you'd like the AI Coach to know..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all font-medium text-slate-800 placeholder-slate-400 text-sm leading-relaxed"
                  />
                </div>
              </div>

              {/* Right Form: Resume Upload & Actions */}
              <div className="flex flex-col justify-between">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Upload Current Resume PDF <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="group flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200 hover:border-green-500 bg-slate-50 hover:bg-green-50/20 rounded-2xl p-10 cursor-pointer transition-colors relative min-h-[220px]">
                    {resumeFile ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="size-16 rounded-2xl bg-green-100 flex items-center justify-center mb-3">
                          <FileTextIcon className="size-8 text-green-600" />
                        </div>
                        <p className="text-green-800 font-semibold break-all text-sm px-4">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setResumeFile(null);
                          }}
                          className="mt-4 px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-red-100 cursor-pointer">
                          <TrashIcon className="size-3.5" />
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="size-14 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                          <UploadIcon className="size-6 text-slate-400 group-hover:text-green-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-700">
                            Click to upload PDF resume
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            PDF format only (Max 5MB)
                          </p>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      required={!resumeFile}
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer">
                    <BrainIcon className="size-5" />
                    Analyze & Generate Prep Plan
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* History List */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BriefcaseIcon className="size-5 text-slate-600" />
            Past Matching Reports
          </h2>

          {reportsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
              <LoaderCircleIcon className="size-8 text-green-600 animate-spin mb-4" />
              <p className="text-slate-400 text-sm font-medium">Loading reports...</p>
            </div>
          ) : pastReports.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed max-w-4xl mx-auto flex flex-col items-center justify-center px-6">
              <div className="size-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <BrainIcon className="size-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No Match Reports Yet</h3>
              <p className="text-slate-400 text-sm max-w-sm mt-1 mb-6">
                Start by uploading a resume PDF and a target job description to verify your fit score.
              </p>
              <button
                onClick={() => setShowNewAnalysisForm(true)}
                className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 font-bold px-5 py-2.5 rounded-xl border border-green-100 transition-colors cursor-pointer">
                <PlusIcon className="size-4" />
                Analyze First Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastReports.map((report, idx) => {
                // Color mapping for match scores
                const score = report.matchScore || 0;
                let scoreColorClass = "bg-red-50 text-red-700 border-red-100";
                if (score >= 75) {
                  scoreColorClass = "bg-green-50 text-green-700 border-green-100";
                } else if (score >= 50) {
                  scoreColorClass = "bg-orange-50 text-orange-700 border-orange-100";
                }

                return (
                  <div
                    key={report._id || idx}
                    onClick={() => navigate(`/app/interview-prep/${report._id}`)}
                    className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left group cursor-pointer relative">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${scoreColorClass}`}>
                          {score}% Match
                        </span>
                        
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1">
                          <button
                            onClick={() => handleDownloadResume(report._id)}
                            title="Download Tailored Resume"
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-green-600 transition-colors cursor-pointer">
                            <DownloadIcon className="size-4" />
                          </button>
                          <button
                            onClick={() => {
                              setReportToDelete(report._id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Report"
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                            <TrashIcon className="size-4" />
                          </button>
                          <div 
                            onClick={() => navigate(`/app/interview-prep/${report._id}`)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer flex items-center gap-0.5 ml-1">
                            <span className="text-xs font-semibold">View</span>
                            <ChevronRightIcon className="size-4" />
                          </div>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-800 text-base line-clamp-2 leading-snug mb-2 group-hover:text-green-700 transition-colors">
                        {report.title || "Job Analysis"}
                      </h3>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="size-3.5" />
                        {new Date(report.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>

                      {report.selfDescription && (
                        <span className="flex items-center gap-1">
                          <UserIcon className="size-3.5" />
                          Self Info
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="size-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="size-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Match Report?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete this AI interview preparation report? This will permanently delete the match score, checklist progress, and Q&As. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setReportToDelete(null);
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-sm">
                Cancel
              </button>
              <button
                onClick={handleDeleteReport}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold rounded-xl transition-colors cursor-pointer text-sm flex items-center justify-center gap-1.5">
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InterviewPrep;
