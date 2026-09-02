import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { GoogleGenAI } from '@google/genai'
import 'dotenv/config'

const app = express()
const PORT = 5000

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

app.use(cors())
app.use(express.json())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PNG, JPG, and WEBP images are allowed.'))
    }
  },
})

app.get('/', (_req, res) => {
  res.json({
    message: 'AI Architectural Visualizer backend is running!',
  })
})

app.post(
  '/api/generate',
  upload.single('floorPlan'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No floor plan uploaded.',
        })
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'Gemini API key is not configured.',
        })
      }

      console.log(
        'Received floor plan:',
        req.file.originalname,
      )

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: req.file.mimetype,
              data: req.file.buffer.toString('base64'),
            },
          },
          {
            text: `
Analyze this architectural floor plan image.

Return ONLY valid JSON in this exact format:

{
  "roomsDetected": 0,
  "estimatedArea": "string",
  "style": "string"
}

Instructions:
- Count the visible rooms as accurately as possible.
- Estimate the total floor area if dimensions are visible.
- If the area cannot be determined, use "Unable to estimate".
- Identify the apparent architectural/design style.
- Do not include markdown.
- Do not include explanations outside the JSON.
            `,
          },
        ],
      })

      const text = response.text ?? ''

      console.log('Gemini response:', text)

      const cleanedText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()

      let analysis

      try {
        analysis = JSON.parse(cleanedText)
      } catch {
        return res.status(500).json({
          error: 'Gemini returned an invalid analysis response.',
        })
      }

      res.json({
        success: true,
        message: 'AI analysis completed successfully!',
        fileName: req.file.originalname,
        analysis: {
          roomsDetected: analysis.roomsDetected,
          estimatedArea: analysis.estimatedArea,
          style: analysis.style,
          visualizationStatus: 'Ready',
        },
      })
    } catch (error) {
      console.error('Gemini error:', error)

      return res.status(500).json({
        error:
          'Unable to analyze the floor plan with Gemini right now.',
      })
    }
  },
)

/* Backend error handling */

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err)

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error:
            'File is too large. Maximum size is 10 MB.',
        })
      }

      return res.status(400).json({
        error: err.message,
      })
    }

    if (
      err?.message ===
      'Only PNG, JPG, and WEBP images are allowed.'
    ) {
      return res.status(400).json({
        error: err.message,
      })
    }

    return res.status(500).json({
      error: 'Something went wrong on the server.',
    })
  },
)

app.listen(PORT, () => {
  console.log(
    `Backend running at http://localhost:${PORT}`,
  )
})