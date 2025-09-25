import React, { useState, useMemo, useCallback } from "react";
import {
    AppBar, Avatar, Badge, Box, Button, CssBaseline, Divider, Drawer, Grid, IconButton,
    LinearProgress, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
    Toolbar, Tooltip, Typography, createTheme, ThemeProvider
} from "@mui/material";
import {
    AccountCircle, AddCircleOutline, Assessment as AssessmentIcon, CheckCircle,
    Dashboard as DashboardIcon, Error as ErrorIcon, Info as InfoIcon, Logout as LogoutIcon,
    Menu as MenuIcon, Notifications as NotificationsIcon, Search as SearchIcon,
    Settings as SettingsIcon
} from "@mui/icons-material";

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#10a37f', // Inspired by ChatGPT's green accents
        },
        secondary: {
            main: '#343541', // Dark gray for contrast
        },
        background: {
            default: '#f7f7f8', // Light background similar to ChatGPT's main area
            paper: '#ffffff',
        },
        text: {
            primary: '#202123', // Dark text for readability
        },
    },
    components: {
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#202123', // Dark sidebar like ChatGPT
                    color: '#ffffff',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff', // Light top bar for contrast
                    color: '#202123',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                contained: {
                    textTransform: 'none', // Minimalistic like ChatGPT buttons
                },
            },
        },
    },
});

const user = {
    name: "Administrator",
    role: "Admin",
};

const notifications = [
    { id: 1, message: "New cleaning request received", type: "info" },
    { id: 2, message: "AI model updated successfully", type: "success" },
    { id: 3, message: "Error in image upload", type: "error" },
];

const stats = [
    { label: "Total Requests", value: 128, icon: <AssessmentIcon color="primary" /> },
    { label: "Completed", value: 97, icon: <CheckCircle sx={{ color: 'success.main' }} /> },
    { label: "Pending", value: 31, icon: <ErrorIcon sx={{ color: 'warning.main' }} /> },
    { label: "AI Accuracy", value: "92%", icon: <InfoIcon color="info" /> },
];

const recentRequests = [
    { id: 101, user: "User1", status: "Completed", date: "2024-06-10", progress: 100 },
    { id: 102, user: "User2", status: "Pending", date: "2024-06-11", progress: 60 },
    { id: 103, user: "User3", status: "In Progress", date: "2024-06-12", progress: 80 },
    // Added more for robustness (e.g., to test pagination if added later)
    { id: 104, user: "User4", status: "Completed", date: "2024-06-13", progress: 100 },
    { id: 105, user: "User5", status: "Pending", date: "2024-06-14", progress: 30 },
];

const drawerWidth = 50;
const miniDrawerWidth = 26;

// --- REUSABLE COMPONENTS ---

const StatCard = React.memo(({ icon, label, value }) => (
    <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={1} sx={{ p: 2, display: "flex", alignItems: "center", height: '100%', borderRadius: 2 }}>
            {icon}
            <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
                <Typography variant="h6">{value}</Typography>
            </Box>
        </Paper>
    </Grid>
));

