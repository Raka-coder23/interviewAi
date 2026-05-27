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

<<<<<<< HEAD
export async function generateInterviewReportById(interviewId) {
  const response=await api.get(`/api/interview/report/${interviewId}`)
  return response.data
=======
export async function generateInterviewReportById(
    interviewId
) {

<<<<<<< HEAD
    const response = await api.get(
        `/api/interview/report/${interviewId}`
    )
=======
export async function getAllInterviewReports() {
  const response=await api.get("/api/interview/")
  return response.data
}

export const generateResumePdf = async ({ interviewReportId }) => {
>>>>>>> 5a6f3de (fixed pdf generation issue)

    try {

        const response = await api.post(
            `/api/interview/resume/pdf/${interviewReportId}`,
            null,
            {
                responseType: "blob"
            }
        )

        const file = new Blob(
            [response.data],
            { type: "application/pdf" }
        )

        const fileURL = window.URL.createObjectURL(file)

        const link = document.createElement("a")

        link.href = fileURL

        link.download = "resume.pdf"

        document.body.appendChild(link)

        link.click()

        link.remove()

        window.URL.revokeObjectURL(fileURL)

    } catch (error) {

        console.log("PDF DOWNLOAD ERROR:", error)

    }
>>>>>>> 757ff32 (fixed pdf generation issue)
}

export async function getAllInterviewReports() {
  const response=await api.get("/api/interview/")
  return response.data
}

export const generateResumePdf = async ({ interviewReportId }) => {

    try {

        const response = await api.post(
            `/api/interview/resume/pdf/${interviewReportId}`,
            null,
            {
                responseType: "blob"
            }
        )

        const file = new Blob(
            [response.data],
            { type: "application/pdf" }
        )

        const fileURL = window.URL.createObjectURL(file)

        const link = document.createElement("a")

        link.href = fileURL

        link.download = "resume.pdf"

        document.body.appendChild(link)

        link.click()

        link.remove()

        window.URL.revokeObjectURL(fileURL)

    } catch (error) {

        console.log("PDF DOWNLOAD ERROR:", error)

    }
}
