import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { config } from '../config';

// Accessibility preferences interface
interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  announcements: boolean;
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (element: HTMLElement | string) => void;
  skipToContent: () => void;
}

// Default preferences
const defaultPreferences: AccessibilityPreferences = {
  reduceMotion: false,
  highContrast: false,
  fontSize: 'medium',
  screenReader: false,
  keyboardNavigation: true,
  focusVisible: true,
  announcements: true,
};

// Create context
const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

/**
 * Accessibility Provider Component
 * Manages accessibility preferences and provides utilities
 */
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null);

  // Initialize preferences from localStorage and system preferences
  useEffect(() => {
    const savedPreferences = localStorage.getItem(`${config.storage.prefix}accessibility`);
    const systemMediaQueries = {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    };

    const initialPreferences = {
      ...defaultPreferences,
      ...systemMediaQueries,
      ...(savedPreferences ? JSON.parse(savedPreferences) : {}),
    };

    setPreferences(initialPreferences);
    applyAccessibilityStyles(initialPreferences);
  }, []);

  // Create screen reader announcer element
  useEffect(() => {
    const announcerElement = document.createElement('div');
    announcerElement.setAttribute('aria-live', 'polite');
    announcerElement.setAttribute('aria-atomic', 'true');
    announcerElement.style.position = 'absolute';
    announcerElement.style.left = '-10000px';
    announcerElement.style.width = '1px';
    announcerElement.style.height = '1px';
    announcerElement.style.overflow = 'hidden';
    document.body.appendChild(announcerElement);
    setAnnouncer(announcerElement);

    return () => {
      if (document.body.contains(announcerElement)) {
        document.body.removeChild(announcerElement);
      }
    };
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      updatePreference('reduceMotion', e.matches);
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      updatePreference('highContrast', e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Apply accessibility styles to document
  const applyAccessibilityStyles = useCallback((prefs: AccessibilityPreferences) => {
    const root = document.documentElement;

    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px',
    };
    root.style.fontSize = fontSizeMap[prefs.fontSize];

    // High contrast
    if (prefs.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (prefs.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Focus visible
    if (prefs.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  }, []);

  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Save to localStorage
    localStorage.setItem(`${config.storage.prefix}accessibility`, JSON.stringify(newPreferences));
    
    // Apply styles
    applyAccessibilityStyles(newPreferences);

    // Announce change if announcements are enabled
    if (newPreferences.announcements) {
      announce(`${key} ${value ? 'enabled' : 'disabled'}`);
    }
  }, [preferences, applyAccessibilityStyles]);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcer || !preferences.announcements) return;

    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (announcer) {
        announcer.textContent = '';
      }
    }, 1000);
  }, [announcer, preferences.announcements]);

  const focusElement = useCallback((element: HTMLElement | string) => {
    const targetElement = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element;

    if (targetElement) {
      targetElement.focus();
      
      // Announce focus change for screen readers
      const elementText = targetElement.textContent || targetElement.getAttribute('aria-label') || 'element';
      announce(`Focused on ${elementText}`);
    }
  }, [announce]);

  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      announce('Skipped to main content');
    }
  }, [announce]);

  const contextValue: AccessibilityContextType = {
    preferences,
    updatePreference,
    announce,
    focusElement,
    skipToContent,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Hook to use accessibility context
export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Skip to content component
export const SkipToContent: React.FC = () => {
  const { skipToContent } = useAccessibility();

  return (
    <button
      className="skip-to-content"
      onClick={skipToContent}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          skipToContent();
        }
      }}
      style={{
        position: 'absolute',
        top: '-40px',
        left: '6px',
        background: '#000',
        color: '#fff',
        padding: '8px 16px',
        textDecoration: 'none',
        borderRadius: '4px',
        zIndex: 1000,
        transition: 'top 0.3s',
      }}
      onFocus={(e) => {
        e.target.style.top = '6px';
      }}
      onBlur={(e) => {
        e.target.style.top = '-40px';
      }}
    >
      Skip to main content
    </button>
  );
};

// Accessibility settings panel component
export const AccessibilitySettings: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { preferences, updatePreference } = useAccessibility();

  return (
    <div
      role="dialog"
      aria-labelledby="accessibility-settings-title"
      aria-describedby="accessibility-settings-description"
      style={{
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <h2 id="accessibility-settings-title">Accessibility Settings</h2>
      <p id="accessibility-settings-description">
        Customize your experience with these accessibility options.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Reduce Motion */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={preferences.reduceMotion}
            onChange={(e) => updatePreference('reduceMotion', e.target.checked)}
            aria-describedby="reduce-motion-desc"
          />
          <span>Reduce Motion</span>
        </label>
        <p id="reduce-motion-desc" style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          Minimizes animations and transitions
        </p>

        {/* High Contrast */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={preferences.highContrast}
            onChange={(e) => updatePreference('highContrast', e.target.checked)}
            aria-describedby="high-contrast-desc"
          />
          <span>High Contrast</span>
        </label>
        <p id="high-contrast-desc" style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          Increases contrast for better visibility
        </p>

        {/* Font Size */}
        <div>
          <label htmlFor="font-size-select">Font Size</label>
          <select
            id="font-size-select"
            value={preferences.fontSize}
            onChange={(e) => updatePreference('fontSize', e.target.value as AccessibilityPreferences['fontSize'])}
            style={{ marginLeft: '8px', padding: '4px' }}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra Large</option>
          </select>
        </div>

        {/* Screen Reader */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={preferences.screenReader}
            onChange={(e) => updatePreference('screenReader', e.target.checked)}
            aria-describedby="screen-reader-desc"
          />
          <span>Screen Reader Optimizations</span>
        </label>
        <p id="screen-reader-desc" style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          Enhanced support for screen readers
        </p>

        {/* Announcements */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={preferences.announcements}
            onChange={(e) => updatePreference('announcements', e.target.checked)}
            aria-describedby="announcements-desc"
          />
          <span>Voice Announcements</span>
        </label>
        <p id="announcements-desc" style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          Announce important changes and updates
        </p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            padding: '8px 16px',
            background: '#10a37f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      )}
    </div>
  );
};

// Keyboard navigation utilities
export const useKeyboardNavigation = () => {
  const { preferences, announce } = useAccessibility();

  const handleKeyNavigation = useCallback((event: KeyboardEvent, element: HTMLElement) => {
    if (!preferences.keyboardNavigation) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const focusedIndex = Array.from(focusableElements).indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = (focusedIndex + 1) % focusableElements.length;
        focusableElements[nextIndex]?.focus();
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = (focusedIndex - 1 + focusableElements.length) % focusableElements.length;
        focusableElements[prevIndex]?.focus();
        break;

      case 'Home':
        event.preventDefault();
        focusableElements[0]?.focus();
        break;

      case 'End':
        event.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
        break;

      case 'Escape':
        if (document.activeElement) {
          (document.activeElement as HTMLElement).blur();
          announce('Focus cleared');
        }
        break;
    }
  }, [preferences.keyboardNavigation, announce]);

  return { handleKeyNavigation };
};

// Focus trap utility for modals and dialogs
export const useFocusTrap = (isActive: boolean) => {
  const trapRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !trapRef.current) return;

    const trapElement = trapRef.current;
    const focusableElements = trapElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when trap becomes active
    firstElement?.focus();

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return trapRef;
};

export default {
  AccessibilityProvider,
  useAccessibility,
  SkipToContent,
  AccessibilitySettings,
  useKeyboardNavigation,
  useFocusTrap,
};