import React, { useState } from 'react'
import Dashboard from './Components/Dashboard.jsx'
import Analytics from './Components/Analytics.jsx'
import ErrorBoundary from './Components/ErrorBoundary.tsx'
import ErrorBoundaryDemo from './Components/ErrorBoundaryDemo.jsx'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  const handleNavigation = (view) => {
    setCurrentView(view)
  }

  const renderView = () => {
    switch (currentView) {
      case 'analytics':
        return (
          <ErrorBoundary level="page" resetOnPropsChange={true}>
            <Analytics onNavigate={handleNavigation} currentView={currentView} />
          </ErrorBoundary>
        )
      case 'dashboard':
        return (
          <ErrorBoundary level="page" resetOnPropsChange={true}>
            <Dashboard onNavigate={handleNavigation} currentView={currentView} />
          </ErrorBoundary>
        )
      case 'settings':
        return (
          <ErrorBoundary level="page" resetOnPropsChange={true}>
            <Dashboard onNavigate={handleNavigation} currentView={currentView} />
          </ErrorBoundary>
        )
      case 'error-demo':
        return (
          <ErrorBoundary level="page" resetOnPropsChange={true}>
            <ErrorBoundaryDemo />
          </ErrorBoundary>
        )
      default:
        return (
          <ErrorBoundary level="page" resetOnPropsChange={true}>
            <Dashboard onNavigate={handleNavigation} currentView={currentView} />
          </ErrorBoundary>
        )
    }
  }

  return (
    <ErrorBoundary level="global">
      {renderView()}
    </ErrorBoundary>
  )
}

export default App
