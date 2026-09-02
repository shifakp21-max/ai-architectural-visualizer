import { useState } from 'react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    setSelectedFile(file)

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          Arch<span>AI</span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <button className="login-button">Login</button>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="tagline">AI-POWERED ARCHITECTURAL VISUALIZATION</p>

            <h1>
              Turn Floor Plans Into
              <span> Stunning 3D Spaces</span>
            </h1>

            <p className="description">
              Upload your 2D floor plan and let AI transform it into a
              photorealistic architectural visualization in minutes.
            </p>

            <button className="primary-button">
              Start Creating →
            </button>
          </div>

          <div className="upload-card">
            <div className="upload-icon">📐</div>

            <h2>Upload Your Floor Plan</h2>

            <p>
              Drag and drop your floor plan here, or choose a file from
              your computer.
            </p>

            <label className="upload-button">
             Choose Floor Plan
             <input
               type="file"
               accept="image/png,image/jpeg,image/webp"
               onChange={handleFileChange}
               hidden
             />
           </label>

            <small>PNG, JPG or WEBP • Max 10MB</small>
            {previewUrl && (
             <div className="preview">
              <img src={previewUrl} alt="Uploaded floor plan" />

              <p>
                Selected: <strong>{selectedFile?.name}</strong>
              </p>
             </div>
            )}
          </div>
        </section>

        <section className="features" id="features">
          <div>
            <h3>🤖 AI Powered</h3>
            <p>Analyze architectural layouts and generate visualizations.</p>
          </div>

          <div>
            <h3>⚡ Fast Generation</h3>
            <p>Turn your ideas into visual concepts quickly.</p>
          </div>

          <div>
            <h3>☁️ Cloud Projects</h3>
            <p>Save and access your architectural projects anywhere.</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App