import { config } from '../config';

// Performance metrics types
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
  tags?: Record<string, string>;
}

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface UserInteraction {
  type: string;
  element?: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  source?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
}

/**
 * Performance monitoring and analytics system
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitalsMetric[] = [];
  private interactions: UserInteraction[] = [];
  private errors: ErrorEvent[] = [];
  private observer?: PerformanceObserver;
  private isInitialized = false;

  constructor() {
    if (config.logging.enablePerformanceMonitoring) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Initialize Web Vitals monitoring
      this.initializeWebVitals();

      // Initialize Performance Observer
      this.initializePerformanceObserver();

      // Initialize error tracking
      this.initializeErrorTracking();

      // Initialize user interaction tracking
      this.initializeInteractionTracking();

      // Send metrics periodically
      this.startMetricsReporting();

      this.isInitialized = true;
      console.log('🔍 Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  private initializeWebVitals(): void {
    // Import and initialize web-vitals dynamically
    if (typeof window !== 'undefined') {
      // Simulate web vitals measurement (in production, use actual web-vitals library)
      this.measureWebVitals();
    }
  }

  private measureWebVitals(): void {
    // Largest Contentful Paint (LCP)
    this.observeLCP();

    // First Input Delay (FID)
    this.observeFID();

    // Cumulative Layout Shift (CLS)
    this.observeCLS();

    // First Contentful Paint (FCP)
    this.observeFCP();

    // Time to First Byte (TTFB)
    this.observeTTFB();
  }

  private observeLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          this.recordWebVital('LCP', lastEntry.startTime);
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Fallback for browsers that don't support LCP
        console.warn('LCP observation not supported');
      }
    }
  }

  private observeFID(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordWebVital('FID', entry.processingStart - entry.startTime);
        });
      });

      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observation not supported');
      }
    }
  }

  private observeCLS(): void {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.recordWebVital('CLS', clsValue);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation not supported');
    }
  }

  private observeFCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordWebVital('FCP', entry.startTime);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('FCP observation not supported');
      }
    }
  }

  private observeTTFB(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      this.recordWebVital('TTFB', ttfb);
    }
  }

  private recordWebVital(name: WebVitalsMetric['name'], value: number): void {
    const rating = this.getWebVitalRating(name, value);
    
    const metric: WebVitalsMetric = {
      name,
      value,
      rating,
      timestamp: Date.now(),
    };

    this.webVitals.push(metric);

    if (config.app.debug) {
      console.log(`📊 Web Vital: ${name} = ${value.toFixed(2)}ms (${rating})`);
    }

    // Send to analytics
    this.sendWebVital(metric);
  }

  private getWebVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordPerformanceEntry(entry);
        });
      });

      try {
        this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      } catch (e) {
        console.warn('Performance Observer not fully supported');
      }
    }
  }

  private recordPerformanceEntry(entry: PerformanceEntry): void {
    let metricType: PerformanceMetric['type'] = 'timing';
    
    if (entry.entryType === 'resource') {
      metricType = 'counter';
    }

    const metric: PerformanceMetric = {
      name: entry.name,
      value: entry.duration || (entry as any).transferSize || 0,
      timestamp: Date.now(),
      type: metricType,
      tags: {
        entryType: entry.entryType,
      },
    };

    this.metrics.push(metric);

    // Log slow resources in development
    if (config.app.debug && entry.entryType === 'resource' && entry.duration > 1000) {
      console.warn(`🐌 Slow resource: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
    }
  }

  private initializeErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        stack: event.error?.stack,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getUserId(),
      });
    });

    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getUserId(),
      });
    });
  }

  private initializeInteractionTracking(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.recordInteraction({
        type: 'click',
        element: this.getElementSelector(target),
        timestamp: Date.now(),
      });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.recordInteraction({
        type: 'visibility_change',
        timestamp: Date.now(),
        metadata: {
          hidden: document.hidden,
        },
      });
    });
  }

  private getElementSelector(element: HTMLElement): string {
    const id = element.id ? `#${element.id}` : '';
    const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
    const tagName = element.tagName.toLowerCase();
    
    return `${tagName}${id}${className}`.slice(0, 100); // Limit length
  }

  private getUserId(): string | undefined {
    return localStorage.getItem(config.auth.tokenKey) ? 'authenticated' : undefined;
  }

  private recordError(error: ErrorEvent): void {
    this.errors.push(error);

    if (config.app.debug) {
      console.error('🚨 Error tracked:', error);
    }

    // Send to error reporting service
    this.sendError(error);
  }

  private recordInteraction(interaction: UserInteraction): void {
    this.interactions.push(interaction);

    // Keep only recent interactions to prevent memory leaks
    if (this.interactions.length > 100) {
      this.interactions.shift();
    }
  }

  private startMetricsReporting(): void {
    // Send metrics every 30 seconds
    setInterval(() => {
      if (this.metrics.length > 0 || this.webVitals.length > 0) {
        this.sendMetrics();
      }
    }, 30000);

    // Send metrics before page unload
    window.addEventListener('beforeunload', () => {
      this.sendMetrics();
    });
  }

  private async sendMetrics(): Promise<void> {
    if (!config.logging.enablePerformanceMonitoring) return;

    try {
      const payload = {
        metrics: this.metrics.splice(0), // Clear after taking
        webVitals: this.webVitals.splice(0),
        interactions: this.interactions.splice(0, 50), // Send recent interactions
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        userId: this.getUserId(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      if (config.app.debug) {
        console.log('📈 Sending performance metrics:', payload);
      }

      // In production, send to your analytics endpoint
      // await fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });

    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  private async sendWebVital(metric: WebVitalsMetric): Promise<void> {
    if (!config.features.analytics) return;

    try {
      // Send to Google Analytics or other analytics service
      if (config.external.googleAnalyticsId) {
        // gtag('event', metric.name, {
        //   custom_map: { metric_id: 'web_vitals' },
        //   value: Math.round(metric.value),
        //   metric_rating: metric.rating,
        // });
      }

      if (config.app.debug) {
        console.log('📊 Web vital sent:', metric);
      }
    } catch (error) {
      console.error('Failed to send web vital:', error);
    }
  }

  private async sendError(error: ErrorEvent): Promise<void> {
    if (!config.logging.enableErrorReporting) return;

    try {
      // Send to error reporting service (Sentry, Bugsnag, etc.)
      if (config.external.sentryDsn) {
        // Sentry.captureException(error);
      }

      if (config.app.debug) {
        console.log('🚨 Error sent:', error);
      }
    } catch (e) {
      console.error('Failed to send error:', e);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performance_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('performance_session_id', sessionId);
    }
    return sessionId;
  }

  // Public API
  public measureCustom(name: string, fn: () => void): void {
    const startTime = performance.now();
    fn();
    const endTime = performance.now();
    
    this.recordMetric({
      name: `custom.${name}`,
      value: endTime - startTime,
      timestamp: Date.now(),
      type: 'timing',
      tags: { custom: 'true' },
    });
  }

  public async measureAsync(name: string, fn: () => Promise<void>): Promise<void> {
    const startTime = performance.now();
    await fn();
    const endTime = performance.now();
    
    this.recordMetric({
      name: `custom.${name}`,
      value: endTime - startTime,
      timestamp: Date.now(),
      type: 'timing',
      tags: { custom: 'true', async: 'true' },
    });
  }

  public recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getWebVitals(): WebVitalsMetric[] {
    return [...this.webVitals];
  }

  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.metrics = [];
    this.webVitals = [];
    this.interactions = [];
    this.errors = [];
    this.isInitialized = false;
  }
}

// Analytics tracking
class AnalyticsTracker {
  private isInitialized = false;

  constructor() {
    if (config.features.analytics) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Initialize Google Analytics
      if (config.external.googleAnalyticsId) {
        this.initializeGA();
      }

      this.isInitialized = true;
      console.log('📈 Analytics tracking initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private initializeGA(): void {
    // Load Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.external.googleAnalyticsId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    const gtag = (...args: any[]) => {
      (window as any).dataLayer.push(...args);
    };
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', config.external.googleAnalyticsId, {
      send_page_view: false, // We'll send page views manually
    });
  }

  public trackPageView(page: string, title?: string): void {
    if (!this.isInitialized) return;

    try {
      if (config.external.googleAnalyticsId && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_title: title || document.title,
          page_location: window.location.href,
          page_path: page,
        });
      }

      if (config.app.debug) {
        console.log('📄 Page view tracked:', page, title);
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  public trackEvent(action: string, category: string, label?: string, value?: number): void {
    if (!this.isInitialized) return;

    try {
      if (config.external.googleAnalyticsId && (window as any).gtag) {
        (window as any).gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value,
        });
      }

      if (config.app.debug) {
        console.log('🎯 Event tracked:', { action, category, label, value });
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  public trackUserAction(action: string, metadata?: Record<string, any>): void {
    this.trackEvent(action, 'user_interaction', JSON.stringify(metadata));
  }

  public trackFeatureUsage(feature: string, metadata?: Record<string, any>): void {
    this.trackEvent('feature_used', 'features', feature, metadata ? Object.keys(metadata).length : undefined);
  }

  public trackError(error: string, category: string = 'javascript_error'): void {
    this.trackEvent('error', category, error);
  }
}

// Create singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const analyticsTracker = new AnalyticsTracker();

// Convenience hooks
export const usePerformanceMonitor = () => {
  return {
    measure: performanceMonitor.measureCustom.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getWebVitals: performanceMonitor.getWebVitals.bind(performanceMonitor),
  };
};

export const useAnalytics = () => {
  return {
    trackPageView: analyticsTracker.trackPageView.bind(analyticsTracker),
    trackEvent: analyticsTracker.trackEvent.bind(analyticsTracker),
    trackUserAction: analyticsTracker.trackUserAction.bind(analyticsTracker),
    trackFeatureUsage: analyticsTracker.trackFeatureUsage.bind(analyticsTracker),
    trackError: analyticsTracker.trackError.bind(analyticsTracker),
  };
};

export default { performanceMonitor, analyticsTracker };