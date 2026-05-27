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

        console.log(
            "PDF DOWNLOAD ERROR:",
            error
        )

        throw error
    }
}