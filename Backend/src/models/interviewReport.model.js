const mongoose = require('mongoose');


const technicalQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  intention: {
    type: String,
    required: true,
  },
  amswer: {
    type: String,
    required: true,
  }
}, {
    _id:false
});
const behaviorQuestionSchema = new mongoose.Schema(
  {
    uestion: {
      type: String,
      required: true,
    },
    intention: {
      type: String,
      required: true,
    },
    amswer: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const skillGapsSchema = new mongoose.Schema({
    skill: {
        type: String,
        required:true
    },
    severity: {
        type: String,
        enum: ["low", "high", "medium"],
        required :true
        
    }
}, {
    _id:false
})

const preparationPlanSchema = new mongoose.Schema({ 
  day: {
    type: Number,
    required: true,
  },
  focus: {
    type: String,
    required: true,
    },
    tasks: [
       { type : String,
        required:true}
  ]
});


const interviewReportSchema = new mongoose.Schema({
  jobDescription: {
    type: String,
    required: true,
  },
  resume: {
    type: String,
  },
  selfDescripton: {
    type: String,
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
  },
    technicalQuestions: [technicalQuestionSchema],
    behaviorQuestions: [behaviorQuestionSchema],
    skillGaps: [skillGapsSchema],
    preparationPlan : [preparationPlanSchema]
    
}, {
    timestamps:true 
});


const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema)


module.exports = interviewReportModel 