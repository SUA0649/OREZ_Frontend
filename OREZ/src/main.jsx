// fileName: main.jsx

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './App.css'

// --- START: TITLE CHANGE ---
document.title = "Orez";
// --- END: TITLE CHANGE ---

createRoot(document.getElementById('root')).render(
<React.StrictMode>
<App />
</React.StrictMode>
)