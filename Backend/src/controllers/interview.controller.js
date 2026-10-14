const pdfParse = require ("pdf-parse")
const {generateInterviewReport , generateResumePdf} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterviewReportController(req, res) {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    const selfDescription = req.body.selfDescription || req.body.selfdescription || req.body.selfDescripton || "";

    let resumeText = "";
    if (req.file) {
      try {
        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
        resumeText = resumeContent.text || "";
      } catch (parseErr) {
        console.error("Error parsing resume PDF:", parseErr);
        return res.status(400).json({ message: "Failed to read resume PDF file. Please ensure it is a valid PDF." });
      }
    }

    if (!resumeText.trim() && !selfDescription.trim()) {
      return res.status(400).json({ message: "Either a resume (PDF) or self description is required" });
    }

    const interviewReportByAI = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    });

    const interviewReport = await interviewReportModel.create({
      user: req.user._id,
      resume: resumeText,
      selfDescription,
      jobDescription,
      ...interviewReportByAI,
    });

    return res.status(201).json({
      message: "Interview Report Generated Successfully",
      interviewReport,
    });
  } catch (error) {
    console.error("Error in generateInterviewReportController:", error);
    return res.status(500).json({
      message: "Failed to generate interview report",
      error: error.message,
    });
  }
}

async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user._id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    return res.status(200).json({
      message: "Interview report fetched successfully",
      interviewReport,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch interview report",
      error: error.message,
    });
  }
}

async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel.find({user:req.user._id}).sort({createdAt : -1}).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
      message: "Interview Report Fetched Succesfully ",
      interviewReports
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch interview reports",
      error: error.message,
    });
  }
}

async function generateResumePdfController (req , res) {
  try {
    const {interviewReportId} = req.params
    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user._id,
    })
    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found."
      })
    }
    
    const {resume , jobDescription , selfDescription } =interviewReport
    const pdfBuffer = await generateResumePdf ({resume , jobDescription , selfDescription})

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(Buffer.from(pdfBuffer))
  } catch (error) {
    console.error("Error in generateResumePdfController:", error);
    return res.status(500).json({
      message: "Failed to generate resume PDF",
      error: error.message,
    });
  }
}

module.exports = { generateInterviewReportController ,getInterviewReportByIdController,getAllInterviewReportsController , generateResumePdfController};