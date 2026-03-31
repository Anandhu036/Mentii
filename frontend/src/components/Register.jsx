import React, { useState } from 'react'
import axiosInstance from '../axiosinterceptor';
import { useNavigate, Link } from 'react-router-dom'
import Box            from '@mui/material/Box';
import Button         from '@mui/material/Button';
import TextField      from '@mui/material/TextField';
import Typography     from '@mui/material/Typography';
import Paper          from '@mui/material/Paper';
import Select         from '@mui/material/Select';
import MenuItem       from '@mui/material/MenuItem';
import InputLabel     from '@mui/material/InputLabel';
import FormControl    from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput  from '@mui/material/OutlinedInput';
import Chip           from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import { useToast }   from '../utils/Toast';

const FIELD_OPTIONS     = ['Engineering', 'Design', 'Product', 'Marketing', 'Data Science', 'AI', 'Sales', 'Finance', 'Operations', 'Other'];
const EXP_LEVELS        = ['Entry Level', 'Intermediate', 'Senior', 'Lead', 'Manager', 'Director', 'Founder'];
const EXPERTISE_OPTIONS = ['AI', 'Design', 'Engineering', 'Product', 'Marketing', 'Data Science', 'Sales', 'Finance', 'Operations', 'Leadership', 'Other'];
const SPECIFIC_OPT      = ['Career Pivot', 'Portfolio Review', 'Scalability', 'Public Speaking', 'Team Management'];
const TOOLS_OPTIONS     = ['React', 'Figma', 'Node.js', 'Python', 'AWS', 'Docker', 'Git', 'Sketch', 'Adobe XD', 'Jira', 'MongoDB', 'TypeScript', 'Postman', 'Tableau', 'Kubernetes'];

const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN_REGEX = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

