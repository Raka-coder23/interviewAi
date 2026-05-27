import { useContext, useEffect } from "react";
import { getAllInterviewReports ,generateInterviewReport,generateInterviewReportById,generateResumePdf} from "../services/interview.api"; 
import { InterviewContext } from "../interview.context";



export const useInterview=(interviewId = null)=>{
  const context=useContext(InterviewContext)
  if(!context){
    throw new Error("useInterview must be used within an InterviewProvider")
  }

  const {loading,setLoading,report,setReport,reports,setReports}=context

  const generateReport=async({jobDescription,selfDescription,resumeFile})=>{
    
    setLoading(true)
    let response=null
    try {
       response=await generateInterviewReport({jobDescription,selfDescription,resumeFile})
      
      setReport(response.interviewReport)
    } catch (err) {
      console.log(err)
    }finally{
      setLoading(false)
    }
    return response.interviewReport
  }

  const getReportById = async (interviewId) => {

  setLoading(true)

  try {

    const response = await generateInterviewReportById(interviewId)

    console.log(response)

    if (response?.interviewReport) {
      setReport(response.interviewReport)
    }

    return response?.interviewReport || null

  } catch (err) {

    console.log(err)

    setReport(null)

    return null

  } finally {

    setLoading(false)
  }
}

  const getAllReports = async () => {

  setLoading(true)

  let response = null

  try {

    response = await getAllInterviewReports()

    setReports(response.interviewReports)

  } catch (err) {

    console.log(err)

  } finally {

    setLoading(false)
  }

  return response?.interviewReports || []
}

const getResumePdf = async (interviewReportId) => {
     console.log("enter")
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
          console.log(response)
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

 useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getAllReports()
        }
    }, [ interviewId ])

  return {loading,report,reports,generateReport,getReportById,getAllReports,getResumePdf}
}