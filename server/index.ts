import express from 'express'
import cors from 'cors'
import multer from 'multer'

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

const upload = multer({
  storage: multer.memoryStorage(),
})

app.get('/', (_req, res) => {
  res.json({
    message: 'AI Architectural Visualizer backend is running!',
  })
})

app.post('/api/generate', upload.single('floorPlan'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'No floor plan uploaded.',
    })
  }

  console.log('Received floor plan:', req.file.originalname)

  res.json({
    success: true,
    message: 'Floor plan received successfully!',
    fileName: req.file.originalname,
  })
})

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
})