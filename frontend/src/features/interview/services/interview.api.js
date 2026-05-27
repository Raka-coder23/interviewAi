import axios from 'axios'

const api = axios.create({
    baseURL: "https://interviewai-svlt.onrender.com",
    withCredentials: true
})

export async function generateInterviewReport({
    jobDescription,
    selfDescription,
    resumeFile
}) {

    const formData = new FormData()

    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    try {

        const response = await api.post(
            '/api/interview/',
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        )

        return response.data

    } catch (err) {

        console.log(err)

    }
}

export async function generateInterviewReportById(
    interviewId
) {

    try {

        const response = await api.get(
            `/api/interview/report/${interviewId}`
        )

        return response.data

    } catch (err) {

        console.log(err)

    }
}

export async function getAllInterviewReports() {

    try {

        const response = await api.get(
            "/api/interview/"
        )

        return response.data

    } catch (err) {

        console.log(err)

    }
}

export const generateResumePdf = async ({
    interviewReportId
}) => {

    try {

        const response = await api.post(
            `/api/interview/resume/pdf/${interviewReportId}`,
            null,
            {
                responseType: "blob"
            }
        )

        return response.data

    } catch (error) {
        let backendMessage = "PDF download failed"
        const errorBlob = error?.response?.data

        if (errorBlob instanceof Blob) {
            try {
                const text = await errorBlob.text()
                const parsed = JSON.parse(text)
                backendMessage = parsed?.message || backendMessage
            } catch (parseError) {
                console.log("PDF ERROR PARSE FAILED:", parseError)
            }
        } else if (error?.response?.data?.message) {
            backendMessage = error.response.data.message
        }

        console.log(
            "PDF DOWNLOAD ERROR:",
            backendMessage
        )

        throw new Error(backendMessage)
    }
}