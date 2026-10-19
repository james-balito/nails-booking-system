// Styles
import './App.css'

// React Router DOM
import { Routes, Route } from 'react-router-dom'

// Page Routes
import WelcomePage from './pages/welcome-page'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
      </Routes>
    </>
  )
}

export default App
