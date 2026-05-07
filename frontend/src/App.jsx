import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { Seo } from './components/Seo'
import { SplashScreen } from './components/SplashScreen'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { PropertyDetail } from './pages/PropertyDetail'
import { BookProperty } from './pages/BookProperty'
import { PayBooking } from './pages/PayBooking'
import { MyBookings } from './pages/MyBookings'
import { HostDashboard } from './pages/HostDashboard'
import { PropertyForm } from './pages/PropertyForm'
import { TaxiBooking } from './pages/TaxiBooking'
import { TaxonomyPage } from './pages/TaxonomyPage'
import { DestinationPage } from './pages/DestinationPage'
import { StaysPage } from './pages/StaysPage'
import { AgentsPage } from './pages/AgentsPage'
import { PackagesPage } from './pages/PackagesPage'

function App() {
  const [showSplash, setShowSplash] = useState(() => sessionStorage.getItem('makaziplus_intro_seen') !== '1')
  const finishSplash = () => {
    sessionStorage.setItem('makaziplus_intro_seen', '1')
    setShowSplash(false)
  }

  return (
    <BrowserRouter>
      <Seo />
      <AuthProvider>
        {showSplash && <SplashScreen onFinish={finishSplash} />}
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/book/:id" element={<BookProperty />} />
            <Route path="/pay/:id" element={<PayBooking />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/dashboard" element={<HostDashboard />} />
            <Route path="/property/new" element={<PropertyForm />} />
            <Route path="/property/:id/edit" element={<PropertyForm />} />
            <Route path="/stays" element={<StaysPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/taxi" element={<TaxiBooking />} />
            <Route path="/destinations/:slug" element={<DestinationPage />} />
            <Route path="/:type/:slug" element={<TaxonomyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
