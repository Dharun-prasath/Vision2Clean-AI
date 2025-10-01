import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import {
  AppBar,
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Button,
  ButtonGroup,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  IconButton,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Skeleton,
  Stack,
  Badge,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Toolbar,
  Drawer,
  List,
  ListItemButton,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Analytics as AnalyticsIcon,
  Assessment,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  FilterList,
  FileDownload,
  Refresh,
  MoreVert,
  CalendarToday,
  Schedule,
  LocationOn,
  Group,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  Speed,
  Memory,
  Storage,
  CloudDownload,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  AccountCircle,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter,
  ScatterChart,
} from "recharts";

// -----------------------
// Constants and Configuration
// -----------------------
const TIME_PERIODS = Object.freeze({
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
  LAST_90_DAYS: '90d',
  LAST_YEAR: '1y',
  CUSTOM: 'custom',
});

const CHART_COLORS = [
  '#10a37f', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
  '#ffeaa7', '#fab1a0', '#fd79a8', '#a29bfe', '#6c5ce7'
];

const METRIC_TYPES = Object.freeze({
  REQUESTS: 'requests',
  PERFORMANCE: 'performance',
  ACCURACY: 'accuracy',
  EFFICIENCY: 'efficiency',
  COST: 'cost',
});

const DRAWER_WIDTH = 260;
const MINI_DRAWER_WIDTH = 72;
const sampleUser = { name: "Administrator", role: "Admin", email: "admin@vision2clean.ai" };

// -----------------------
// Sample Data (Production: Replace with API calls)
// -----------------------
const performanceData = [
  { date: '2024-09-01', requests: 245, accuracy: 94.2, responseTime: 1.2, errors: 3 },
  { date: '2024-09-02', requests: 320, accuracy: 95.1, responseTime: 1.1, errors: 2 },
  { date: '2024-09-03', requests: 289, accuracy: 93.8, responseTime: 1.3, errors: 4 },
  { date: '2024-09-04', requests: 412, accuracy: 96.2, responseTime: 1.0, errors: 1 },
  { date: '2024-09-05', requests: 378, accuracy: 95.5, responseTime: 1.1, errors: 2 },
  { date: '2024-09-06', requests: 445, accuracy: 94.9, responseTime: 1.2, errors: 3 },
  { date: '2024-09-07', requests: 392, accuracy: 95.8, responseTime: 1.0, errors: 1 },
];

const categoryBreakdown = [
  { name: 'Plastic', value: 35, count: 1245, color: '#10a37f' },
  { name: 'Organic', value: 28, count: 996, color: '#4ecdc4' },
  { name: 'Paper', value: 20, count: 712, color: '#45b7d1' },
  { name: 'Metal', value: 12, count: 427, color: '#96ceb4' },
  { name: 'Glass', value: 5, count: 178, color: '#ffeaa7' },
];

const regionData = [
  { region: 'North Zone', requests: 856, accuracy: 95.2, efficiency: 87.5, trend: 'up' },
  { region: 'South Zone', requests: 742, accuracy: 94.8, efficiency: 89.1, trend: 'up' },
  { region: 'East Zone', requests: 634, accuracy: 93.6, efficiency: 85.2, trend: 'down' },
  { region: 'West Zone', requests: 589, accuracy: 96.1, efficiency: 91.3, trend: 'up' },
  { region: 'Central Zone', requests: 723, accuracy: 94.9, efficiency: 88.7, trend: 'up' },
];

const systemMetrics = {
  cpuUsage: 67,
  memoryUsage: 78,
  diskUsage: 45,
  networkLatency: 23,
  uptime: 99.97,
  throughput: 1247,
};

// -----------------------
// Utility Functions
// -----------------------
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatPercentage = (num) => `${num.toFixed(1)}%`;

const getTrendIcon = (trend) => {
  switch (trend) {
    case 'up': return <TrendingUp color="success" fontSize="small" />;
    case 'down': return <TrendingDown color="error" fontSize="small" />;
    default: return null;
  }
};

// -----------------------
// Custom Hooks
// -----------------------
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

