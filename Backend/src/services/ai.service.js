const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore :z.number().description("A score between 0 and 100 indicating how well the candidate,s profile matches the job description"),
  technicalQuestions: z.array(
    z.object({
      question: z
        .string()
        .description("the technical Questions can be asked in the interview"),
      intention: z
        .string()
        .description(
          "the intention of interviewer behind asking this question",
        ),
      answer: z
        .string()
        .description(
          "How to answer this question, what points to cover,whatt aproacht to take etc.",
        )
    })).description("Technical question that can be asked in the interview with along with their intention and how to answer them"),
  behaviorQuestions: z.array(
    z.object({
      question: z
        .string()
        .description("the technical Questions can be asked in the interview"),
      intention: z
        .string()
        .description(
          "the intention of interviewer behind asking this question",
        ),
      answer: z
        .string()
        .description(
          "How to answer this question, what points to cover,whatt aproacht to take etc.",
        )
    })).description("Behavariol questions that can be asked in the interview along with their intention and how to answer them "),
    skillGaps:z.array(z.object({
      skill:z.string().description("the skill which the candidate is lacking"),
      severity:z.enum(["low" , "medium" ,"high"]).description("the severity of the skill gap, i.e. how important is the ")
    })).description("List of skill gaps in the candidate profile along with their severity"),
    preparationPlan:z.array(z.object({
      day :z.number().description("the day number is the preparation plan , starting from 1"),
      focus: z.string().description("the main focus of this day in the preparation plan ,e.g. data structure , system design ,mock interview"),
      tasks:z.array().description("list of tasks to be done on this daY to follow the preparation  plan, e.g. read a specific book ")
    })).description("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively")
});

async function generateInterviewReport({
  resume,
  selfDescripton,
  jobDescription,
}) {
  const response = await ai.models.generateContent({
    model:"gemini-3.5-flash",
    contents:"",
    config:{
      responseMimeType:"application/json",
      responseJsonSchema:zodToJsonSchema(interviewReportSchema)
    }
  })
}

module.exports = invokeGeminiAi;