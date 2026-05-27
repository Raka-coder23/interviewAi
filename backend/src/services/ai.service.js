const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer")
const puppeteerCore = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

function getErrorMessage(error) {
    if (!error) return "Unknown error";
    if (typeof error === "string") return error;
    return error.message || JSON.stringify(error);
}

function isGeminiQuotaExceeded(error) {
    const rawMessage = getErrorMessage(error);
    const lower = rawMessage.toLowerCase();

    if (lower.includes("resource_exhausted")) return true;
    if (lower.includes("quota exceeded")) return true;
    if (lower.includes("generate_content_free_tier_requests")) return true;

    try {
        const parsed = JSON.parse(rawMessage);
        const status = parsed?.error?.status;
        const code = parsed?.error?.code;
        return status === "RESOURCE_EXHAUSTED" || code === 429;
    } catch (parseError) {
        return false;
    }
}

function buildFallbackResumeHtml({
    resume,
    selfDescription,
    jobDescription
}) {
    const safeResume = String(resume || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeSelf = String(selfDescription || "Not provided").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeJob = String(jobDescription || "Not provided").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Generated Resume</title>
  <style>
    body {
      font-family: "Segoe UI", Tahoma, Arial, sans-serif;
      color: #1f2937;
      line-height: 1.5;
      margin: 0;
      background: #ffffff;
    }
    .container {
      padding: 28px 32px;
      max-width: 820px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    h1 {
      margin: 0;
      font-size: 28px;
      color: #0f172a;
      letter-spacing: 0.4px;
    }
    .subtitle {
      margin-top: 6px;
      font-size: 13px;
      color: #475569;
    }
    h2 {
      margin: 18px 0 8px;
      font-size: 15px;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .section {
      margin-bottom: 14px;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #f8fafc;
    }
    p, pre {
      margin: 0;
      font-size: 13px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .note {
      margin-top: 16px;
      font-size: 12px;
      color: #64748b;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Professional Resume</h1>
      <div class="subtitle">Prepared for application review</div>
    </div>
    <h2>Target Role</h2>
    <div class="section"><p>${safeJob}</p></div>
    <h2>Self Description</h2>
    <div class="section"><p>${safeSelf}</p></div>
    <h2>Resume Content</h2>
    <div class="section"><pre>${safeResume}</pre></div>
    <p class="note">Generated using fallback template because AI quota was exceeded.</p>
  </div>
</body>
</html>
`;
}

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
    title:z.string()
});

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

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
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    const text = response.text;

    

    // FIX
    const cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const parsed =
        JSON.parse(cleanedText);

    return parsed;
}
async function generatePdfFromHtml(htmlContent) {

    console.log("ENTER PDF HTML")

    try {

        const isRender =
            process.env.RENDER === "true" ||
            process.env.NODE_ENV === "production"

        const browser = isRender
            ? await puppeteerCore.launch({
                args: [
                    ...chromium.args,
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage"
                ],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: true
            })
            : await puppeteer.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage"
                ]
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

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
     console.log("enter in pr")

    if (!process.env.GOOGLE_GENAI_API_KEY) {
        throw new Error("GOOGLE_GENAI_API_KEY is not set on server")
    }

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    let response
    try {
        response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(resumePdfSchema),
            }
        })
    } catch (error) {
        const errorMessage = getErrorMessage(error)
        const isQuotaError = isGeminiQuotaExceeded(error)

        if (isQuotaError) {
            const fallbackHtml = buildFallbackResumeHtml({
                resume,
                selfDescription,
                jobDescription
            })
            return generatePdfFromHtml(fallbackHtml)
        }

        throw new Error(`Gemini call failed: ${errorMessage}`)
    }

    const cleanedText = (response.text || "")
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()

    if (!cleanedText) {
        throw new Error("Gemini returned empty resume payload")
    }

    let jsonContent
    try {
        jsonContent = JSON.parse(cleanedText)
    } catch (error) {
        throw new Error(`Failed to parse Gemini JSON: ${getErrorMessage(error)}`)
    }

    if (!jsonContent?.html) {
        throw new Error("Gemini response missing 'html' field")
    }

    try {
        const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
        return pdfBuffer
    } catch (error) {
        throw new Error(`PDF generation failed: ${getErrorMessage(error)}`)
    }

}

module.exports = { generateInterviewReport, generateResumePdf };