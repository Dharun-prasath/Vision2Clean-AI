import React, { useState } from 'react'
import Dashboard from './Components/Dashboard.jsx'
import Analytics from './Components/Analytics.jsx'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  const handleNavigation = (view) => {
    setCurrentView(view)
  }

  const renderView = () => {
    switch (currentView) {
      case 'analytics':
        return <Analytics onNavigate={handleNavigation} currentView={currentView} />
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigation} currentView={currentView} />
      case 'settings':
        // Placeholder for settings page - you can create a Settings component later
        return <Dashboard onNavigate={handleNavigation} currentView={currentView} />
      default:
        return <Dashboard onNavigate={handleNavigation} currentView={currentView} />
    }
  }

  return renderView()
}

export default App
