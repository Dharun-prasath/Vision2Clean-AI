import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  createTheme,
  ThemeProvider,
  useMediaQuery,
  Switch,
  TableSortLabel,
  TablePagination,
  Chip,
  Stack,
} from "@mui/material";
import {
  AccountCircle,
  AddCircleOutline,
  Assessment as AssessmentIcon,
  CheckCircle,
  Dashboard as DashboardIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { ResponsiveContainer, AreaChart, Area, Tooltip as RechartTooltip, XAxis, YAxis } from "recharts";

// -----------------------
// Design / UX notes
// -----------------------
// - Focus on spacing, subtle elevation, consistent color tokens
// - Use compact, dense table with clear status chips
// - Smooth drawer width transition and mini-mode with tooltips
// - Improved header with compact search and utility actions

// -----------------------
// Config / sample data
// -----------------------
const DEFAULT_DRAWER_OPEN = true;
const DRAWER_WIDTH = 260;
const MINI_DRAWER_WIDTH = 72;

const sampleUser = { name: "Administrator", role: "Admin", email: "admin@vision2clean.ai" };

const notificationsSeed = [
  { id: 1, message: "New cleaning request received", type: "info", time: "2m" },
  { id: 2, message: "AI model updated successfully", type: "success", time: "1h" },
  { id: 3, message: "Error in image upload", type: "error", time: "3h" },
];

const statsSeed = [
  { label: "Total Requests", value: 128, icon: <AssessmentIcon fontSize="large" /> },
  { label: "Completed", value: 97, icon: <CheckCircle fontSize="large" /> },
  { label: "Pending", value: 31, icon: <ErrorIcon fontSize="large" /> },
  { label: "AI Accuracy", value: "92%", icon: <InfoIcon fontSize="large" /> },
];

const recentRequestsSeed = [
  { id: 101, user: "Alice", status: "Completed", date: "2024-06-10", progress: 100 },
  { id: 102, user: "Bob", status: "Pending", date: "2024-06-11", progress: 60 },
  { id: 103, user: "Carla", status: "In Progress", date: "2024-06-12", progress: 80 },
  { id: 104, user: "David", status: "Completed", date: "2024-06-13", progress: 100 },
  { id: 105, user: "Eva", status: "Pending", date: "2024-06-14", progress: 30 },
  { id: 106, user: "Frank", status: "In Progress", date: "2024-06-15", progress: 40 },
  { id: 107, user: "Gina", status: "Completed", date: "2024-06-16", progress: 100 },
  { id: 108, user: "Harry", status: "Pending", date: "2024-06-17", progress: 20 },
];

const miniChartData = [
  { name: "Mon", value: 40 },
  { name: "Tue", value: 55 },
  { name: "Wed", value: 65 },
  { name: "Thu", value: 80 },
  { name: "Fri", value: 70 },
  { name: "Sat", value: 90 },
  { name: "Sun", value: 100 },
];

// -----------------------
// Utils
// -----------------------
function stableSort(array, comparator) {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

// -----------------------
// Small reusable pieces
// -----------------------
const StatusChip = ({ status }) => {
  const map = {
    Completed: { label: "Completed", color: "success", icon: <CheckCircle fontSize="small" /> },
    Pending: { label: "Pending", color: "warning", icon: <ErrorIcon fontSize="small" /> },
    "In Progress": { label: "In Progress", color: "info", icon: <InfoIcon fontSize="small" /> },
  };
  const cfg = map[status] || { label: status, color: "default" };
  return <Chip size="small" variant="outlined" color={cfg.color} icon={cfg.icon} label={cfg.label} />;
};

const StatCard = React.memo(({ icon, label, value }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderRadius: 2,
        minHeight: 96,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 1.5, background: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(16,163,127,0.06)" }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.4 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5 }}>{value}</Typography>
      </Box>
    </Paper>
  </Grid>
));

// -----------------------
// RecentRequests with sorting, filtering & pagination (polished)
// -----------------------
const RecentRequests = React.memo(({ requests }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("date");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (searchQuery && !r.user.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [requests, searchQuery, statusFilter]);

  const sorted = useMemo(() => stableSort(filtered, getComparator(order, orderBy)), [filtered, order, orderBy]);
  const paginated = useMemo(() => sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [sorted, page, rowsPerPage]);

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 3, borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search requests by user or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} /> }}
          />
        </Grid>
        <Grid item xs={8} md={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={4} md={3} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
          <Button variant="contained" startIcon={<AddCircleOutline />}>New Cleaning Request</Button>
        </Grid>
      </Grid>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: (t) => t.palette.action.hover }}>
              <TableCell sortDirection={orderBy === "id" ? order : false} sx={{ fontWeight: 700 }}> 
                <TableSortLabel active={orderBy === "id"} direction={order} onClick={() => handleRequestSort("id")}>ID</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sortDirection={orderBy === "status" ? order : false} sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === "status"} direction={order} onClick={() => handleRequestSort("status")}>Status</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "date" ? order : false} sx={{ fontWeight: 700 }}>
                <TableSortLabel active={orderBy === "date"} direction={order} onClick={() => handleRequestSort("date")}>Date</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Progress</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((req) => (
              <TableRow hover key={req.id} sx={{ '&:hover': { transform: 'translateY(-1px)' }, transition: 'transform .12s ease' }}>
                <TableCell sx={{ width: 90, fontWeight: 600 }}>{req.id}</TableCell>
                <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: 14 }}>{req.user.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{req.user}</Typography>
                    <Typography variant="caption" color="text.secondary">user@domain.com</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <StatusChip status={req.status} />
                </TableCell>
                <TableCell>{req.date}</TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={req.progress}
                        sx={{ height: 8, borderRadius: 4, backgroundColor: 'grey.200', '& .MuiLinearProgress-bar': { background: req.progress === 100 ? 'linear-gradient(90deg, #4caf50, #2e7d32)' : 'linear-gradient(90deg, #10a37f, #0b8a67)' } }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 45 }}>
                      <Typography variant="body2" color="text.secondary">{`${req.progress}%`}</Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">No requests match your filters.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sorted.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{ mt: 1 }}
      />
    </Paper>
  );
});

