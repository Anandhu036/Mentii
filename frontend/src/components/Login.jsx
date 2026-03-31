import React, { useState } from 'react'
import axiosInstance from '../axiosinterceptor';
import { useNavigate, Link } from 'react-router-dom'
import Box        from '@mui/material/Box';
import Button     from '@mui/material/Button';
import TextField  from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper      from '@mui/material/Paper';
import { useToast } from '../utils/Toast';

const Login = () => {
    const navigate   = useNavigate();
    const showToast  = useToast();
    const [inputs, setInputs] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosInstance.post('/user/login', inputs);
            if (res.data.usertoken) {
                localStorage.setItem('token',    res.data.usertoken);
                localStorage.setItem('role',     res.data.role);
                localStorage.setItem('userId',   res.data.userId);
                localStorage.setItem('username', res.data.username); // ← fixed: was missing
                showToast(`Welcome back, ${res.data.username}!`);
                setTimeout(() => navigate('/dashboard'), 500);
            }
        } catch (err) {
            console.log(err);
            showToast(err.response?.data?.message || 'Login failed', 'error');
        }
        setLoading(false);
    };

    const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f9fafb' } };

    return (
        <Box sx={{ minHeight: '90vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
            <Paper
                elevation={0}
                sx={{ width: '100%', maxWidth: 420, border: '1px solid #e5e7eb', borderRadius: '16px', p: { xs: 3, sm: 5 } }}
            >
                <Typography variant='h5' sx={{ fontWeight: 800, color: '#111827', mb: 0.5, letterSpacing: '-0.02em' }}>
                    Welcome back to Mentii
                </Typography>
                <Typography sx={{ color: '#6b7280', mb: 4, fontSize: '0.92rem' }}>
                    Sign in to continue your journey.
                </Typography>

                <Box component='form' onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField label="Email"    name="email"    type="email"    value={inputs.email}    onChange={handleChange} required fullWidth sx={fieldSx} />
                    <TextField label="Password" name="password" type="password" value={inputs.password} onChange={handleChange} required fullWidth sx={fieldSx} />

                    <Button
                        type='submit'
                        variant='contained'
                        fullWidth
                        size='large'
                        disabled={loading}
                        sx={{
                            mt: 0.5, py: 1.4,
                            borderRadius: '12px',
                            backgroundColor: '#111827',
                            fontSize: '1rem',
                            '&:hover': { backgroundColor: '#1f2937' }
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </Box>

                <Typography sx={{ mt: 3, textAlign: 'center', color: '#6b7280', fontSize: '0.88rem' }}>
                    Don't have an account?{' '}
                    <Link to='/register' style={{ color: '#111827', fontWeight: 600, textDecoration: 'none' }}>
                        Get started today
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
};

export default Login;