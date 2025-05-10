
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Mount the app to the root element
const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
