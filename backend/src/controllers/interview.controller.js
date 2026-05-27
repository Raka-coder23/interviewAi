const { default: mongoose } = require('mongoose')
const interviewReportModel=require('../model/interviewReport.model')
const {generateInterviewReport,generateResumePdf} = require('../services/ai.service')
const pdfparse=require('pdf-parse')
async function interviewReportController(req,res) {
  const resumeFile=req.file 
  const resumeContent= await (new pdfparse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
  const {selfDescription,jobDescription}=req.body

const interviewReportByAi=await generateInterviewReport({
  resume:resumeContent.text,
  selfDescription,
  jobDescription
})

const interviewReport=await interviewReportModel.create({
  user:req.user.id,
  resume:resumeContent.text,
  jobDescription,
  selfDescription,
  ...interviewReportByAi
})

res.status(201).json({
  message:"interview report generated successfully",
  interviewReport

})
}

async function generateInterviewReportById(req,res) {
  const {interviewId}=req.params
  const interviewReport=await interviewReportModel.findOne({_id:interviewId,user:req.user.id})

  if(!interviewId){
    return res.status(400).json({
      message:"Interview report not found"
    })
  }
  res.status(200).json({
    message:"interview report fatched successfully",
    interviewReport
  })
}

async function AllGenerateInterviewReportByUser(req, res) {

  try {

    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
      message: "Interview report fetched successfully",
      interviewReports
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: error.message
    })
  }
}

async function generateResumePdfController(req, res) {

    try {

        const { interviewReportId } = req.params

        console.log("PDF REQUEST ID:", interviewReportId)

        const interviewReport =
            await interviewReportModel.findById(
                interviewReportId
            )

        if (!interviewReport) {

            return res.status(404).json({
                success: false,
                message: "Interview report not found."
            })
        }

        const {
            resume,
            jobDescription,
            selfDescription
        } = interviewReport

        console.log("INTERVIEW REPORT:", {
            resume,
            jobDescription,
            selfDescription
        })

        const safeResume =
            resume || "No resume uploaded"

        const safeJobDescription =
            jobDescription || "No job description"

        const safeSelfDescription =
            selfDescription || "No self description"

        const pdfBuffer =
            await generateResumePdf({
                resume: safeResume,
                jobDescription: safeJobDescription,
                selfDescription: safeSelfDescription
            })

        if (!pdfBuffer) {

            return res.status(500).json({
                success: false,
                message: "Failed to generate PDF buffer"
            })
        }

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition":
                `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)

    } catch (error) {

        console.log(
            "PDF CONTROLLER ERROR:",
            error
        )

        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports={interviewReportController,generateInterviewReportById,AllGenerateInterviewReportByUser,generateResumePdfController}