
// Import our custom JSX runtime to help with React transformation
import React from './jsx-runtime'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Make sure React is available globally
// @ts-ignore
window.React = React;

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
