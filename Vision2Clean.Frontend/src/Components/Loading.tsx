import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import { keyframes } from '@emotion/react';

// Loading animation keyframes
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

interface LoadingSpinnerProps {
  size?: number | 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'inherit';
  thickness?: number;
  message?: string;
  fullScreen?: boolean;
}

/**
 * Customizable loading spinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  thickness = 3.6,
  message,
  fullScreen = false,
}) => {
  const theme = useTheme();

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullScreen && {
          minHeight: '100vh',
          bgcolor: 'background.default',
        }),
      }}
    >
      <CircularProgress
        size={typeof size === 'string' ? undefined : size}
        color={color}
        thickness={thickness}
        sx={{
          ...(size === 'small' && { width: 24, height: 24 }),
          ...(size === 'medium' && { width: 40, height: 40 }),
          ...(size === 'large' && { width: 56, height: 56 }),
        }}
      />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            animation: `${pulse} 1.5s ease-in-out infinite`,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  return fullScreen ? (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.modal + 1,
        bgcolor: alpha(theme.palette.background.default, 0.8),
        backdropFilter: 'blur(4px)',
      }}
    >
      {content}
    </Box>
  ) : (
    content
  );
};

interface LoadingBarProps {
  progress?: number;
  variant?: 'determinate' | 'indeterminate';
  color?: 'primary' | 'secondary' | 'inherit';
  height?: number;
  message?: string;
}

/**
 * Loading progress bar component
 */
export const LoadingBar: React.FC<LoadingBarProps> = ({
  progress,
  variant = 'indeterminate',
  color = 'primary',
  height = 4,
  message,
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress
        variant={variant}
        value={progress}
        color={color}
        sx={{
          height,
          borderRadius: height / 2,
          '& .MuiLinearProgress-bar': {
            borderRadius: height / 2,
          },
        }}
      />
      {message && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: 'block', textAlign: 'center' }}
        >
          {message}
          {variant === 'determinate' && progress !== undefined && ` (${Math.round(progress)}%)`}
        </Typography>
      )}
    </Box>
  );
};

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'table' | 'chart' | 'dashboard' | 'analytics';
  rows?: number;
  height?: number | string;
  animation?: 'pulse' | 'wave' | false;
}

/**
 * Skeleton loading placeholders for different content types
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'text',
  rows = 3,
  height = 40,
  animation = 'wave',
}) => {
  const theme = useTheme();

  const renderTextSkeleton = () => (
    <Box>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={height}
          animation={animation}
          sx={{
            mb: index < rows - 1 ? 1 : 0,
            ...(index === rows - 1 && { width: '60%' }),
          }}
        />
      ))}
    </Box>
  );

  const renderCardSkeleton = () => (
    <Card>
      <CardContent>
        <Skeleton variant="text" height={32} width="70%" animation={animation} />
        <Skeleton variant="rectangular" height={120} sx={{ my: 2 }} animation={animation} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="text" width="30%" animation={animation} />
          <Skeleton variant="text" width="40%" animation={animation} />
        </Box>
      </CardContent>
    </Card>
  );

  const renderTableSkeleton = () => (
    <Box>
      {/* Table Header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="text" height={32} sx={{ flex: 1 }} animation={animation} />
        ))}
      </Box>
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
          {Array.from({ length: 4 }).map((_, cellIndex) => (
            <Skeleton
              key={cellIndex}
              variant="text"
              height={24}
              sx={{ flex: 1 }}
              animation={animation}
            />
          ))}
        </Box>
      ))}
    </Box>
  );

  const renderChartSkeleton = () => (
    <Box>
      <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} animation={animation} />
      <Skeleton
        variant="rectangular"
        height={height || 300}
        sx={{ borderRadius: 1 }}
        animation={animation}
      />
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} variant="text" width={60} animation={animation} />
        ))}
      </Box>
    </Box>
  );

  const renderDashboardSkeleton = () => (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="50%" height={48} animation={animation} />
        <Skeleton variant="text" width="70%" height={24} sx={{ mt: 1 }} animation={animation} />
      </Box>

      {/* Metrics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent>
              <Skeleton variant="circular" width={48} height={48} animation={animation} />
              <Skeleton variant="text" height={32} sx={{ mt: 2 }} animation={animation} />
              <Skeleton variant="text" width="60%" animation={animation} />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} animation={animation} />
            <Skeleton variant="rectangular" height={300} animation={animation} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} animation={animation} />
            <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} animation={animation} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderAnalyticsSkeleton = () => (
    <Box>
      {/* Header with tabs */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="60%" height={48} animation={animation} />
        <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="text" width={100} height={32} animation={animation} />
          ))}
        </Box>
        <Skeleton variant="rectangular" width="100%" height={1} animation={animation} />
      </Box>

      {/* Content area */}
      <Box>
        {renderDashboardSkeleton()}
      </Box>
    </Box>
  );

  switch (type) {
    case 'card':
      return renderCardSkeleton();
    case 'table':
      return renderTableSkeleton();
    case 'chart':
      return renderChartSkeleton();
    case 'dashboard':
      return renderDashboardSkeleton();
    case 'analytics':
      return renderAnalyticsSkeleton();
    case 'text':
    default:
      return renderTextSkeleton();
  }
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  children: React.ReactNode;
  blur?: boolean;
}

/**
 * Loading overlay that can be placed over any content
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  children,
  blur = true,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      {visible && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.background.default, 0.8),
            zIndex: theme.zIndex.modal,
            ...(blur && {
              backdropFilter: 'blur(4px)',
            }),
          }}
        >
          <LoadingSpinner message={message} />
        </Box>
      )}
    </Box>
  );
};

interface SmartLoadingProps {
  loading: boolean;
  error?: Error | string | null;
  empty?: boolean;
  emptyMessage?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Smart loading component that handles loading, error, and empty states
 */
export const SmartLoading: React.FC<SmartLoadingProps> = ({
  loading,
  error,
  empty = false,
  emptyMessage = 'No data available',
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
}) => {
  if (loading) {
    return <>{loadingComponent || <LoadingSpinner message="Loading..." />}</>;
  }

  if (error) {
    return (
      <>
        {errorComponent || (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography color="text.secondary">
              {typeof error === 'string' ? error : error.message}
            </Typography>
          </Box>
        )}
      </>
    );
  }

  if (empty) {
    return (
      <>
        {emptyComponent || (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="h6">
              {emptyMessage}
            </Typography>
          </Box>
        )}
      </>
    );
  }

  return <>{children}</>;
};

// Loading context for global loading state management
interface LoadingContextType {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = React.createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState('Loading...');

  return (
    <LoadingContext.Provider value={{ loading, setLoading, loadingMessage, setLoadingMessage }}>
      {children}
      {loading && <LoadingSpinner fullScreen message={loadingMessage} />}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = React.useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export default {
  LoadingSpinner,
  LoadingBar,
  SkeletonLoader,
  LoadingOverlay,
  SmartLoading,
  LoadingProvider,
  useLoading,
};