// -----------------------
// Main Dashboard
// -----------------------
export default function DashboardEnhanced() {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [drawerOpen, setDrawerOpen] = useState(() => {
    try {
      const raw = localStorage.getItem("dash_drawer_open");
      return raw ? JSON.parse(raw) : DEFAULT_DRAWER_OPEN;
    } catch (e) {
      return DEFAULT_DRAWER_OPEN;
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const raw = localStorage.getItem("dash_dark_mode");
      return raw ? JSON.parse(raw) : prefersDark;
    } catch (e) {
      return prefersDark;
    }
  });

  useEffect(() => {
    localStorage.setItem("dash_drawer_open", JSON.stringify(drawerOpen));
  }, [drawerOpen]);

  useEffect(() => {
    localStorage.setItem("dash_dark_mode", JSON.stringify(darkMode));
  }, [darkMode]);

  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState(notificationsSeed);

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? "dark" : "light",
        primary: { main: "#10a37f" },
        background: { default: darkMode ? "#071014" : "#f5f7fa", paper: darkMode ? "#0b0f12" : "#fff" },
      },
      typography: {
        fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
      },
      components: {
        MuiDrawer: {
          styleOverrides: {
            paper: { backgroundColor: darkMode ? "#071018" : "#f8fafc", borderRight: '1px solid rgba(16,16,16,0.04)' },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: { backgroundColor: darkMode ? "#071018" : "#ffffff", boxShadow: '0 2px 10px rgba(2,6,23,0.06)' },
          },
        },
      },
    }), [darkMode]
  );

  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDrawerToggle = useCallback(() => setDrawerOpen((s) => !s), []);
  const handleUserMenuOpen = (e) => setUserAnchorEl(e.currentTarget);
  const handleUserMenuClose = () => setUserAnchorEl(null);
  const handleNotifMenuOpen = (e) => setNotifAnchorEl(e.currentTarget);
  const handleNotifMenuClose = () => setNotifAnchorEl(null);

  const markAllRead = () => setNotifications((n) => n.map((x) => ({ ...x, read: true })));

  const getNotifIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle color="success" sx={{ mr: 1 }} />;
      case "error":
        return <ErrorIcon color="error" sx={{ mr: 1 }} />;
      default:
        return <InfoIcon color="info" sx={{ mr: 1 }} />;
    }
  };

  // Sample aggregated stats (could be computed from API data)
  const stats = statsSeed;
  const recentRequests = recentRequestsSeed;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }} elevation={0}>
          <Toolbar sx={{ gap: 2 }}>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }} aria-label="toggle drawer">
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
              <Box>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
                  Vision2Clean.ai
                </Typography>
                <Typography variant="caption" color="text.secondary">Operational dashboard</Typography>
              </Box>

              <Box sx={{ display: { xs: 'none', sm: 'block' }, width: 420 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search requests, users, IDs..."
                  InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
                />
              </Box>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={darkMode ? "Switch to light" : "Switch to dark"}>
                <IconButton onClick={() => setDarkMode((d) => !d)} aria-label="toggle theme">
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              <Badge badgeContent={notifications.filter((n) => !n.read).length} color="error">
                <IconButton color="inherit" onClick={handleNotifMenuOpen} aria-label="open notifications">
                  <NotificationsIcon />
                </IconButton>
              </Badge>

              <IconButton color="inherit" onClick={handleUserMenuOpen} aria-label="open account menu">
                <Avatar sx={{ width: 36, height: 36 }}>{sampleUser.name.charAt(0)}</Avatar>
              </IconButton>
            </Stack>

            <Menu anchorEl={userAnchorEl} open={Boolean(userAnchorEl)} onClose={handleUserMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <Box sx={{ p: 2, minWidth: 220 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{sampleUser.name}</Typography>
                <Typography variant="body2" color="text.secondary">{sampleUser.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleUserMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleUserMenuClose}>Settings</MenuItem>
              <MenuItem onClick={handleUserMenuClose}><LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout</MenuItem>
            </Menu>

            <Menu anchorEl={notifAnchorEl} open={Boolean(notifAnchorEl)} onClose={handleNotifMenuClose} sx={{ maxWidth: 360 }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">Notifications</Typography>
                <Button size="small" onClick={markAllRead}>Mark all read</Button>
              </Box>
              <Divider />
              {notifications.map((notif) => (
                <MenuItem key={notif.id} onClick={handleNotifMenuClose} sx={{ whiteSpace: 'normal' }}>
                  {getNotifIcon(notif.type)}
                  <Box>
                    <Typography variant="body2">{notif.message}</Typography>
                    <Typography variant="caption" color="text.secondary">{notif.time}</Typography>
                  </Box>
                </MenuItem>
              ))}
              {notifications.length === 0 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">No notifications</Typography>
                </Box>
              )}
            </Menu>
          </Toolbar>
        </AppBar>

        <Drawer
          variant={isSm ? "temporary" : "permanent"}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
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
                { text: 'Dashboard', icon: <DashboardIcon />, selected: true },
                { text: 'Analytics', icon: <AssessmentIcon /> },
                { text: 'Settings', icon: <SettingsIcon /> },
              ].map(({ text, icon, selected }) => (
                <Tooltip key={text} title={drawerOpen ? '' : text} placement="right">
                  <ListItemButton selected={selected} sx={{ px: drawerOpen ? 2.5 : 1.5, py: 1.25 }}>
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

        <Box component="main" sx={{ flexGrow: 1, p: 3, transition: (t) => t.transitions.create(['margin', 'width']), marginLeft: `${drawerOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH}px`, width: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH}px)` }}>
          <Toolbar />

          <Grid container spacing={3} alignItems="stretch">
            {stats.map((s) => (
              <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} />
            ))}

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Activity (last 7 days)</Typography>
                <Box sx={{ height: 160, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={miniChartData}>
                      <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10a37f" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#10a37f" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <RechartTooltip />
                      <Area type="monotone" dataKey="value" stroke="#10a37f" fillOpacity={1} fill="url(#colorUv)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Quick Actions</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  <Button variant="contained" startIcon={<AddCircleOutline />}>New Request</Button>
                  <Button variant="outlined">Manage Models</Button>
                  <Button variant="outlined">Export CSV</Button>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">Status legend</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle color="success" /><Typography variant="body2">Completed</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ErrorIcon color="warning" /><Typography variant="body2">Pending</Typography></Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <RecentRequests requests={recentRequests} />
            </Grid>

          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
