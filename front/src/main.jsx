import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Buffer } from 'buffer'
import process from 'process'


// Fix pour simple-peer et les librairies Node.js dans le navigateur
window.Buffer = Buffer;
window.process = process;
window.process.nextTick = (fn, ...args) => setTimeout(() => fn(...args), 0);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
