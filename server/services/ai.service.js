import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import puppeteer from "puppeteer";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "The match score between the candidate and the job describe, on a scale of 0 to 100.",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover,what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in the interview, along with the intention behind asking those questions and how to answer them.",
    ),

  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover,what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview, along with the intention behind asking those questions and how to answer them.",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe("The skill in which the candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe(
            "The severity of the skill gap, whether it's low, medium, or high.",
          ),
      }),
    )
    .describe(
      "The skill gaps that the candidate has, along with the severity of those skill gaps.",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("The day of the preparation plan ,starting from 1"),
        focus: z
          .string()
          .describe(
            "The focus of the preparation for that day, e.g. data structures, system design, behavioral questions etc.",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "List of tasks to be done on this day to follow the preparation e.g reading articles, watching videos, solving problems etc.",
          ),
      }),
    )
    .describe(
      "The preparation plan for the interview, including the day and focus for each day.",
    ),
  title: z
    .string()
    .describe(
      "The title of the job for which the interview report is generated",
    ),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
    You are an expert interview coach. Analyze the candidate's profile and generate a detailed interview report.

    Resume: ${resume}
    Self Description: ${selfDescription}
    Job Description: ${jobDescription}

    Generate a comprehensive interview report with:
    - A match score (0-100) based on how well the candidate fits the job
    - 5 technical questions with intention and detailed answer guidance
    - 5 behavioral questions with intention and detailed answer guidance  
    - Skill gaps the candidate has compared to job requirements (with severity: low/medium/high)
    - A 7-day preparation plan with daily focus and tasks
  `;

  const responseSchema = {
    type: "object",
    properties: {
      matchScore: { type: "number" },
      technicalQuestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            intention: { type: "string" },
            answer: { type: "string" },
          },
          required: ["question", "intention", "answer"],
        },
      },
      behavioralQuestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            intention: { type: "string" },
            answer: { type: "string" },
          },
          required: ["question", "intention", "answer"],
        },
      },
      skillGaps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            skill: { type: "string" },
            severity: { type: "string", enum: ["low", "medium", "high"] },
          },
          required: ["skill", "severity"],
        },
      },
      preparationPlan: {
        type: "array",
        items: {
          type: "object",
          properties: {
            day: { type: "number" },
            focus: { type: "string" },
            tasks: { type: "array", items: { type: "string" } },
          },
          required: ["day", "focus", "tasks"],
        },
      },
    },
    required: [
      "matchScore",
      "technicalQuestions",
      "behavioralQuestions",
      "skillGaps",
      "preparationPlan",
    ],
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", // ✅ correct model name
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema, // ✅ plain object instead of zodToJsonSchema
      // responseSchema: zodToJsonSchema(interviewReportSchema),
    },
  });

  const parsed = JSON.parse(response.text);
  // console.log("AI Response:", JSON.stringify(parsed, null, 2)); // for debugging
  return parsed;
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });

  await browser.close();
  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume  which can be conerted to PDF using libraries like puppeteer or any other library.",
      ),
  });

  const prompt = `Generate a resume for a candidate the following information:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

the response should be JSON object with a single field "html"which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer 
The resume should be tailored to the job description provided, highlighting the candidate's relevant skills and experience. The design of the resume should be professional and ATS friendly.
The content of resume should be not sound like it's generated by AI and should be unique and creative.
You can highlight the context using  some color or different font but the design should be simple and professional.
The content should be ATS friendly , i.e. it should be easily parsable by ATS system without losing any important information.
The resume should be so lengthy ,it should ideally be 1 pages long only when converted to PDF.focus on quality of content rather than quantity of content.and make keep relativent information which can showcase the candidate's profile in best way.

`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  const jsonContent = JSON.parse(response.text);
  // console.log("Generated HTML:", jsonContent.html);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}

export { generateInterviewReport, generateResumePdf };