const useAnalyticsData = (timePeriod) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setData({ performanceData, categoryBreakdown, regionData, systemMetrics });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timePeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// -----------------------
// Component: Metric Card
// -----------------------
const MetricCard = React.memo(({ title, value, change, trend, icon, loading = false, format = 'number' }) => {
  const theme = useTheme();
  
  const formattedValue = useMemo(() => {
    if (loading) return '';
    switch (format) {
      case 'percentage': return formatPercentage(value);
      case 'number': return formatNumber(value);
      case 'currency': return `$${formatNumber(value)}`;
      default: return value;
    }
  }, [value, format, loading]);

  const changeColor = useMemo(() => {
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.secondary';
  }, [change]);

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main'
          }}>
            {icon}
          </Box>
          {getTrendIcon(trend)}
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
          {loading ? <Skeleton width={80} /> : formattedValue}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getTrendIcon(change > 0 ? 'up' : 'down')}
            <Typography variant="caption" sx={{ color: changeColor, fontWeight: 600 }}>
              {loading ? <Skeleton width={40} /> : `${Math.abs(change)}%`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

// -----------------------
// Component: Performance Chart
// -----------------------
const PerformanceChart = React.memo(({ data, loading, selectedMetric, onMetricChange }) => {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [data]);

  if (loading) {
    return (
      <Card elevation={2} sx={{ height: 400 }}>
        <CardHeader title="Performance Trends" />
        <CardContent>
          <Skeleton variant="rectangular" height={300} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardHeader 
        title="Performance Trends"
        action={
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={selectedMetric} onChange={(e) => onMetricChange(e.target.value)}>
              <MenuItem value="requests">Requests</MenuItem>
              <MenuItem value="accuracy">Accuracy</MenuItem>
              <MenuItem value="responseTime">Response Time</MenuItem>
              <MenuItem value="errors">Errors</MenuItem>
            </Select>
          </FormControl>
        }
      />
      <CardContent>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="date" 
                stroke={theme.palette.text.secondary}
                fontSize={12}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                fontSize={12}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
              />
              <Legend />
              
              {selectedMetric === 'requests' && (
                <>
                  <Bar dataKey="requests" fill={CHART_COLORS[0]} radius={4} />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke={CHART_COLORS[1]} 
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[1], strokeWidth: 2, r: 4 }}
                    yAxisId="accuracy"
                  />
                </>
              )}
              
              {selectedMetric === 'accuracy' && (
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke={CHART_COLORS[0]} 
                  fill={alpha(CHART_COLORS[0], 0.3)}
                  strokeWidth={2}
                />
              )}
              
              {selectedMetric === 'responseTime' && (
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke={CHART_COLORS[2]} 
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS[2], strokeWidth: 2, r: 4 }}
                />
              )}
              
              {selectedMetric === 'errors' && (
                <Bar dataKey="errors" fill={CHART_COLORS[3]} radius={4} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
});

