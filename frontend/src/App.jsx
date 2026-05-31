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
import { BillingCenter } from './pages/BillingCenter'
import { PropertyForm } from './pages/PropertyForm'
import { TaxiBooking } from './pages/TaxiBooking'
import { TaxonomyPage } from './pages/TaxonomyPage'
import { DestinationPage } from './pages/DestinationPage'
import { StaysPage } from './pages/StaysPage'
import { AgentsPage } from './pages/AgentsPage'
import { PackagesPage } from './pages/PackagesPage'
import { Terms } from './pages/Terms'
import { Privacy } from './pages/Privacy'
import { HostResponsibility } from './pages/HostResponsibility'
import { FraudReporting } from './pages/FraudReporting'
import { DisputePolicy } from './pages/DisputePolicy'
import { Contact } from './pages/Contact'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { AccountPage } from './pages/AccountPage'
import { FoodPage } from './pages/FoodPage'
import { BusinessPage } from './pages/BusinessPage'
import { ProvidersPage } from './pages/ProvidersPage'
import { ProviderRegistration } from './pages/ProviderRegistration'
import { ProviderDashboard } from './pages/ProviderDashboard'

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
            <Route path="/dashboard" element={<Navigate to="/owner-dashboard" replace />} />
            <Route path="/owner-dashboard" element={<HostDashboard />} />
            <Route path="/owner-dashboard/billing" element={<BillingCenter />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/property/new" element={<PropertyForm />} />
            <Route path="/property/:id/edit" element={<PropertyForm />} />
            <Route path="/stays" element={<StaysPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/taxi" element={<TaxiBooking />} />
            <Route path="/food" element={<FoodPage />} />
            <Route path="/business" element={<BusinessPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/register-provider" element={<ProviderRegistration />} />
            <Route path="/provider-dashboard" element={<ProviderDashboard />} />
            <Route path="/destinations/:slug" element={<DestinationPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/host-responsibility" element={<HostResponsibility />} />
            <Route path="/fraud-reporting" element={<FraudReporting />} />
            <Route path="/dispute-policy" element={<DisputePolicy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            <Route path="/:type/:slug" element={<TaxonomyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
