import React, { useState } from 'react'
import AppBar     from '@mui/material/AppBar';
import Box        from '@mui/material/Box';
import Toolbar    from '@mui/material/Toolbar';
import Button     from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar     from '@mui/material/Avatar';
import Menu       from '@mui/material/Menu';
import MenuItem   from '@mui/material/MenuItem';
import Divider    from '@mui/material/Divider';
import Dialog     from '@mui/material/Dialog';
import DialogTitle    from '@mui/material/DialogTitle';
import DialogContent  from '@mui/material/DialogContent';
import DialogActions  from '@mui/material/DialogActions';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosinterceptor';
import { useToast }  from '../utils/Toast';

// ── Delete Account confirmation dialog ───────────────────────────
const DeleteAccountDialog = ({ open, onClose }) => {
    const showToast = useToast();
    const userId    = localStorage.getItem('userId');
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await axiosInstance.delete(`/user/${userId}`);
            showToast('Account deleted. Goodbye!');
            setTimeout(() => {
                localStorage.clear();
                window.location.href = '/';
            }, 1200);
        } catch (err) {
            showToast(err.response?.data?.message || 'Delete failed', 'error');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700, color: '#111827' }}>Delete Account</DialogTitle>
            <DialogContent>
                <Typography sx={{ color: '#6b7280', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    This will permanently delete your account, mentor profile, and all associated sessions.
                    <strong style={{ color: '#dc2626' }}> This action cannot be undone.</strong>
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: '#6b7280', borderRadius: '10px' }}>Cancel</Button>
                <Button
                    onClick={handleDelete}
                    disabled={loading}
                    variant="contained"
                    sx={{ backgroundColor: '#dc2626', borderRadius: '10px', '&:hover': { backgroundColor: '#b91c1c' } }}
                >
                    {loading ? 'Deleting...' : 'Yes, delete my account'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


// ── Main Navbar ───────────────────────────────────────────────────
const Navbar = ({ onEditProfile }) => {
    const token    = localStorage.getItem('token');
    const username = localStorage.getItem('username') || '';
    const role     = localStorage.getItem('role')     || '';
    const photoUrl = localStorage.getItem('photoUrl') || ''; // ready for future photo upload

    const navigate = useNavigate();
    const location = useLocation();

    const [anchorEl,      setAnchorEl]      = useState(null);
    const [deleteOpen,    setDeleteOpen]    = useState(false);

    const menuOpen = Boolean(anchorEl);

    // First letter uppercase for initials — graceful fallback
    const initials = username
        ? username.slice(0, 2).toUpperCase()
        : '?';

    const handleLogout = () => {
        setAnchorEl(null);
        localStorage.clear();
        navigate('/');
    };

    const showGetStarted = !token && location.pathname !== '/dashboard';

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #f3f4f6',
                    color: '#111827',
                    zIndex: 1200,
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 6 }, minHeight: '64px !important' }}>

                    {/* Wordmark */}
                    <Typography
                        component={Link}
                        to="/"
                        sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#111827', textDecoration: 'none', letterSpacing: '-0.02em' }}
                    >
                        Mentii
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Logged out state */}
                        {!token && (
                            <Button
                                component={Link} to="/login"
                                variant="text"
                                sx={{ color: '#6b7280', fontWeight: 500 }}
                            >
                                Log in
                            </Button>
                        )}
                        {showGetStarted && (
                            <Button
                                component={Link} to="/register"
                                variant="contained"
                                sx={{ backgroundColor: '#111827', borderRadius: '999px', px: 3, '&:hover': { backgroundColor: '#1f2937' } }}
                            >
                                Get Started Today
                            </Button>
                        )}

                        {/* Logged in — Avatar + dropdown */}
                        {token && (
                            <>
                                {/* Profile Avatar — photo-ready: uses src if photoUrl exists, falls back to initials */}
                                <Avatar
                                    src={photoUrl || undefined}
                                    onClick={(e) => setAnchorEl(e.currentTarget)}
                                    sx={{
                                        width: 38, height: 38,
                                        backgroundColor: '#111827',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        border: '2px solid #e5e7eb',
                                        transition: 'border-color 0.15s',
                                        '&:hover': { borderColor: '#9ca3af' }
                                    }}
                                >
                                    {!photoUrl && initials}
                                </Avatar>

                                <Menu
                                    anchorEl={anchorEl}
                                    open={menuOpen}
                                    onClose={() => setAnchorEl(null)}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    PaperProps={{
                                        elevation: 0,
                                        sx: {
                                            mt: 1.5,
                                            borderRadius: '14px',
                                            border: '1px solid #f3f4f6',
                                            boxShadow: '0px 8px 32px rgba(0,0,0,0.10)',
                                            minWidth: 200,
                                            overflow: 'visible',
                                        }
                                    }}
                                >
                                    {/* User info header */}
                                    <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                            <Avatar
                                                src={photoUrl || undefined}
                                                sx={{ width: 32, height: 32, backgroundColor: '#111827', fontSize: '0.75rem', fontWeight: 700 }}
                                            >
                                                {!photoUrl && initials}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.88rem', lineHeight: 1.2 }}>
                                                    {username}
                                                </Typography>
                                                <Typography sx={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'capitalize' }}>
                                                    {role}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ borderColor: '#f3f4f6' }} />

                                    <MenuItem
                                        onClick={() => { setAnchorEl(null); navigate('/dashboard'); }}
                                        sx={{ fontSize: '0.88rem', color: '#111827', py: 1.3, px: 2.5, mx: 0.5, borderRadius: '8px', mt: 0.5, '&:hover': { backgroundColor: '#f9fafb' } }}
                                    >
                                        Dashboard
                                    </MenuItem>

                                    <MenuItem
                                        onClick={() => { setAnchorEl(null); if (onEditProfile) onEditProfile(); }}
                                        sx={{ fontSize: '0.88rem', color: '#111827', py: 1.3, px: 2.5, mx: 0.5, borderRadius: '8px', '&:hover': { backgroundColor: '#f9fafb' } }}
                                    >
                                        Edit Profile
                                    </MenuItem>

                                    <Divider sx={{ borderColor: '#f3f4f6', my: 0.5 }} />

                                    {/* Delete Account — clearly red, in the dropdown */}
                                    <MenuItem
                                        onClick={() => { setAnchorEl(null); setDeleteOpen(true); }}
                                        sx={{ fontSize: '0.88rem', color: '#dc2626', py: 1.3, px: 2.5, mx: 0.5, borderRadius: '8px', '&:hover': { backgroundColor: '#fff5f5' } }}
                                    >
                                        Delete Account
                                    </MenuItem>

                                    <Divider sx={{ borderColor: '#f3f4f6', my: 0.5 }} />

                                    <MenuItem
                                        onClick={handleLogout}
                                        sx={{ fontSize: '0.88rem', color: '#6b7280', py: 1.3, px: 2.5, mx: 0.5, borderRadius: '8px', mb: 0.5, '&:hover': { backgroundColor: '#f9fafb' } }}
                                    >
                                        Log out
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <DeleteAccountDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />
        </>
    );
};

export default Navbar;