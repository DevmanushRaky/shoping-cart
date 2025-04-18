import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

console.log('Application starting...')

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Failed to find the root element')
  throw new Error('Failed to find the root element')
}

console.log('Root element found, creating React root...')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

console.log('React root created and App component rendered')