// -----------------------
// Component: Category Distribution
// -----------------------
const CategoryDistribution = React.memo(({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card elevation={2} sx={{ height: 400 }}>
        <CardHeader title="Waste Category Distribution" />
        <CardContent>
          <Skeleton variant="circular" width={250} height={250} sx={{ mx: 'auto' }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardHeader title="Waste Category Distribution" />
      <CardContent>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <RechartsPieChart 
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
                <RechartsTooltip 
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </Box>
          
          <Box sx={{ ml: 2 }}>
            {data?.map((category, index) => (
              <Box key={category.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: category.color,
                    mr: 1
                  }} 
                />
                <Typography variant="body2" sx={{ minWidth: 60 }}>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {category.value}% ({formatNumber(category.count)})
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

// -----------------------
// Component: Regional Performance
// -----------------------
const RegionalPerformance = React.memo(({ data, loading }) => {
  if (loading) {
    return (
      <Card elevation={2}>
        <CardHeader title="Regional Performance" />
        <CardContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Skeleton width="100%" height={60} />
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardHeader title="Regional Performance" />
      <CardContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Region</TableCell>
                <TableCell align="right">Requests</TableCell>
                <TableCell align="right">Accuracy</TableCell>
                <TableCell align="right">Efficiency</TableCell>
                <TableCell align="center">Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((region) => (
                <TableRow key={region.region} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {region.region}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatNumber(region.requests)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={formatPercentage(region.accuracy)}
                      size="small"
                      color={region.accuracy > 95 ? 'success' : region.accuracy > 90 ? 'warning' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Box sx={{ width: 60, mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={region.efficiency} 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Typography variant="caption">
                        {formatPercentage(region.efficiency)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {getTrendIcon(region.trend)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
});

// -----------------------
// Component: System Health
// -----------------------
const SystemHealth = React.memo(({ data, loading }) => {
  const getHealthColor = (value) => {
    if (value >= 90) return 'success';
    if (value >= 70) return 'warning';
    return 'error';
  };

  const healthMetrics = [
    { label: 'CPU Usage', value: data?.cpuUsage, icon: <Speed />, suffix: '%' },
    { label: 'Memory', value: data?.memoryUsage, icon: <Memory />, suffix: '%' },
    { label: 'Disk Space', value: data?.diskUsage, icon: <Storage />, suffix: '%' },
    { label: 'Uptime', value: data?.uptime, icon: <CheckCircle />, suffix: '%' },
  ];

  return (
    <Card elevation={2}>
      <CardHeader 
        title="System Health"
        subheader="Real-time system performance metrics"
      />
      <CardContent>
        <Grid container spacing={2}>
          {healthMetrics.map((metric) => (
            <Grid item xs={6} key={metric.label}>
              <Box sx={{ textAlign: 'center' }}>
                {loading ? (
                  <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 1 }} />
                ) : (
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                    <CircularProgress
                      variant="determinate"
                      value={metric.value}
                      size={80}
                      thickness={4}
                      color={getHealthColor(metric.value)}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      {metric.icon}
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {metric.value}{metric.suffix}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Typography variant="body2" color="text.secondary">
                  {metric.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Throughput
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {loading ? <Skeleton width={60} /> : `${formatNumber(data?.throughput)} req/min`}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Network Latency
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {loading ? <Skeleton width={60} /> : `${data?.networkLatency}ms`}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

// -----------------------
// Main Analytics Component
// -----------------------
const Analytics = ({ onNavigate, currentView = 'analytics' }) => {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useTheme();
  
  // State management
  const [drawerOpen, setDrawerOpen] = useLocalStorage("dash_drawer_open", true);
  const [darkMode, setDarkMode] = useLocalStorage("dash_dark_mode", prefersDark);
  const [timePeriod, setTimePeriod] = useState(TIME_PERIODS.LAST_30_DAYS);
  const [selectedMetric, setSelectedMetric] = useState('requests');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const { data, loading, error, refetch } = useAnalyticsData(timePeriod);

  // Create theme based on dark mode preference
  const muiTheme = useMemo(() => 
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: { main: '#10a37f' },
        secondary: { main: '#ff6b6b' },
      },
    }), [darkMode]
  );

  const handleExport = useCallback(() => {
    // Simulate export functionality
    setSnackbar({ 
      open: true, 
      message: 'Analytics data exported successfully', 
      severity: 'success' 
    });
  }, []);

  const keyMetrics = useMemo(() => [
    {
      title: 'Total Requests',
      value: 3544,
      change: 12.3,
      trend: 'up',
      icon: <Assessment />,
      format: 'number'
    },
    {
      title: 'AI Accuracy',
      value: 95.2,
      change: 2.1,
      trend: 'up',
      icon: <Timeline />,
      format: 'percentage'
    },
    {
      title: 'Response Time',
      value: 1.1,
      change: -5.7,
      trend: 'up',
      icon: <Speed />,
      format: 'number'
    },
    {
      title: 'Cost Efficiency',
      value: 847,
      change: -3.2,
      trend: 'down',
      icon: <PieChart />,
      format: 'currency'
    }
  ], []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (error) {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Box sx={{ p: 3 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }>
            Failed to load analytics data. Please try again.
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* App Bar */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={() => setDrawerOpen(!drawerOpen)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Vision2Clean AI - Analytics
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit">
                <Badge badgeContent={2} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton color="inherit">
                <AccountCircle />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
              boxSizing: 'border-box',
              transition: (t) => t.transitions.create('width', { easing: t.transitions.easing.sharp, duration: t.transitions.duration.standard }),
              overflowX: 'hidden',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
            <List>
              {[
                { text: 'Dashboard', icon: <DashboardIcon />, view: 'dashboard' },
                { text: 'Analytics', icon: <Assessment />, view: 'analytics' },
                { text: 'Settings', icon: <SettingsIcon />, view: 'settings' },
              ].map(({ text, icon, view }) => (
                <Tooltip key={text} title={drawerOpen ? '' : text} placement="right">
                  <ListItemButton 
                    selected={currentView === view} 
                    onClick={() => onNavigate && onNavigate(view)}
                    sx={{ 
                      px: drawerOpen ? 2.5 : 1.5, 
                      py: 1.25,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 0, mr: drawerOpen ? 1.5 : 0, justifyContent: 'center' }}>{icon}</ListItemIcon>
                    <ListItemText primary={text} sx={{ opacity: drawerOpen ? 1 : 0, transition: (t) => t.transitions.create('opacity') }} />
                  </ListItemButton>
                </Tooltip>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">Mode</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Switch checked={darkMode} onChange={() => setDarkMode((d) => !d)} inputProps={{ 'aria-label': 'toggle dark mode' }} />
                <Typography variant="body2">{darkMode ? 'Dark' : 'Light'}</Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ p: 2 }}>
              <Paper elevation={1} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', borderRadius: 2 }}>
                <Avatar sx={{ width: 44, height: 44 }}>{sampleUser.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{sampleUser.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{sampleUser.role}</Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                  Analytics Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Comprehensive insights and performance metrics for Vision2Clean AI
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1}>
                <FormControl size="small">
                  <InputLabel>Time Period</InputLabel>
                  <Select
                    value={timePeriod}
                    label="Time Period"
                    onChange={(e) => setTimePeriod(e.target.value)}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value={TIME_PERIODS.LAST_7_DAYS}>Last 7 Days</MenuItem>
                    <MenuItem value={TIME_PERIODS.LAST_30_DAYS}>Last 30 Days</MenuItem>
                    <MenuItem value={TIME_PERIODS.LAST_90_DAYS}>Last 90 Days</MenuItem>
                    <MenuItem value={TIME_PERIODS.LAST_YEAR}>Last Year</MenuItem>
                  </Select>
                </FormControl>
                
                <Button
                  variant="outlined"
                  startIcon={<FileDownload />}
                  onClick={handleExport}
                  disabled={loading}
                >
                  Export
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={refetch}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Stack>
            </Box>

            <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Overview" />
              <Tab label="Performance" />
              <Tab label="Regional Analysis" />
              <Tab label="System Health" />
            </Tabs>
          </Box>

          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {keyMetrics.map((metric) => (
              <Grid item xs={12} sm={6} md={3} key={metric.title}>
                <MetricCard {...metric} loading={loading} />
              </Grid>
            ))}
          </Grid>

          {/* Tab Content */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <PerformanceChart 
                  data={data?.performanceData}
                  loading={loading}
                  selectedMetric={selectedMetric}
                  onMetricChange={setSelectedMetric}
                />
              </Grid>
              <Grid item xs={12} lg={4}>
                <CategoryDistribution data={data?.categoryBreakdown} loading={loading} />
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <PerformanceChart 
                  data={data?.performanceData}
                  loading={loading}
                  selectedMetric={selectedMetric}
                  onMetricChange={setSelectedMetric}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CategoryDistribution data={data?.categoryBreakdown} loading={loading} />
              </Grid>
              <Grid item xs={12} md={6}>
                <SystemHealth data={data?.systemMetrics} loading={loading} />
              </Grid>
            </Grid>
          )}

          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RegionalPerformance data={data?.regionData} loading={loading} />
              </Grid>
            </Grid>
          )}

          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SystemHealth data={data?.systemMetrics} loading={loading} />
              </Grid>
              <Grid item xs={12} md={6}>
                <PerformanceChart 
                  data={data?.performanceData}
                  loading={loading}
                  selectedMetric="responseTime"
                  onMetricChange={setSelectedMetric}
                />
              </Grid>
            </Grid>
          )}

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
              severity={snackbar.severity}
              variant="filled"
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Analytics;