const RecentRequests = React.memo(({ requests }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredRequests = useMemo(() =>
        requests.filter((req) =>
            req.user.toLowerCase().includes(searchQuery.toLowerCase())
        ), [requests, searchQuery]
    );

    // Added basic sorting example for robustness (sort by date descending)
    const sortedRequests = useMemo(() =>
        [...filteredRequests].sort((a, b) => new Date(b.date) - new Date(a.date)),
        [filteredRequests]
    );

    return (
        <Paper elevation={1} sx={{ p: 2, mt: 3, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} md={8}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search requests by user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                        sx={{ borderRadius: 2 }}
                    />
                </Grid>
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Button variant="contained" startIcon={<AddCircleOutline />}>
                        New Cleaning Request
                    </Button>
                </Grid>
            </Grid>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Progress</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedRequests.map((req) => (
                            <TableRow hover key={req.id}>
                                <TableCell>{req.id}</TableCell>
                                <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ width: 30, height: 30, mr: 1.5, bgcolor: 'primary.light' }}>
                                        {req.user.charAt(0)}
                                    </Avatar>
                                    {req.user}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {req.status === "Completed" && <CheckCircle color="success" fontSize="small" />}
                                        {req.status === "Pending" && <ErrorIcon color="warning" fontSize="small" />}
                                        {req.status === "In Progress" && <InfoIcon color="info" fontSize="small" />}
                                        <Typography variant="body2">{req.status}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{req.date}</TableCell>
                                <TableCell sx={{ minWidth: 150 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={req.progress}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: 'grey.300',
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: req.progress === 100 ? 'success.main' : 'primary.main',
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ minWidth: 35 }}>
                                            <Typography variant="body2" color="text.secondary">{`${req.progress}%`}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
});

// --- MAIN DASHBOARD COMPONENT ---

function Dashboard() {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [userAnchorEl, setUserAnchorEl] = useState(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);

    const handleDrawerToggle = useCallback(() => setDrawerOpen((prev) => !prev), []);
    const handleUserMenuOpen = (e) => setUserAnchorEl(e.currentTarget);
    const handleUserMenuClose = () => setUserAnchorEl(null);
    const handleNotifMenuOpen = (e) => setNotifAnchorEl(e.currentTarget);
    const handleNotifMenuClose = () => setNotifAnchorEl(null);

    const getNotifIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle color="success" sx={{ mr: 1 }} />;
            case 'error': return <ErrorIcon color="error" sx={{ mr: 1 }} />;
            default: return <InfoIcon color="info" sx={{ mr: 1 }} />;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Vision2Clean.ai
                        </Typography>
                        <Badge badgeContent={notifications.length} color="error" sx={{ mr: 2 }}>
                            <IconButton color="inherit" onClick={handleNotifMenuOpen}>
                                <NotificationsIcon />
                            </IconButton>
                        </Badge>
                        <IconButton color="inherit" onClick={handleUserMenuOpen}>
                            <AccountCircle />
                        </IconButton>
                        <Menu anchorEl={userAnchorEl} open={Boolean(userAnchorEl)} onClose={handleUserMenuClose}>
                            <MenuItem disabled>{user.name}</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleUserMenuClose}>Profile</MenuItem>
                            <MenuItem onClick={handleUserMenuClose}>Settings</MenuItem>
                            <MenuItem onClick={handleUserMenuClose}>
                                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
                            </MenuItem>
                        </Menu>
                        <Menu anchorEl={notifAnchorEl} open={Boolean(notifAnchorEl)} onClose={handleNotifMenuClose}>
                            {notifications.map((notif) => (
                                <MenuItem key={notif.id} onClick={handleNotifMenuClose}>
                                    {getNotifIcon(notif.type)}
                                    {notif.message}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerOpen ? drawerWidth : miniDrawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {
                            width: drawerOpen ? drawerWidth : miniDrawerWidth,
                            boxSizing: "border-box",
                            transition: (theme) => theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        },
                    }}
                >
                    <Toolbar />
                    <Box sx={{ overflow: "auto" }}>
                        <List>
                            {[
                                { text: 'Dashboard', icon: <DashboardIcon />, selected: true },
                                { text: 'Analytics', icon: <AssessmentIcon /> },
                                { text: 'Settings', icon: <SettingsIcon /> },
                            ].map(({ text, icon, selected }) => (
                                <Tooltip key={text} title={!drawerOpen ? text : ''} placement="right">
                                    <ListItemButton selected={selected}>
                                        <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>
                                        <ListItemText
                                            primary={text}
                                            sx={{
                                                opacity: drawerOpen ? 1 : 0,
                                                transition: (theme) => theme.transitions.create('opacity', {
                                                    easing: theme.transitions.easing.sharp,
                                                    duration: theme.transitions.duration.enteringScreen,
                                                }),
                                            }}
                                        />
                                    </ListItemButton>
                                </Tooltip>
                            ))}
                        </List>
                    </Box>
                </Drawer>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        transition: (theme) => theme.transitions.create(['width', 'margin'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                        marginLeft: `${drawerOpen ? drawerWidth : miniDrawerWidth}px`,
                        width: `calc(100% - ${drawerOpen ? drawerWidth : miniDrawerWidth}px)`,
                    }}
                >
                    <Toolbar />
                    <Grid container spacing={3}>
                        {stats.map((stat) => (
                            <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
                        ))}
                    </Grid>
                    <RecentRequests requests={recentRequests} />
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default Dashboard;