import { Navigate, Route, Routes } from 'react-router-dom'
import ScrollManager from './components/ScrollManager.jsx'
import HomePage from './pages/home/HomePage.jsx'
import IndustriesPage from './pages/industries/IndustriesPage.jsx'
import BookDemoPage from './pages/BookDemoPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/industries" element={<IndustriesPage />} />
        <Route path="/book-demo" element={<BookDemoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
