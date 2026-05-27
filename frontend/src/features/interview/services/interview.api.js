import axios from 'axios'
 const api=axios.create({
  baseURL:"https://interviewai-svlt.onrender.com",
  withCredentials:true
 })
export async function generateInterviewReport({jobDescription,selfDescription,resumeFile}) {

  const formData=new FormData()
  formData.append("jobDescription",jobDescription)
  formData.append("selfDescription",selfDescription)
  formData.append("resume",resumeFile)
  try {
     const response=  await api.post('/api/interview/',formData,{
    headers:{
      "Content-Type":"multipart/form-data"
    }
  })// for coockies permission to server
  return (await response).data
  } catch (err) {
    console.log(err)
  }
}

export async function generateInterviewReportById(interviewId) {
  const response=await api.get(`/api/interview/report/${interviewId}`)
  return response.data
}

export async function getAllInterviewReports() {
  const response=await api.get("/api/interview/")
  return response.data
}

export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })

    return response.data
}
