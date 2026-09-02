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

  const [analysis, setAnalysis] = useState<{
    roomsDetected: number
    estimatedArea: string
    style: string
    visualizationStatus: string
  } | null>(null)

  // Load saved projects when the app starts
  useEffect(() => {
    const savedProjects = localStorage.getItem('archai-projects')

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setAnalysis(null)
    setIsGenerating(false)
  }

  const handleGenerate = async () => {
    if (!selectedFile) return

    setIsGenerating(true)
    setAnalysis(null)

    const formData = new FormData()
    formData.append('floorPlan', selectedFile)

    try {
      const response = await fetch(
        'http://localhost:5000/api/generate',
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()

      if (data.success) {
        setAnalysis(data.analysis)

        // Create a new project
        const newProject: Project = {
          id: Date.now(),
          name: selectedFile.name.replace(/\.[^/.]+$/, ''),
          fileName: selectedFile.name,
          roomsDetected: data.analysis.roomsDetected,
          estimatedArea: data.analysis.estimatedArea,
          style: data.analysis.style,
        }

        // Add project to the existing projects
        setProjects((currentProjects) => {
          const updatedProjects = [
            newProject,
            ...currentProjects,
          ]

          // Save projects to browser storage
          localStorage.setItem(
            'archai-projects',
            JSON.stringify(updatedProjects)
          )

          return updatedProjects
        })
      }
    } catch (error) {
      console.error('Generation failed:', error)

      alert('Unable to connect to the backend.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteProject = (id: number) => {
    const updatedProjects = projects.filter(
      (project) => project.id !== id
    )

    setProjects(updatedProjects)

    localStorage.setItem(
      'archai-projects',
      JSON.stringify(updatedProjects)
    )
  }

  return (
    <div className="app">

      {/* NAVIGATION */}
      <nav className="navbar">
        <div className="logo">
          Arch<span>AI</span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>

          <button
            className="login-button"
            onClick={() => setShowLogin(true)}
          >
            Login
          </button>
        </div>
      </nav>

      <main>

        {/* HERO SECTION */}
        <section className="hero">

          <div className="hero-content">

            <div className="hero-badge">
              ✦ AI-POWERED ARCHITECTURAL VISUALIZATION
            </div>

            <h1 className="main-heading">
              Turn Floor Plans Into
              <span>Stunning 3D Spaces</span>
            </h1>

            <p className="description">
              Upload your 2D floor plan and let AI transform
              your architectural ideas into beautiful visual
              concepts in minutes.
            </p>

            <div className="hero-buttons">

              <button
                className="primary-button"
                onClick={() =>
                  document
                    .getElementById('upload-section')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    })
                }
              >
                Start Creating <span>→</span>
              </button>

              <a
                href="#features"
                className="secondary-button"
              >
                Explore Features
              </a>

            </div>

            <div className="trust-row">

              <div>
                <strong>AI</strong>
                <span>Powered</span>
              </div>

              <div>
                <strong>2D → 3D</strong>
                <span>Transformation</span>
              </div>

              <div>
                <strong>Fast</strong>
                <span>Generation</span>
              </div>

            </div>

          </div>


          {/* UPLOAD CARD */}
          <div
            className="upload-card"
            id="upload-section"
          >

            <div className="upload-top">

              <div className="upload-icon">
                ◇
              </div>

              <div>
                <p className="upload-label">
                  STEP 01
                </p>

                <h2>
                  Upload Your Floor Plan
                </h2>
              </div>

            </div>


            <p className="upload-description">
              Upload a clear image of your architectural
              floor plan and let ArchAI analyze the layout.
            </p>


            <label className="upload-area">

              <div className="upload-cloud">
                ↑
              </div>

              <strong>
                Choose a floor plan
              </strong>

              <span>
                PNG, JPG or WEBP • Max 10MB
              </span>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                hidden
              />

            </label>


            {/* PREVIEW */}
            {previewUrl && (

              <div className="preview">

                <div className="preview-header">

                  <span>
                    Floor Plan Preview
                  </span>

                  <span className="file-status">
                    ✓ Uploaded
                  </span>

                </div>

                <img
                  src={previewUrl}
                  alt="Uploaded floor plan"
                />

                <p className="selected-file">
                  {selectedFile?.name}
                </p>


                <button
                  className="generate-button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating
                    ? 'Analyzing Floor Plan...'
                    : 'Generate 3D Visualization ✨'}
                </button>

              </div>

            )}


            {/* AI ANALYSIS */}
            {analysis && (

              <div className="analysis-card">

                <div className="result-heading">

                  <div className="success-icon">
                    ✓
                  </div>

                  <div>

                    <span>
                      STEP 02
                    </span>

                    <h2>
                      AI Analysis Complete
                    </h2>

                  </div>

                </div>


                <div className="analysis-grid">

                  <div className="analysis-item">

                    <span>🏠</span>

                    <small>
                      Rooms detected
                    </small>

                    <strong>
                      {analysis.roomsDetected}
                    </strong>

                  </div>


                  <div className="analysis-item">

                    <span>📐</span>

                    <small>
                      Estimated area
                    </small>

                    <strong>
                      {analysis.estimatedArea}
                    </strong>

                  </div>


                  <div className="analysis-item">

                    <span>🎨</span>

                    <small>
                      Design style
                    </small>

                    <strong>
                      {analysis.style}
                    </strong>

                  </div>

                </div>


                <div className="status-bar">

                  <span>
                    Visualization status
                  </span>

                  <strong>
                    ✓ {analysis.visualizationStatus}
                  </strong>

                </div>

              </div>

            )}


            {/* VISUALIZATION */}
            {analysis && (

              <div className="visualization-card">

                <div className="visualization-content">

                  <div className="visualization-icon">
                    🏠
                  </div>

                  <span className="ready-badge">
                    ✦ READY
                  </span>

                  <h2>
                    Your 3D Visualization
                  </h2>

                  <p>
                    Your floor plan has been successfully
                    processed. Your AI-generated visualization
                    will appear here.
                  </p>

                  <div className="visualization-lines">
                    <span />
                    <span />
                    <span />
                  </div>

                </div>

              </div>

            )}

          </div>

        </section>


        {/* PROJECT HISTORY */}
        <section
          className="projects-section"
          id="projects"
        >

          <div className="section-heading">

            <span>
              YOUR WORK
            </span>

            <h2>
              Project <em>History.</em>
            </h2>

          </div>


          {projects.length === 0 ? (

            <div className="empty-projects">

              <div className="empty-icon">
                ◇
              </div>

              <h3>
                No projects yet
              </h3>

              <p>
                Upload a floor plan and generate your
                first visualization to see it here.
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
                      🏠
                    </div>

                    <button
                      className="delete-project"
                      onClick={() =>
                        handleDeleteProject(project.id)
                      }
                      title="Delete project"
                    >
                      ×
                    </button>

                  </div>


                  <h3>
                    {project.name}
                  </h3>

                  <p className="project-file">
                    {project.fileName}
                  </p>


                  <div className="project-details">

                    <div>
                      <span>
                        Rooms
                      </span>

                      <strong>
                        {project.roomsDetected}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Area
                      </span>

                      <strong>
                        {project.estimatedArea}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Style
                      </span>

                      <strong>
                        {project.style}
                      </strong>
                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* FEATURES */}
        <section
          className="features"
          id="features"
        >

          <div className="section-heading">

            <span>
              WHY ARCHAI
            </span>

            <h2>
              From blueprint to
              <em> beautiful spaces.</em>
            </h2>

          </div>


          <div className="feature-grid">

            <div className="feature-card">

              <div className="feature-icon">
                ✦
              </div>

              <h3>
                AI Powered
              </h3>

              <p>
                Analyze architectural layouts and create
                intelligent visual concepts.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                ⚡
              </div>

              <h3>
                Fast Generation
              </h3>

              <p>
                Transform your floor plans into visual
                concepts quickly.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                ☁
              </div>

              <h3>
                Cloud Projects
              </h3>

              <p>
                Save your architectural projects and
                access them from anywhere.
              </p>

            </div>

          </div>

        </section>

      </main>


      {/* LOGIN MODAL */}
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
              className="close-login"
              onClick={() => setShowLogin(false)}
            >
              ×
            </button>


            <div className="login-logo">
              Arch<span>AI</span>
            </div>

            <p className="login-tag">
              WELCOME BACK
            </p>

            <h2>
              Sign in to ArchAI
            </h2>

            <p className="login-subtitle">
              Access your architectural projects
              and visualizations.
            </p>


            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
            />


            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
            />


            <button
              className="login-submit"
              onClick={() =>
                alert(
                  'Demo login — authentication coming soon!'
                )
              }
            >
              Sign In →
            </button>


            <p className="signup-text">

              Don't have an account?{' '}

              <button
                className="signup-button"
                onClick={() =>
                  alert(
                    'Signup feature coming soon!'
                  )
                }
              >
                Create one
              </button>

            </p>

          </div>

        </div>

      )}

    </div>
  )
}

export default App