import {
  FilePenLineIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadCloud,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../configs/api.js";
// import pdfToText from "react-pdftotext";

const Dashboard = () => {
  const { user, token } = useSelector((state) => state.auth);

  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899"];
  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get("/api/users/resumes", {
        headers: { Authorization: token },
      });
      setAllResumes(data.resumes);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const createResume = async (event) => {
    event.preventDefault();

    try {
      const { data } = await api.post(
        "/api/resumes/create",
        { title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAllResumes([...allResumes, data.resume]);
      setTitle("");
      setShowCreateResume(false);

      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) {
      console.error("❌ Error creating resume:", error.response || error);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const uploadResume = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
        const { default: pdfToText } = await import("react-pdftotext");
      const resumeText = await pdfToText(resume);
      const { data } = await api.post(
        "/api/ai/upload-resume",
        { title, resumeText },
        { headers: { Authorization: token } },
      );
      setTitle("");
      setResume(null);
      setShowUploadResume(false);
      navigate(`/app/builder/${data.resumeId}`);
    } catch (error) {
      // console.log("Backend Error:", error.response?.data);
      toast.error(error.response?.data?.message || error.message);
    }
    setIsLoading(false);
  };

  const editTitle = async (event) => {
    try {
      event.preventDefault();
      const { data } = await api.put(
        `/api/resumes/update`,
        { resumeId: editResumeId, resumeData: { title } },
        { headers: { Authorization: token } },
      );
      setAllResumes(
        allResumes.map((resume) =>
          resume._id === editResumeId ? { ...resume, title } : resume,
        ),
      );
      setTitle("");
      setEditResumeId("");
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };
  
 const deleteResume = async () => {
    try {
      console.log("Resume ID:", resumeToDelete);
      const { data } = await api.delete(
        `/api/resumes/delete/${resumeToDelete}`,
        {
          headers: { Authorization: token },
        },
      );

      setAllResumes((prev) =>
        prev.filter((resume) => resume._id !== resumeToDelete),
      );

      toast.success(data.message);

      setShowDeleteModal(false);
      setResumeToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  useEffect(() => {
    loadAllResumes();
  }, []);

  return (
    <div className="font-sans text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Resumes</h1>
          <p className="text-slate-500">
            Manage your documents and track your applications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Create New Card */}
          <button
            onClick={() => setShowCreateResume(true)}
            className="w-full h-[260px] bg-white flex flex-col items-center justify-center rounded-2xl gap-4 border border-slate-200 group hover:border-green-500 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-green-50/0 group-hover:bg-green-50/50 transition-colors duration-300"></div>
            <div className="relative z-10 size-14 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-green-100 group-hover:scale-110 transition-all duration-300 border border-slate-100 group-hover:border-green-200">
              <PlusIcon className="size-6 text-slate-400 group-hover:text-green-600 transition-colors" />
            </div>
            <p className="relative z-10 font-semibold text-slate-700 group-hover:text-green-700 transition-colors">
              Create New
            </p>
          </button>

          {/* Upload Resume Card */}
          <button
            onClick={() => setShowUploadResume(true)}
            className="w-full h-[260px] bg-white flex flex-col items-center justify-center rounded-2xl gap-4 border border-slate-200 group hover:border-violet-500 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-violet-50/0 group-hover:bg-violet-50/50 transition-colors duration-300"></div>
            <div className="relative z-10 size-14 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-violet-100 group-hover:scale-110 transition-all duration-300 border border-slate-100 group-hover:border-violet-200">
              <UploadCloudIcon className="size-6 text-slate-400 group-hover:text-violet-600 transition-colors" />
            </div>
            <p className="relative z-10 font-semibold text-slate-700 group-hover:text-violet-700 transition-colors">
              Upload PDF
            </p>
          </button>

          {/* Existing Resumes */}
          {allResumes.map((resume, index) => {
            const baseColor = colors[index % colors.length];
            return (
              <button
                key={index}
                onClick={() => navigate(`/app/builder/${resume._id}`)}
                className="w-full h-[260px] relative bg-white flex flex-col rounded-2xl border border-slate-200 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left">
                {/* Header Graphic */}
                <div
                  className="h-28 w-full relative flex items-center justify-center transition-colors"
                  style={{ backgroundColor: `${baseColor}15` }}>
                  <FilePenLineIcon
                    className="size-10 opacity-80 group-hover:scale-110 transition-transform duration-300"
                    style={{ color: baseColor }}
                  />

                  {/* Hover Actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-white/50 shadow-sm">
                    <button
                      onClick={() => {
                        setEditResumeId(resume._id);
                        setTitle(resume.title);
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-blue-600 transition-colors">
                      <PencilIcon className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        setResumeToDelete(resume._id);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-red-600 transition-colors">
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Info block */}
                <div className="flex-1 p-5 flex flex-col justify-between bg-white border-t border-slate-100">
                  <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight">
                    {resume.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-2">
                    Updated{" "}
                    {new Date(resume.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Create Modal */}
        {showCreateResume && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateResume(false)}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowCreateResume(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <XIcon className="size-5" />
              </button>

              <div className="mb-8">
                <div className="size-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                  <PlusIcon className="size-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Create new resume
                </h2>
                <p className="text-slate-500 text-sm">
                  Give your new document a recognizable name.
                </p>
              </div>

              <form onSubmit={createResume} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Resume Title
                  </label>
                  <input
                    autoFocus
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    type="text"
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all font-medium text-slate-800 placeholder-slate-400"
                    required
                  />
                </div>
                <button className="w-full py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md">
                  Create Resume
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadResume && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadResume(false)}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  setShowUploadResume(false);
                  setTitle("");
                  setResume(null);
                }}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <XIcon className="size-5" />
              </button>

              <div className="mb-8">
                <div className="size-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                  <UploadCloudIcon className="size-6 text-violet-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Upload existing PDF
                </h2>
                <p className="text-slate-500 text-sm">
                  Our AI will extract the text to pre-fill your new resume.
                </p>
              </div>

              <form onSubmit={uploadResume} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Resume Title
                  </label>
                  <input
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    type="text"
                    placeholder="e.g. Current CV"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all font-medium text-slate-800 placeholder-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select File
                  </label>
                  <label
                    htmlFor="resume-input"
                    className="group flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl p-8 cursor-pointer hover:border-violet-500 hover:bg-violet-50 transition-colors">
                    {resume ? (
                      <div className="flex flex-col items-center">
                        <FilePenLineIcon className="size-8 text-violet-600 mb-2" />
                        <p className="text-violet-700 font-medium text-center break-all text-sm">
                          {resume.name}
                        </p>
                        <p className="text-xs text-violet-500 mt-1">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="size-12 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:border-violet-300 transition-colors">
                          <UploadCloud className="size-5 text-slate-400 group-hover:text-violet-600 transition-colors" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">
                          Click to upload PDF
                        </p>
                        <p className="text-xs text-slate-400">Max size 5MB</p>
                      </>
                    )}
                  </label>
                  <input
                    type="file"
                    id="resume-input"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setResume(e.target.files[0])}
                  />
                </div>

                <button
                  disabled={isLoading || !resume || !title}
                  className="w-full py-3.5 bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md">
                  {isLoading && (
                    <LoaderCircleIcon className="animate-spin size-5" />
                  )}
                  {isLoading ? "Processing PDF..." : "Extract & Create"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editResumeId && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditResumeId("")}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setEditResumeId("")}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <XIcon className="size-5" />
              </button>

              <div className="mb-8">
                <div className="size-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                  <PencilIcon className="size-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Rename resume
                </h2>
                <p className="text-slate-500 text-sm">
                  Update the title of your document.
                </p>
              </div>

              <form onSubmit={editTitle} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Title
                  </label>
                  <input
                    autoFocus
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800"
                    required
                  />
                </div>
                <button className="w-full py-3.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-red-100">
              <span className="text-2xl">🗑️</span>
            </div>

            <h2 className="text-xl font-bold text-center mt-4">
              Delete Resume?
            </h2>

            <p className="text-gray-500 text-center mt-2">
              Are you sure you want to delete this resume?
              <br />
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition">
                Cancel
              </button>

              <button
                onClick={deleteResume}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
