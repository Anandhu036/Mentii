import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box          from '@mui/material/Box';
import Typography   from '@mui/material/Typography';
import Paper        from '@mui/material/Paper';
import Button       from '@mui/material/Button';
import Grid         from '@mui/material/Grid';
import Card         from '@mui/material/Card';
import CardContent  from '@mui/material/CardContent';
import Autocomplete from '@mui/material/Autocomplete';
import TextField    from '@mui/material/TextField';
import SearchIcon   from '@mui/icons-material/Search';

const SEARCH_OPTIONS = [
    'No/Low Code', 'Product Research', 'Sales/BD', 'Talent Acquisition',
    'AI', 'Content Creator', 'Data Science', 'Design', 'Engineering', 'Marketing'
];

const MENTEE_FEATURES = [
    { icon: '🎯', title: 'Book free 1-on-1 sessions',  desc: "Find a mentor in your field and book a real conversation. No sprints, no pressure — just real help from people who've been there." },
    { icon: '🔍', title: 'Browse verified mentors',     desc: 'Every mentor is manually reviewed. Search by role, expertise or company to find someone who matches your goals.' },
    { icon: '📈', title: 'Grow at your own pace',       desc: 'Set your goals, book sessions when you need them, and build your own growth journey with the mentors who inspire you.' },
];

const MENTOR_FEATURES = [
    { icon: '🤝', title: 'Give back to the community', desc: 'Share what took you years to learn. Help the next generation of professionals navigate their careers faster.' },
    { icon: '📅', title: 'Set your own schedule',      desc: 'Open availability slots when it suits you. You decide when and how often you mentor — completely on your terms.' },
    { icon: '🌟', title: 'Build your reputation',      desc: 'Get reviews after each session and build a public profile that showcases your expertise and impact.' },
];

