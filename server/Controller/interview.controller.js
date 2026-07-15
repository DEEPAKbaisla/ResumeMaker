// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const { PDFParse} = require("pdf-parse");
import { extractText } from "unpdf";

import {
  generateInterviewReport,
  generateResumePdf,
} from "../services/ai.service.js";
import interviewReportModel from "../model/interviewReport.model.js";

/**
 * @description controller to generate interview report based on user self description ,resume and job descripton
 */

export const generateInterviewReportController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    const uint8Array = new Uint8Array(req.file.buffer);
    const { text } = await extractText(uint8Array, { mergePages: true });

    const { selfDescription, jobDescription } = req.body;

    const interViewReportByAi = await generateInterviewReport({
      // resume: resumeContent.text,
      resume: text,
      selfDescription,
      jobDescription,
    });

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      // resume: resumeContent.text,
      resume: text,
      selfDescription,
      jobDescription,
      title: jobDescription.slice(0, 50),
      ...interViewReportByAi,
    });
    res.status(201).json({
      message: "Interview report generate successfully",
      interviewReport,
    });
  } catch (error) {
    console.error("Error generating interview report:", error);
    res.status(500).json({
      message: "Failed to generate interview report",
      error: error.message,
    });
  }
};

/**
 * @description controller to get interview report by interviewId
 */

export const getInterviewReportById = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    res.status(200).json({
      message: "Interview report fetch successfully",
      interviewReport,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description controller to get  all interview of logged in user
 */

export const getAllInterviewReportscontroller = async (req, res) => {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
    );

  res.status(200).json({
    message: "Interview reports fetched successfully.",
    interviewReports,
  });
};

/**
 * @description  to generate resume pdf based on interview report data (resume ,self description and job description)
 */

export const generateResumePdfController = async (req, res) => {
  const { interviewReportId } = req.params;
  const interviewReport =
    await interviewReportModel.findById(interviewReportId);

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found",
    });
  }

  const { resume, selfDescription, jobDescription } = interviewReport;
  const pdfBuffer = await generateResumePdf({
    resume,
    jobDescription,
    selfDescription,
  });
  res.set({
    "Content-Type": "application/pdf",
    "content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
  });
  res.send(pdfBuffer);
};

// export default {
//   generateInterviewReportController,
//   getInterviewReportById,
//   getAllInterviewReportscontroller,
//   generateResumePdfController,
// };
