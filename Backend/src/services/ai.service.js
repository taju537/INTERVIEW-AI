const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  title: z.string().describe("the title of the job for which the interview report is generated"),
  matchScore: z.number().describe("The match score between 0 and 100 between the candidate and the job description"),
  technicalQuestions: z.array(
    z.object({
      question: z.string().describe("The technical question asked in the interview"),
      intention: z.string().describe("The intention behind the technical question"),
      answer: z.string().describe("how to answer this question, what points to cover, what approach to take, what to avoid"),
    })
  ).describe("Technical questions that can be asked in the interview"),
  behavioralQuestions: z.array(
    z.object({
      question: z.string().describe("The behavioral question asked in the interview"),
      intention: z.string().describe("The intention behind the behavioral question"),
      answer: z.string().describe("how to answer this question, what points to cover, what approach to take, what to avoid"),
    })
  ).describe("Behavioral questions asked in the interview"),
  skillGaps: z.array(
    z.object({
      skill: z.string().describe("The skill that the candidate is lacking"),
      severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap"),
    })
  ).describe("list of skill gaps in the candidate profile along with severity"),
  preparationPlan: z.array(
    z.object({
      day: z.number().describe("The day of the preparation plan, starting from 1"),
      focus: z.string().describe("The focus of the preparation plan for that day"),
      tasks: z.array(z.string()).describe("The tasks to be completed for that day"),
    })
  ).describe("Preparation plan for the candidate to improve their skills and prepare for the interview"),
});

const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-latest",
];

async function generateJsonWithFallback({ prompt, schema, retries = 1 }) {
  const jsonSchema = z.toJSONSchema(schema);
  let lastError;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: jsonSchema,
          },
        });
        return JSON.parse(response.text);
      } catch (err) {
        lastError = err;
        const errMsg = err?.message || "";
        const isUnavailable = errMsg.includes("503") || errMsg.includes("high demand") || err?.status === 503;
        if (isUnavailable && attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        break;
      }
    }
  }
  throw lastError;
}

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `Generate an interview report for a candidate based on the following information:
Resume: ${resume || "None provided"}
Self Description: ${selfDescription || "None provided"}
Job Description: ${jobDescription}
`;

  return await generateJsonWithFallback({
    prompt,
    schema: interviewReportSchema,
  });
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z.string().describe("the HTML content of the resume which can be converted to pdf using any library like puppeteer."),
  });

  const prompt = `generate a resume for a candidate with the following details:
  Resume: ${resume || "None provided"}
  Self Description: ${selfDescription || "None provided"}
  Job Description: ${jobDescription}

  The response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
  The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
  The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
  You can highlight the content using some colors or different font styles but the overall design should be simple and professional.
  The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
  The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
  `;

  const jsonContent = await generateJsonWithFallback({
    prompt,
    schema: resumePdfSchema,
  });

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);
  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };