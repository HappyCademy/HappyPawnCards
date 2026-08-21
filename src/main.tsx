import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PieceSetProvider } from './context/PieceSetContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PieceSetProvider>
      <App />
    </PieceSetProvider>
  </StrictMode>,
)
