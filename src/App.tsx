import { useEffect, useState } from 'react'
import './App.css'

type Project = {
  id: number
  name: string
  fileName: string
  roomsDetected: number
  estimatedArea: string
  style: string
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const [projects, setProjects] = useState<Project[]>([])
  const [analysis, setAnalysis] = useState<Project | null>(null)

  useEffect(() => {
    const savedProjects = localStorage.getItem('archai-projects')

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
    ]

    const maxSize = 10 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PNG, JPG, or WEBP image.')
      event.target.value = ''
      return
    }

    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 10 MB.')
      event.target.value = ''
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setAnalysis(null)
  }

  const handleGenerate = async () => {
    if (!selectedFile) {
      alert('Please upload a floor plan first.')
      return
    }

    setIsGenerating(true)

    try {
      const formData = new FormData()
      formData.append('floorPlan', selectedFile)

      const response = await fetch(
        'http://localhost:5000/api/generate',
        {
          method: 'POST',
          body: formData,
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Something went wrong while generating the visualization.',
        )
      }

      const newProject: Project = {
        id: Date.now(),
        name: selectedFile.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' '),
        fileName: selectedFile.name,
        roomsDetected: data.analysis.roomsDetected,
        estimatedArea: data.analysis.estimatedArea,
        style: data.analysis.style,
      }

      setAnalysis(newProject)

      const updatedProjects = [
        newProject,
        ...projects,
      ]

      setProjects(updatedProjects)

      localStorage.setItem(
        'archai-projects',
        JSON.stringify(updatedProjects),
      )
    } catch (error) {
      console.error('Generation error:', error)

      alert(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteProject = (id: number) => {
    const updatedProjects = projects.filter(
      (project) => project.id !== id,
    )

    setProjects(updatedProjects)

    localStorage.setItem(
      'archai-projects',
      JSON.stringify(updatedProjects),
    )

    if (analysis?.id === id) {
      setAnalysis(null)
    }
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          Arch<span>AI</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#upload">Create</a>
          <a href="#history">Projects</a>
          <a href="#features">Features</a>
        </div>

        <button
          className="login-button"
          onClick={() => setShowLogin(true)}
        >
          Login
        </button>
      </nav>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="eyebrow">
            AI ARCHITECTURAL VISUALIZATION
          </p>

          <h1>
            Turn your floor plan
            <br />
            into a <em>visual reality.</em>
          </h1>

          <p className="hero-text">
            Upload a 2D floor plan and let AI transform it
            into an intelligent architectural visualization.
          </p>

          <a href="#upload" className="primary-button">
            Start Designing
          </a>
        </div>

        <div className="hero-visual">
          <div className="architectural-card">
            <div className="blueprint-lines"></div>

            <div className="building-shape">
              <div className="building-window"></div>
              <div className="building-window"></div>
              <div className="building-window"></div>
              <div className="building-window"></div>
            </div>

            <span className="visual-label">
              AI GENERATED
            </span>
          </div>
        </div>
      </section>

      {/* Upload */}
      <section className="upload-section" id="upload">
        <div className="section-heading">
          <p className="eyebrow">STEP 01</p>
          <h2>Upload your floor plan</h2>
          <p>
            Start with a clear 2D architectural floor plan.
          </p>
        </div>

        <div className="upload-card">
          <label className="upload-box">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
            />

            <div className="upload-icon">↑</div>

            <h3>
              {selectedFile
                ? selectedFile.name
                : 'Drop your floor plan here'}
            </h3>

            <p>
              PNG, JPG or WEBP · Maximum 10 MB
            </p>

            <span className="browse-button">
              Browse Files
            </span>
          </label>
        </div>
      </section>

      {/* Preview */}
      {previewUrl && (
        <section className="preview-section">
          <div className="section-heading">
            <p className="eyebrow">STEP 02</p>
            <h2>Review your plan</h2>
            <p>
              Make sure your uploaded floor plan is clear
              before generating the visualization.
            </p>
          </div>

          <div className="preview-card">
            <img
              src={previewUrl}
              alt="Uploaded floor plan preview"
            />

            <div className="preview-info">
              <p className="file-name">
                {selectedFile?.name}
              </p>

              <p>
                Ready for AI architectural analysis.
              </p>

              <button
                className="primary-button"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating
                  ? 'Generating...'
                  : 'Generate Visualization'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Analysis */}
      {analysis && (
        <section className="analysis-section">
          <div className="section-heading">
            <p className="eyebrow">STEP 03</p>
            <h2>AI analysis complete</h2>
          </div>

          <div className="analysis-grid">
            <div className="analysis-card">
              <span>ROOMS DETECTED</span>
              <strong>{analysis.roomsDetected}</strong>
            </div>

            <div className="analysis-card">
              <span>ESTIMATED AREA</span>
              <strong>{analysis.estimatedArea}</strong>
            </div>

            <div className="analysis-card">
              <span>DESIGN STYLE</span>
              <strong>{analysis.style}</strong>
            </div>
          </div>
        </section>
      )}

      {/* Visualization */}
      {analysis && (
        <section className="visualization-section">
          <div className="section-heading">
            <p className="eyebrow">STEP 04</p>
            <h2>Your visualization</h2>
            <p>
              Your architectural visualization is ready.
            </p>
          </div>

          <div className="visualization-card">
            <div className="visualization-placeholder">
              <div className="visualization-icon">
                ✦
              </div>

              <h3>Visualization Ready</h3>

              <p>
                AI-generated architectural rendering will
                appear here.
              </p>

              <span className="status-badge">
                READY
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Project History */}
      <section className="history-section" id="history">
        <div className="section-heading">
          <p className="eyebrow">PROJECT HISTORY</p>
          <h2>Your recent projects</h2>
          <p>
            Your generated projects are saved in this
            browser.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">□</div>

            <h3>No projects yet</h3>

            <p>
              Upload a floor plan to create your first
              project.
            </p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                className="project-card"
                key={project.id}
              >
                <div className="project-card-top">
                  <div className="project-icon">
                    ⌂
                  </div>

                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDeleteProject(project.id)
                    }
                  >
                    Delete
                  </button>
                </div>

                <h3>{project.name}</h3>

                <p className="project-file">
                  {project.fileName}
                </p>

                <div className="project-details">
                  <div>
                    <span>Rooms</span>
                    <strong>
                      {project.roomsDetected}
                    </strong>
                  </div>

                  <div>
                    <span>Area</span>
                    <strong>
                      {project.estimatedArea}
                    </strong>
                  </div>

                  <div>
                    <span>Style</span>
                    <strong>{project.style}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-heading">
          <p className="eyebrow">WHY ARCHAI</p>
          <h2>Designed for modern architects.</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-number">01</div>
            <h3>AI Analysis</h3>
            <p>
              Automatically analyze floor plans and
              extract architectural information.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-number">02</div>
            <h3>Fast Visualization</h3>
            <p>
              Transform architectural concepts into
              visual experiences quickly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-number">03</div>
            <h3>Project Management</h3>
            <p>
              Keep track of your generated architectural
              projects in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <div
          className="login-overlay"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="login-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="close-button"
              onClick={() => setShowLogin(false)}
            >
              ×
            </button>

            <p className="eyebrow">WELCOME BACK</p>

            <h2>Sign in to ArchAI</h2>

            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
            />

            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
            />

            <button
              className="primary-button login-submit"
              onClick={() =>
                alert(
                  'Demo login successful! Authentication will be connected later.',
                )
              }
            >
              Login
            </button>

            <button
              className="signup-button"
              onClick={() =>
                alert(
                  'Demo signup button. Account creation will be added later.',
                )
              }
            >
              Create an account
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App