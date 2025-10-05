import React, { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import ErrorBoundary from './ErrorBoundary.tsx';

// Component that can throw errors for testing
const ErrorThrower = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('This is a test error to demonstrate ErrorBoundary functionality!');
  }
  
  return (
    <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
      <Typography color="success.contrastText">
        ✅ Component is working correctly!
      </Typography>
    </Box>
  );
};

/**
 * ErrorBoundary Demo Component
 * Shows how ErrorBoundary catches and handles errors gracefully
 */
const ErrorBoundaryDemo = () => {
  const [triggerError, setTriggerError] = useState(false);

  const handleTriggerError = () => {
    setTriggerError(true);
  };

  const handleReset = () => {
    setTriggerError(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        🛡️ ErrorBoundary Demo
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This demo shows how ErrorBoundary catches JavaScript errors and displays user-friendly fallback UI.
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          color="error" 
          onClick={handleTriggerError}
          disabled={triggerError}
          sx={{ mr: 2 }}
        >
          🧨 Trigger Error
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={handleReset}
          disabled={!triggerError}
        >
          🔄 Reset Demo
        </Button>
      </Box>

      {/* Component wrapped in ErrorBoundary for demonstration */}
      <ErrorBoundary 
        level="component" 
        resetOnPropsChange={true}
        onError={(error, errorInfo) => {
          console.log('Demo: Error caught by ErrorBoundary', { error, errorInfo });
        }}
      >
        <ErrorThrower shouldThrow={triggerError} />
      </ErrorBoundary>
    </Box>
  );
};

export default ErrorBoundaryDemo;