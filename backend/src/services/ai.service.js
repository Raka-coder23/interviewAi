const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

const puppeteer = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = z.object({
    matchScore: z.number(),

    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"])
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string())
        })
    ),

    title: z.string()
})

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    try {

        const prompt = `
Generate interview report in STRICT JSON format.

IMPORTANT:
- Return ONLY JSON
- No markdown
- No explanation
- No code blocks
- Use exact field names

{
  "matchScore": number,
  "technicalQuestions": [
    {
      "question": string,
      "intention": string,
      "answer": string
    }
  ],
  "behavioralQuestions": [
    {
      "question": string,
      "intention": string,
      "answer": string
    }
  ],
  "skillGaps": [
    {
      "skill": string,
      "severity": "low" | "medium" | "high"
    }
  ],
  "preparationPlan": [
    {
      "day": number,
      "focus": string,
      "tasks": [string]
    }
  ],
  "title":"string"
}

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        })

        const rawText = response.text()

        const cleanedText = rawText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim()

        const parsed = JSON.parse(cleanedText)

        return parsed

    } catch (error) {

        console.log(
            "INTERVIEW REPORT ERROR:",
            error
        )

        throw error
    }
}

async function generatePdfFromHtml(htmlContent) {

    console.log("ENTER PDF HTML")

    try {

        const browser = await puppeteer.launch({

            args: [
                ...chromium.args,
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ],

            defaultViewport:
                chromium.defaultViewport,

            executablePath:
                await chromium.executablePath(),

            headless: true
        })

        const page = await browser.newPage()

        await page.setContent(
            htmlContent,
            {
                waitUntil: "networkidle0"
            }
        )

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,

            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        })

        await browser.close()

        return pdfBuffer

    } catch (error) {

        console.log(
            "PUPPETEER PDF ERROR:",
            error
        )

        throw error
    }
}

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {

    try {

        console.log("ENTER GENERATE RESUME PDF")

        const resumePdfSchema = z.object({
            html: z.string().describe(
                "The HTML content of the resume"
            )
        })

        const prompt = `
Generate a professional ATS-friendly resume.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

IMPORTANT:
- Return ONLY JSON
- No markdown
- No explanation
- No code blocks

Format:

{
  "html": "<html>...</html>"
}

Requirements:
- Professional design
- ATS friendly
- 1-2 pages
- Human-written tone
- Proper HTML structure
- Inline CSS allowed
`

        const response =
            await ai.models.generateContent({

                model: "gemini-2.5-flash",

                contents: prompt,

                config: {

                    responseMimeType:
                        "application/json",

                    responseSchema:
                        zodToJsonSchema(
                            resumePdfSchema
                        )
                }
            })

        const rawText = response.text()

        const cleanedText = rawText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim()

        const jsonContent =
            JSON.parse(cleanedText)

        console.log(
            "HTML EXISTS:",
            !!jsonContent.html
        )

        if (!jsonContent.html) {

            throw new Error(
                "HTML content missing from Gemini response"
            )
        }

        const pdfBuffer =
            await generatePdfFromHtml(
                jsonContent.html
            )

        console.log(
            "PDF BUFFER SIZE:",
            pdfBuffer.length
        )

        return pdfBuffer

    } catch (error) {

        console.log(
            "GENERATE RESUME PDF ERROR:",
            error
        )

        throw error
    }
}

module.exports = {
    generateInterviewReport,
    generateResumePdf
}