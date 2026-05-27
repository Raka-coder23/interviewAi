const express=require('express')
const authMiddleware =require('../middleware/auth.middleware')
const  interviewController  = require('../controllers/interview.controller')
const upload =require('../middleware/file.middleware')
const interviewRouter=express.Router()

interviewRouter.post('/',authMiddleware.authuser,upload.single('resume'),interviewController.interviewReportController)


interviewRouter.get("/report/:interviewId",authMiddleware.authuser,interviewController.generateInterviewReportById)

interviewRouter.get("/",authMiddleware.authuser,interviewController.AllGenerateInterviewReportByUser)

interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authuser,interviewController.generateResumePdfController)
module.exports=interviewRouter