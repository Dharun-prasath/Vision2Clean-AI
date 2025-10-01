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
// Config / sample data
// -----------------------
const DEFAULT_DRAWER_OPEN = true;
const DRAWER_WIDTH = 220;
const MINI_DRAWER_WIDTH = 64;

const sampleUser = { name: "Administrator", role: "Admin" };

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
// Reusable small components
// -----------------------
const StatCard = React.memo(({ icon, label, value }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Paper elevation={2} sx={{ p: 2, display: "flex", alignItems: "center", borderRadius: 2 }}>
      <Box sx={{ mr: 2 }}>{icon}</Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6">{value}</Typography>
      </Box>
    </Paper>
  </Grid>
));

// -----------------------
// RecentRequests with sorting, filtering & pagination
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
    <Paper elevation={2} sx={{ p: 2, mt: 3, borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search requests by user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} /> }}
            size="small"
          />
        </Grid>
        <Grid item xs={6} md={3}>
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
        <Grid item xs={6} md={3} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
          <Button variant="contained" startIcon={<AddCircleOutline />}>
            New Cleaning Request
          </Button>
        </Grid>
      </Grid>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === "id" ? order : false}>
                <TableSortLabel active={orderBy === "id"} direction={order} onClick={() => handleRequestSort("id")}>ID</TableSortLabel>
              </TableCell>
              <TableCell>User</TableCell>
              <TableCell sortDirection={orderBy === "status" ? order : false}>
                <TableSortLabel active={orderBy === "status"} direction={order} onClick={() => handleRequestSort("status")}>Status</TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === "date" ? order : false}>
                <TableSortLabel active={orderBy === "date"} direction={order} onClick={() => handleRequestSort("date")}>Date</TableSortLabel>
              </TableCell>
              <TableCell>Progress</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((req) => (
              <TableRow hover key={req.id}>
                <TableCell>{req.id}</TableCell>
                <TableCell sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: "primary.light" }}>{req.user.charAt(0)}</Avatar>
                  {req.user}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {req.status === "Completed" && <CheckCircle color="success" fontSize="small" />}
                    {req.status === "Pending" && <ErrorIcon color="warning" fontSize="small" />}
                    {req.status === "In Progress" && <InfoIcon color="info" fontSize="small" />}
                    <Typography variant="body2">{req.status}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{req.date}</TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box sx={{ width: "100%", mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={req.progress}
                        sx={{ height: 8, borderRadius: 4, backgroundColor: "grey.300", '& .MuiLinearProgress-bar': { backgroundColor: req.progress === 100 ? 'success.main' : 'primary.main' } }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
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
        background: { default: darkMode ? "#0b0c0d" : "#f7f7f8", paper: darkMode ? "#111214" : "#fff" },
      },
      components: {
        MuiDrawer: {
          styleOverrides: {
            paper: { backgroundColor: darkMode ? "#0f1720" : "#202123" },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: { backgroundColor: darkMode ? "#0b0c0d" : "#ffffff" },
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
        <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }} elevation={1}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }} aria-label="toggle drawer">
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
              <Typography variant="h6" noWrap component="div">
                Vision2Clean.ai
              </Typography>

              <Box sx={{ display: { xs: "none", sm: "block" }, width: 360 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search across requests, users, IDs..."
                  InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
                />
              </Box>

              <Tooltip title={darkMode ? "Switch to light" : "Switch to dark"}>
                <IconButton onClick={() => setDarkMode((d) => !d)} aria-label="toggle theme">
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
            </Box>

            <Badge badgeContent={notifications.filter((n) => !n.read).length} color="error" sx={{ mr: 2 }}>
              <IconButton color="inherit" onClick={handleNotifMenuOpen} aria-label="open notifications">
                <NotificationsIcon />
              </IconButton>
            </Badge>

            <IconButton color="inherit" onClick={handleUserMenuOpen} aria-label="open account menu">
              <AccountCircle />
            </IconButton>

            <Menu anchorEl={userAnchorEl} open={Boolean(userAnchorEl)} onClose={handleUserMenuClose}>
              <MenuItem disabled>{sampleUser.name}</MenuItem>
              <Divider />
              <MenuItem onClick={handleUserMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleUserMenuClose}>Settings</MenuItem>
              <MenuItem onClick={handleUserMenuClose}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>

            <Menu anchorEl={notifAnchorEl} open={Boolean(notifAnchorEl)} onClose={handleNotifMenuClose} sx={{ maxWidth: 360 }}>
              <Box sx={{ px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1">Notifications</Typography>
                <Button size="small" onClick={markAllRead}>Mark all read</Button>
              </Box>
              <Divider />
              {notifications.map((notif) => (
                <MenuItem key={notif.id} onClick={handleNotifMenuClose} sx={{ whiteSpace: "normal" }}>
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
              boxSizing: "border-box",
              transition: (t) => t.transitions.create("width", { easing: t.transitions.easing.sharp, duration: t.transitions.duration.enteringScreen }),
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "auto" }}>
            <List>
              {[
                { text: "Dashboard", icon: <DashboardIcon />, selected: true },
                { text: "Analytics", icon: <AssessmentIcon /> },
                { text: "Settings", icon: <SettingsIcon /> },
              ].map(({ text, icon, selected }) => (
                <Tooltip key={text} title={!drawerOpen ? text : ""} placement="right">
                  <ListItemButton selected={selected} sx={{ px: drawerOpen ? 2 : 1.25 }}>
                    <ListItemIcon sx={{ color: "inherit", minWidth: 0, mr: drawerOpen ? 1.5 : 0, justifyContent: "center" }}>{icon}</ListItemIcon>
                    <ListItemText primary={text} sx={{ opacity: drawerOpen ? 1 : 0, transition: (t) => t.transitions.create("opacity") }} />
                  </ListItemButton>
                </Tooltip>
              ))}
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">Mode</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                <Switch checked={darkMode} onChange={() => setDarkMode((d) => !d)} inputProps={{ 'aria-label': 'toggle dark mode' }} />
                <Typography variant="body2">{darkMode ? "Dark" : "Light"}</Typography>
              </Box>
            </Box>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3, transition: (t) => t.transitions.create(["margin", "width"]), marginLeft: `${drawerOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH}px`, width: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH}px)` }}>
          <Toolbar />

          <Grid container spacing={3} alignItems="stretch">
            {stats.map((s) => (
              <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} />
            ))}

            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1">Activity (last 7 days)</Typography>
                <Box sx={{ height: 140, mt: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={miniChartData}>
                      <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10a37f" stopOpacity={0.8} />
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
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                <Typography variant="subtitle1">Quick Actions</Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                  <Button variant="contained" startIcon={<AddCircleOutline />}>New Request</Button>
                  <Button variant="outlined">Manage Models</Button>
                  <Button variant="outlined">Export CSV</Button>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">Status legend</Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CheckCircle color="success" /><Typography variant="body2">Completed</Typography></Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><ErrorIcon color="warning" /><Typography variant="body2">Pending</Typography></Box>
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
