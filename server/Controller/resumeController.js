import imagekit from "../config/imageKit.js";
import Resume from "../model/Resume.js";
import fs from "fs";

//to get create new resume

export const createResume = async (req, res) => {
  try {
    // const userId = req.user; //user id from auth middleware
    const userId = req.userId;
    // console.log("aaaya kuch :", userId);
    const { title } = req.body;
    //create new resume
    const newResume = await Resume.create({ userId, title });

    return res
      .status(201)
      .json({ message: "Resume created successfully", resume: newResume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//for deleting resume

export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId; //user id from auth middleware
    const { resumeId } = req.params;
    //create new resume
    await Resume.findOneAndDelete({ _id: resumeId, userId });

    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//for updating resume
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId; //user id from auth middleware
    const { resumeId } = req.params;
    //create new resume
    const resume = await Resume.findOne({ userId, _id: resumeId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    resume.v = undefined;
    resume.createdAt = undefined;
    resume.updatedAt = undefined;

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//get resume by id public
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findOne({ _id: resumeId, public: true });
    if (!resume) {
      return res
        .status(404)
        .json({ message: "Resume not found or not public" });
    }
    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateResume = async (req, res) => {
  try {
    const userId = req.userId; //user id from auth middleware
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;
    let resumeDataCopy;
    if (typeof resumeData === "string") {
      resumeDataCopy = await JSON.parse(resumeData);
    } else {
      resumeDataCopy = structuredClone(resumeData);
    }

    if (image) {
      const imageBufferData = fs.createReadStream(image.path);
      const response = await imagekit.files.upload({
        file: imageBufferData,
        fileName: "resume.png",
        folder: "user-resumes",
        transformation: {
          pre:
            "w-300 ,h-300 ,fo-face,z-0.75" +
            (removeBackground ? ",e-bgremove" : ""),
        },
      });
      resumeDataCopy.personal_info.image = response.url;
    }
    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId, userId },
      resumeDataCopy,
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Resume updated successfully", resume });
  } catch (error) {}
};
