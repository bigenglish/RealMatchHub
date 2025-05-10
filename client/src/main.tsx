
// Import React normally instead of from our custom JSX runtime
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
// Import our JSX runtime for transformations (don't remove this even if unused)
import './jsx-runtime'

// Find the root element and render our app
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