const Home = () => {
    const navigate = useNavigate();
    const [audience, setAudience] = useState('mentee');
    const features = audience === 'mentee' ? MENTEE_FEATURES : MENTOR_FEATURES;

    return (
        <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

            {/* ── HERO — typography only, no search bar ── */}
            <Box sx={{ pt: { xs: 8, md: 14 }, pb: { xs: 6, md: 8 }, px: 3, textAlign: 'center' }}>
                <Typography
                    variant='h2'
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: '2.2rem', md: '3.6rem' },
                        color: '#111827',
                        lineHeight: 1.12,
                        letterSpacing: '-0.03em',
                        mb: 2.5,
                    }}
                >
                    Find a mentor.<br />
                    <span style={{ color: '#6b7280' }}>Grow your career.</span>
                </Typography>

                <Typography sx={{ color: '#6b7280', fontSize: '1.1rem', maxWidth: 480, mx: 'auto', lineHeight: 1.7, fontWeight: 300 }}>
                    Become the best version of yourself by accessing the perspectives and life experiences of others who've been there, done that.
                </Typography>
            </Box>

            {/* ── DIVIDER ── */}
            <Box sx={{ borderTop: '1px solid #f3f4f6' }} />

            {/* ── AUDIENCE TOGGLE + CONTENT ── */}
            <Box sx={{ py: { xs: 8, md: 12 }, px: 3, maxWidth: 1080, mx: 'auto' }}>

                {/* Toggle buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 8 }}>
                    {[{ key: 'mentee', label: 'For Mentees' }, { key: 'mentor', label: 'For Mentors' }].map(({ key, label }) => (
                        <Button
                            key={key}
                            onClick={() => setAudience(key)}
                            variant={audience === key ? 'contained' : 'outlined'}
                            sx={{
                                borderRadius: '999px',
                                px: 4,
                                py: 1.2,
                                fontSize: '0.95rem',
                                ...(audience === key
                                    ? { backgroundColor: '#111827', color: '#fff', '&:hover': { backgroundColor: '#1f2937' } }
                                    : { borderColor: '#e5e7eb', color: '#6b7280', '&:hover': { borderColor: '#111827', color: '#111827' } }
                                )
                            }}
                        >
                            {label}
                        </Button>
                    ))}
                </Box>

                {/* Dynamic heading + description */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant='h4' sx={{ fontWeight: 800, color: '#111827', mb: 1.5, letterSpacing: '-0.025em', fontSize: { xs: '1.7rem', md: '2.2rem' } }}>
                        {audience === 'mentee'
                            ? "Learn from people who've been there."
                            : 'Share your knowledge. Make an impact.'
                        }
                    </Typography>
                    <Typography sx={{ color: '#6b7280', maxWidth: 480, mx: 'auto', lineHeight: 1.7, fontWeight: 300 }}>
                        {audience === 'mentee'
                            ? 'Book free 1-on-1 mentorship sessions with verified professionals in your field.'
                            : 'Set your own schedule, mentor aspiring professionals, and grow your network.'
                        }
                    </Typography>
                </Box>

                {/* Search bar — sits between heading and feature cards, mentee only */}
                {audience === 'mentee' && (
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            maxWidth: 580,
                            mx: 'auto',
                            mb: 7,
                            borderRadius: '999px',
                            border: '1.5px solid #e5e7eb',
                            px: 2.5,
                            py: 0.8,
                            backgroundColor: '#ffffff',
                        }}
                    >
                        <SearchIcon sx={{ color: '#9ca3af', mr: 1.5, flexShrink: 0 }} />

                        <Autocomplete
                            options={SEARCH_OPTIONS}
                            fullWidth
                            freeSolo
                            disableClearable
                            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/register') }}
                            onChange={(e, value) => { if (value) navigate('/register') }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="What do you want to get better at?"
                                    variant="standard"
                                    InputProps={{
                                        ...params.InputProps,
                                        disableUnderline: true,
                                        sx: { fontSize: '1rem', color: '#111827' }
                                    }}
                                />
                            )}
                            componentsProps={{
                                paper: {
                                    sx: {
                                        borderRadius: '12px',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0px 8px 24px rgba(0,0,0,0.08)',
                                        mt: 1,
                                    }
                                }
                            }}
                        />

                        <Button
                            onClick={() => navigate('/register')}
                            variant="contained"
                            sx={{
                                backgroundColor: '#111827',
                                borderRadius: '999px',
                                px: 3,
                                ml: 1,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                '&:hover': { backgroundColor: '#1f2937' }
                            }}
                        >
                            Search
                        </Button>
                    </Paper>
                )}

                {/* Feature cards */}
                <Grid container spacing={3}>
                    {features.map(f => (
                        <Grid size={{ xs: 12, md: 4 }} key={f.title}>
                            <Card sx={{
                                height: '100%',
                                border: '1px solid #f3f4f6',
                                transition: 'border-color 0.15s',
                                '&:hover': { borderColor: '#d1d5db' }
                            }}>
                                <CardContent sx={{ p: 3.5 }}>
                                    <Typography sx={{ fontSize: '1.8rem', mb: 2 }}>{f.icon}</Typography>
                                    <Typography variant='h6' sx={{ fontWeight: 700, mb: 1, color: '#111827', fontSize: '1rem' }}>
                                        {f.title}
                                    </Typography>
                                    <Typography sx={{ color: '#6b7280', lineHeight: 1.7, fontSize: '0.9rem', fontWeight: 300 }}>
                                        {f.desc}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* CTA */}
                <Box sx={{ textAlign: 'center', mt: 7 }}>
                    <Button
                        onClick={() => navigate('/register')}
                        variant='contained'
                        size='large'
                        sx={{
                            backgroundColor: '#111827',
                            borderRadius: '999px',
                            px: 5,
                            py: 1.5,
                            fontSize: '1rem',
                            '&:hover': { backgroundColor: '#1f2937' }
                        }}
                    >
                        {audience === 'mentee' ? 'Find my Mentor →' : 'Become a Mentor →'}
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default Home;