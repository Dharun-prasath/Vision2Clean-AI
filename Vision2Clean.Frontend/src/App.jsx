import React, { useState } from 'react'
import Dashboard from './Components/Dashboard.jsx'
import Analytics from './Components/Analytics.jsx'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  const renderView = () => {
    switch (currentView) {
      case 'analytics':
        return <Analytics />
      case 'dashboard':
      default:
        return <Dashboard onNavigate={setCurrentView} currentView={currentView} />
    }
  }

  return renderView()
}

export default App
