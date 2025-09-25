import React, { useState, useMemo, useCallback } from "react";
import {
    AppBar, Avatar, Box, Button, CssBaseline, Divider, Drawer, Grid, IconButton,
    LinearProgress, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
    Toolbar, Tooltip, Typography
} from "@mui/material";
import {
    AccountCircle, AddCircleOutline, Assessment as AssessmentIcon, CheckCircle,
    Dashboard as DashboardIcon, Error as ErrorIcon, Info as InfoIcon, Logout as LogoutIcon,
    Menu as MenuIcon, Notifications as NotificationsIcon, Search as SearchIcon,
    Settings as SettingsIcon
} from "@mui/icons-material";


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
];

const drawerWidth = 50;

// --- REUSABLE COMPONENTS ---

const StatCard = React.memo(({ icon, label, value }) => (
    <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={3} sx={{ p: 2, display: "flex", alignItems: "center", height: '100%' }}>
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

    const filteredRequests = useMemo(() => // Memoizes the filtered results to avoid re-calculating on every render.
        requests.filter((req) =>
            req.user.toLowerCase().includes(searchQuery.toLowerCase())
        ), [requests, searchQuery]
    );

    return (
        <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
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
                        {filteredRequests.map((req) => (
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
                                            <LinearProgress variant="determinate" value={req.progress} sx={{ height: 8, borderRadius: 4 }} />
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
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = useCallback(() => setDrawerOpen(prev => !prev), []);
    const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    return (
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
                    <IconButton color="inherit" onClick={handleMenuOpen}>
                        <AccountCircle />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                        <MenuItem disabled>{user.name}</MenuItem>
                        <Divider />
                        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                        <MenuItem onClick={handleMenuClose}>
                            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="persistent"
                open={drawerOpen}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: "auto" }}>
                    <List>
                        <ListItemButton selected>
                            <ListItemIcon><DashboardIcon /></ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemIcon><AssessmentIcon /></ListItemIcon>
                            <ListItemText primary="Analytics" />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemIcon><SettingsIcon /></ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItemButton>
                    </List>
                </Box>
            </Drawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: drawerOpen ? 0 : `-${drawerWidth}px`,
                    transition: (theme) => theme.transitions.create('margin', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    ...(!drawerOpen && {
                        transition: (theme) => theme.transitions.create('margin', {
                            easing: theme.transitions.easing.easeOut,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        marginLeft: 0,
                    }),
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
    );
}

export default Dashboard;