const fieldSx  = (err) => ({ '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: err ? '#fff5f5' : '#f9fafb' } });
const selectSx = { borderRadius: '12px', backgroundColor: '#f9fafb' };

const TOTAL = 3;

const Register = () => {
    const navigate  = useNavigate();
    const showToast = useToast();

    const [step,     setStep]     = useState(1);
    const [errors,   setErrors]   = useState({});
    const [bioState, setBioState] = useState('idle'); // 'idle' | 'loading' | 'done'
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        username: '', email: '', password: '', role: 'mentee',
        country: '', title: '', company: '',
        fieldOfWork: '', experienceLevel: '', bio: '',
        primaryExpertise: '', secondaryExpertise: '',
        specificExpertise: [], yearsOfExperience: '',
        linkedInUrl: '', skills: '', tools: [],
    });

    const set = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        setErrors(p => ({ ...p, [name]: '' }));
    };

    // ── Per-step validation ──────────────────────────────────────
    const validate = () => {
        const e = {};
        if (step === 1) {
            if (!form.username.trim())              e.username = 'Username is required';
            if (!form.email.trim())                 e.email    = 'Email is required';
            else if (!EMAIL_REGEX.test(form.email)) e.email    = 'Please enter a valid email address';
            if (!form.password)                     e.password = 'Password is required';
            else if (form.password.length < 6)      e.password = 'Password must be at least 6 characters';
        }
        if (step === 2) {
            if (!form.title.trim())   e.title   = 'Your title is required';
            if (!form.company.trim()) e.company = 'Company or School is required';
            if (!form.country.trim()) e.country = 'Country is required';
        }
        if (step === 3 && form.role === 'mentee') {
            if (!form.fieldOfWork)     e.fieldOfWork     = 'Please select your field of work';
            if (!form.experienceLevel) e.experienceLevel = 'Please select your experience level';
        }
        if (step === 3 && form.role === 'mentor') {
            if (!form.primaryExpertise)                  e.primaryExpertise  = 'Primary expertise is required';
            if (!form.yearsOfExperience)                 e.yearsOfExperience = 'Years of experience is required';
            if (!form.linkedInUrl.trim())                e.linkedInUrl = 'LinkedIn URL is required';
            else if (!LINKEDIN_REGEX.test(form.linkedInUrl)) e.linkedInUrl = 'Please enter a valid LinkedIn URL';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleContinue = () => { if (validate()) setStep(s => s + 1); };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            await axiosInstance.post('/user/register', form);
            showToast('Account created! Please log in.');
            navigate('/login');
        } catch (err) {
            console.log(err);
            showToast(err.response?.data?.message || 'Registration failed', 'error');
        }
        setSubmitting(false);
    };

    // ── AI Bio Enhancer ──────────────────────────────────────────
    const enhanceBio = async () => {
        if (!form.title || !form.company) {
            showToast('Please fill in your Title and Company first', 'error');
            return;
        }
        setBioState('loading');
        try {
            
            const res = await axiosInstance.post('/ai/enhance-bio', {
                title:           form.title,
                company:         form.company,
                fieldOfWork:     form.fieldOfWork     || form.primaryExpertise,
                experienceLevel: form.experienceLevel || `${form.yearsOfExperience} years`,
                skills:          form.skills          || form.specificExpertise.join(', '),
            });
            setForm(p => ({ ...p, bio: res.data.bio }));
            setBioState('done');
            showToast('Bio enhanced by AI ✨');
        } catch (err) {
            console.log('AI Error:', err.response?.data || err.message);
            const status = err.response?.status;
            if (status === 429) {
                showToast('AI is busy. Please wait a moment and try again.', 'error');
            } else {
                showToast('Could not enhance bio. Check your backend is running.', 'error');
            }
            setBioState('idle');
        }
    };

    const progress = (step / TOTAL) * 100;

    // ── Bio field with AI button — used in both mentee + mentor step 3
    const BioField = ({ rows = 4, placeholder }) => (
        <Box sx={{ position: 'relative' }}>
            <TextField
                label="Everyone has a story, what's yours?"
                name="bio" value={form.bio} onChange={set}
                multiline rows={rows} fullWidth
                placeholder={placeholder}
                sx={fieldSx(false)}
            />
            <Button
                onClick={enhanceBio}
                disabled={bioState === 'loading' || !form.title || !form.company}
                size="small"
                sx={{
                    position: 'absolute', bottom: 10, right: 10,
                    fontSize: '0.72rem', color: bioState === 'done' ? '#059669' : '#6b7280',
                    borderRadius: '8px', px: 1.5,
                    '&:hover': { backgroundColor: '#f3f4f6' }
                }}
            >
                {bioState === 'loading'
                    ? <><CircularProgress size={10} sx={{ mr: 0.5 }} />Enhancing...</>
                    : bioState === 'done'
                        ? '✨ Bio Enhanced'
                        : '✨ Enhance Bio'
                }
            </Button>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 4, backgroundColor: '#f3f4f6', '& .MuiLinearProgress-bar': { backgroundColor: '#111827' } }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 4px)', px: 2, py: 6 }}>
                <Paper elevation={0} sx={{ width: '100%', maxWidth: 500, border: '1px solid #e5e7eb', borderRadius: '16px', p: { xs: 3, sm: 5 } }}>

                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1 }}>
                        Step {step} of {TOTAL}
                    </Typography>

                    {/* ══ STEP 1 — Account ══ */}
                    {step === 1 && (
                        <>
                            <Typography variant='h5' sx={{ fontWeight: 800, color: '#111827', mb: 0.5, letterSpacing: '-0.02em' }}>Start your journey.</Typography>
                            <Typography sx={{ color: '#6b7280', mb: 4, fontSize: '0.92rem' }}>Create your Mentii account.</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField label="Username *" name="username" value={form.username} onChange={set} fullWidth error={!!errors.username} helperText={errors.username} sx={fieldSx(errors.username)} />
                                <TextField label="Email *"    name="email"    value={form.email}    onChange={set} fullWidth error={!!errors.email}    helperText={errors.email}    sx={fieldSx(errors.email)} type="email" />
                                <TextField label="Password *" name="password" value={form.password} onChange={set} fullWidth error={!!errors.password} helperText={errors.password || 'Min 6 characters'} sx={fieldSx(errors.password)} type="password" />
                                <FormControl fullWidth>
                                    <InputLabel>I am joining as...</InputLabel>
                                    <Select name="role" value={form.role} label="I am joining as..." onChange={set} sx={selectSx}>
                                        <MenuItem value="mentee">Mentee — I want to learn and grow</MenuItem>
                                        <MenuItem value="mentor">Mentor — I want to give back</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </>
                    )}

                    {/* ══ STEP 2 — Basics ══ */}
                    {step === 2 && (
                        <>
                            <Typography variant='h5' sx={{ fontWeight: 800, color: '#111827', mb: 0.5, letterSpacing: '-0.02em' }}>What do you do as a professional?</Typography>
                            <Typography sx={{ color: '#6b7280', mb: 4, fontSize: '0.92rem' }}>Tell us a little about yourself.</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField label="Your title *" name="title" value={form.title} onChange={set} fullWidth placeholder="e.g. Product Designer, Engineer" error={!!errors.title} helperText={errors.title} sx={fieldSx(errors.title)} />
                                <TextField label="Company / School *" name="company" value={form.company} onChange={set} fullWidth placeholder="e.g. Apple, IIT Bombay" error={!!errors.company} helperText={errors.company} sx={fieldSx(errors.company)} />
                                <TextField label="Country *" name="country" value={form.country} onChange={set} fullWidth placeholder="e.g. India" error={!!errors.country} helperText={errors.country} sx={fieldSx(errors.country)} />
                            </Box>
                        </>
                    )}

                    {/* ══ STEP 3 — MENTEE ══ */}
                    {step === 3 && form.role === 'mentee' && (
                        <>
                            <Typography variant='h5' sx={{ fontWeight: 800, color: '#111827', mb: 0.5, letterSpacing: '-0.02em' }}>Awesome, what's your superpower?</Typography>
                            <Typography sx={{ color: '#6b7280', mb: 4, fontSize: '0.92rem' }}>Help us match you with the right mentors.</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <FormControl fullWidth error={!!errors.fieldOfWork}>
                                    <InputLabel>Field of work *</InputLabel>
                                    <Select name="fieldOfWork" value={form.fieldOfWork} label="Field of work *" onChange={set} sx={selectSx}>
                                        {FIELD_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                    </Select>
                                    {errors.fieldOfWork && <FormHelperText>{errors.fieldOfWork}</FormHelperText>}
                                </FormControl>

                                <FormControl fullWidth error={!!errors.experienceLevel}>
                                    <InputLabel>Level of experience *</InputLabel>
                                    <Select name="experienceLevel" value={form.experienceLevel} label="Level of experience *" onChange={set} sx={selectSx}>
                                        {EXP_LEVELS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                    </Select>
                                    {errors.experienceLevel && <FormHelperText>{errors.experienceLevel}</FormHelperText>}
                                </FormControl>

                                <BioField placeholder="Share your goals and aspirations..." />
                            </Box>
                        </>
                    )}

                    {/* ══ STEP 3 — MENTOR ══ */}
                    {step === 3 && form.role === 'mentor' && (
                        <>
                            <Typography variant='h5' sx={{ fontWeight: 800, color: '#111827', mb: 0.5, letterSpacing: '-0.02em' }}>Great! What's your superpower?</Typography>
                            <Typography sx={{ color: '#6b7280', mb: 4, fontSize: '0.92rem' }}>Help mentees understand your expertise.</Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <FormControl fullWidth error={!!errors.primaryExpertise}>
                                    <InputLabel>Primary expertise *</InputLabel>
                                    <Select name="primaryExpertise" value={form.primaryExpertise} label="Primary expertise *" onChange={set} sx={selectSx}>
                                        {EXPERTISE_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                    </Select>
                                    {errors.primaryExpertise && <FormHelperText>{errors.primaryExpertise}</FormHelperText>}
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Secondary expertise</InputLabel>
                                    <Select name="secondaryExpertise" value={form.secondaryExpertise} label="Secondary expertise" onChange={set} sx={selectSx}>
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        {EXPERTISE_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Specific areas</InputLabel>
                                    <Select multiple value={form.specificExpertise}
                                        onChange={(e) => setForm(p => ({ ...p, specificExpertise: e.target.value }))}
                                        input={<OutlinedInput label="Specific areas" sx={{ borderRadius: '12px', backgroundColor: '#f9fafb' }} />}
                                        renderValue={(sel) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {sel.map(v => <Chip key={v} label={v} size="small" sx={{ backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 600, fontSize: '0.7rem' }} />)}
                                            </Box>
                                        )}
                                    >
                                        {SPECIFIC_OPT.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                    </Select>
                                    <FormHelperText>e.g. Career Pivot, Public Speaking</FormHelperText>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Tools you are an expert in</InputLabel>
                                    <Select multiple value={form.tools}
                                        onChange={(e) => setForm(p => ({ ...p, tools: e.target.value }))}
                                        input={<OutlinedInput label="Tools you are an expert in" sx={{ borderRadius: '12px', backgroundColor: '#f9fafb' }} />}
                                        renderValue={(sel) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {sel.map(v => <Chip key={v} label={v} size="small" sx={{ backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 600, fontSize: '0.7rem' }} />)}
                                            </Box>
                                        )}
                                    >
                                        {TOOLS_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Years of experience *" name="yearsOfExperience" type="number"
                                    value={form.yearsOfExperience} onChange={set} fullWidth
                                    error={!!errors.yearsOfExperience} helperText={errors.yearsOfExperience}
                                    inputProps={{ min: 0, max: 50 }} sx={fieldSx(errors.yearsOfExperience)}
                                />
                                <TextField
                                    label="LinkedIn URL *" name="linkedInUrl"
                                    placeholder="linkedin.com/in/yourname"
                                    value={form.linkedInUrl} onChange={set} fullWidth
                                    error={!!errors.linkedInUrl} helperText={errors.linkedInUrl || 'Used for identity verification'}
                                    sx={fieldSx(errors.linkedInUrl)}
                                />
                                <TextField
                                    label="Key skills (comma-separated)" name="skills"
                                    placeholder="e.g. Leadership, System Design"
                                    value={form.skills} onChange={set} fullWidth sx={fieldSx(false)}
                                />

                                <BioField rows={3} placeholder="Tell mentees how you can help them..." />
                            </Box>
                        </>
                    )}

                    {/* Navigation buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
                        {step > 1
                            ? <Button onClick={() => setStep(s => s - 1)} variant="text" sx={{ color: '#6b7280' }}>← Back</Button>
                            : <Box />
                        }
                        {step < TOTAL
                            ? <Button onClick={handleContinue} variant="contained" sx={{ backgroundColor: '#111827', borderRadius: '12px', px: 5, py: 1.3, '&:hover': { backgroundColor: '#1f2937' } }}>Continue</Button>
                            : <Button onClick={handleSubmit} disabled={submitting} variant="contained" sx={{ backgroundColor: '#111827', borderRadius: '12px', px: 4, py: 1.3, '&:hover': { backgroundColor: '#1f2937' } }}>
                                {submitting ? 'Creating account...' : 'Complete Profile'}
                              </Button>
                        }
                    </Box>

                    {step === 1 && (
                        <Typography sx={{ mt: 3, textAlign: 'center', color: '#6b7280', fontSize: '0.88rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#111827', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
                        </Typography>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default Register;