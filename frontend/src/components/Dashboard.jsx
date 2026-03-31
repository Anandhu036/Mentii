import React, { useEffect, useState, useCallback } from 'react'
import axiosInstance   from '../axiosinterceptor'
import { useToast }    from '../utils/Toast'
import MentorCard      from './MentorCard'
import SessionCard     from './SessionCard'
import Box             from '@mui/material/Box';
import Grid            from '@mui/material/Grid';
import Typography      from '@mui/material/Typography';
import Button          from '@mui/material/Button';
import Chip            from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert           from '@mui/material/Alert';
import Divider         from '@mui/material/Divider';
import Dialog          from '@mui/material/Dialog';
import DialogTitle     from '@mui/material/DialogTitle';
import DialogContent   from '@mui/material/DialogContent';
import DialogActions   from '@mui/material/DialogActions';
import TextField       from '@mui/material/TextField';
import Select          from '@mui/material/Select';
import MenuItem        from '@mui/material/MenuItem';
import InputLabel      from '@mui/material/InputLabel';
import FormControl     from '@mui/material/FormControl';
import OutlinedInput   from '@mui/material/OutlinedInput';
import IconButton      from '@mui/material/IconButton';

const FIELD_OPT     = ['Engineering', 'Design', 'Product', 'Marketing', 'Data Science', 'AI', 'Sales', 'Finance', 'Operations', 'Other'];
const EXP_OPT       = ['Entry Level', 'Intermediate', 'Senior', 'Lead', 'Manager', 'Director', 'Founder'];
const EXPERTISE_OPT = ['AI', 'Design', 'Engineering', 'Product', 'Marketing', 'Data Science', 'Sales', 'Finance', 'Operations', 'Leadership', 'Other'];
const TOOLS_OPT     = ['React', 'Figma', 'Node.js', 'Python', 'AWS', 'Docker', 'Git', 'Sketch', 'Adobe XD', 'Jira', 'MongoDB', 'TypeScript', 'Postman', 'Tableau', 'Kubernetes'];
const FILTER_OPT    = ['All', 'Engineering', 'Design', 'AI', 'Product', 'Marketing', 'Data Science', 'Sales', 'Leadership'];

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#f9fafb' } };


// ── Edit Profile Dialog (no Danger Zone — delete is in Navbar) ───
export const EditProfileDialog = ({ open, onClose, userId, role, onSaved }) => {
    const showToast = useToast();
    const [form, setForm] = useState({
        title: '', company: '', country: '', bio: '',
        fieldOfWork: '', experienceLevel: '',
        primaryExpertise: '', secondaryExpertise: '',
        yearsOfExperience: '', linkedInUrl: '',
        skills: '', tools: [],
    });

    useEffect(() => {
        if (!open) return;
        axiosInstance.get(`/user/profile/${userId}`)
            .then(res => {
                const u = res.data.user;
                setForm(p => ({ ...p,
                    title: u.title || '', company: u.company || '', country: u.country || '',
                    bio: u.bio || '', fieldOfWork: u.fieldOfWork || '', experienceLevel: u.experienceLevel || ''
                }));
            }).catch(console.error);

        if (role === 'mentor') {
            axiosInstance.get(`/mentor/profile/${userId}`)
                .then(res => {
                    const mp = res.data.profile;
                    setForm(p => ({ ...p,
                        primaryExpertise:   mp.primaryExpertise   || '',
                        secondaryExpertise: mp.secondaryExpertise || '',
                        yearsOfExperience:  mp.yearsOfExperience  || '',
                        linkedInUrl:        mp.linkedInUrl        || '',
                        skills: (mp.skills || []).join(', '),
                        tools:  mp.tools || [],
                    }));
                }).catch(console.error);
        }
    }, [open, userId, role]);

    const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const save = async () => {
        try {
            await axiosInstance.put(`/user/profile/${userId}`, {
                ...form,
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
            });
            showToast('Profile updated!');
            onClose();
            if (onSaved) onSaved();
        } catch (err) {
            showToast(err.response?.data?.message || 'Update failed', 'error');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 700, color: '#111827' }}>Edit Profile</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
                <TextField label="Title"   name="title"   value={form.title}   onChange={set} fullWidth sx={fieldSx} />
                <TextField label="Company" name="company" value={form.company} onChange={set} fullWidth sx={fieldSx} />
                <TextField label="Country" name="country" value={form.country} onChange={set} fullWidth sx={fieldSx} />
                <TextField label="Bio"     name="bio"     value={form.bio}     onChange={set} fullWidth multiline rows={3} sx={fieldSx} />

                {role === 'mentee' && (
                    <>
                        <FormControl fullWidth>
                            <InputLabel>Field of Work</InputLabel>
                            <Select name="fieldOfWork" value={form.fieldOfWork} label="Field of Work" onChange={set} sx={{ borderRadius: '10px' }}>
                                {FIELD_OPT.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Experience Level</InputLabel>
                            <Select name="experienceLevel" value={form.experienceLevel} label="Experience Level" onChange={set} sx={{ borderRadius: '10px' }}>
                                {EXP_OPT.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </>
                )}

                {role === 'mentor' && (
                    <>
                        <FormControl fullWidth>
                            <InputLabel>Primary Expertise</InputLabel>
                            <Select name="primaryExpertise" value={form.primaryExpertise} label="Primary Expertise" onChange={set} sx={{ borderRadius: '10px' }}>
                                {EXPERTISE_OPT.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField label="LinkedIn URL"          name="linkedInUrl"        value={form.linkedInUrl}        onChange={set} fullWidth sx={fieldSx} />
                        <TextField label="Years of Experience"   name="yearsOfExperience"  value={form.yearsOfExperience}  onChange={set} fullWidth type="number" sx={fieldSx} />
                        <TextField label="Skills (comma-separated)" name="skills"          value={form.skills}             onChange={set} fullWidth sx={fieldSx} />
                        <FormControl fullWidth>
                            <InputLabel>Tools</InputLabel>
                            <Select multiple value={form.tools}
                                onChange={(e) => setForm(p => ({ ...p, tools: e.target.value }))}
                                input={<OutlinedInput label="Tools" sx={{ borderRadius: '10px', backgroundColor: '#f9fafb' }} />}
                                renderValue={(sel) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {sel.map(v => <Chip key={v} label={v} size="small" sx={{ backgroundColor: '#f3f4f6', fontSize: '0.7rem' }} />)}
                                    </Box>
                                )}
                            >
                                {TOOLS_OPT.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: '#6b7280', borderRadius: '10px' }}>Cancel</Button>
                <Button onClick={save} variant="contained" sx={{ backgroundColor: '#111827', borderRadius: '10px', '&:hover': { backgroundColor: '#1f2937' } }}>
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};


// ── Availability Manager — mentor sets their open slots ──────────
const AvailabilityDialog = ({ open, onClose, userId }) => {
    const showToast  = useToast();
    const [slots,    setSlots]    = useState([]);
    const [newSlot,  setNewSlot]  = useState('');
    const [loading,  setLoading]  = useState(false);

    useEffect(() => {
        if (!open) return;
        axiosInstance.get(`/mentor/profile/${userId}`)
            .then(res => setSlots(res.data.profile?.availableSlots || []))
            .catch(console.error);
    }, [open, userId]);

    const addSlot = () => {
        const trimmed = newSlot.trim();
        if (!trimmed) return;
        if (slots.includes(trimmed)) { showToast('Slot already added', 'error'); return; }
        setSlots(p => [...p, trimmed]);
        setNewSlot('');
    };

    const removeSlot = (slot) => setSlots(p => p.filter(s => s !== slot));

    const save = async () => {
        setLoading(true);
        try {
            await axiosInstance.put(`/mentor/availability/${userId}`, { availableSlots: slots });
            showToast('Availability saved!');
            onClose();
        } catch (err) {
            showToast(err.response?.data?.message || 'Save failed', 'error');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700, color: '#111827' }}>Set Available Slots</DialogTitle>
            <DialogContent>
                <Typography sx={{ color: '#6b7280', fontSize: '0.85rem', mb: 2 }}>
                    Add time slots when you are available. Mentees will see these when booking.
                    e.g. "Monday 10:00 AM", "Wednesday 3:00 PM – 4:00 PM"
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        size="small" fullWidth
                        placeholder="e.g. Monday 10:00 AM"
                        value={newSlot}
                        onChange={(e) => setNewSlot(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSlot(); } }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                    <Button
                        onClick={addSlot}
                        variant="contained"
                        size="small"
                        sx={{ backgroundColor: '#111827', borderRadius: '8px', whiteSpace: 'nowrap', '&:hover': { backgroundColor: '#1f2937' } }}
                    >
                        + Add
                    </Button>
                </Box>

                {/* Current slots */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {slots.length === 0 && (
                        <Typography sx={{ color: '#9ca3af', fontSize: '0.82rem' }}>No slots added yet.</Typography>
                    )}
                    {slots.map(slot => (
                        <Chip
                            key={slot}
                            label={slot}
                            onDelete={() => removeSlot(slot)}
                            sx={{ backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 500, fontSize: '0.78rem' }}
                        />
                    ))}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: '#6b7280' }}>Cancel</Button>
                <Button onClick={save} disabled={loading} variant="contained" sx={{ backgroundColor: '#111827', borderRadius: '10px', '&:hover': { backgroundColor: '#1f2937' } }}>
                    {loading ? 'Saving...' : 'Save Availability'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


// ════════════════════════════════════════
// MENTEE DASHBOARD
// ════════════════════════════════════════
const MenteeDashboard = ({ userId, editProfileOpen, setEditProfileOpen }) => {
    const username = localStorage.getItem('username') || 'there';
    const [allMentors, setAllMentors] = useState([]);
    const [sessions,   setSessions]   = useState([]);
    const [filter,     setFilter]     = useState('All');
    const [loading,    setLoading]    = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        Promise.all([
            axiosInstance.get('/mentor/feed'),
            axiosInstance.get(`/session/my-sessions/${userId}`),
        ])
        .then(([mRes, sRes]) => {
            setAllMentors(mRes.data.mentors);
            setSessions(sRes.data.sessions);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [userId]);

    useEffect(() => { load(); }, [load]);

    const displayed = filter === 'All' ? allMentors : allMentors.filter(m => m.primaryExpertise === filter);
    const upcoming  = sessions.filter(s => s.status === 'scheduled');

    return (
        <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh', px: { xs: 2, md: 6 }, py: 5 }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>

                <Typography variant='h4' sx={{ fontWeight: 800, color: '#111827', mb: 0.5, letterSpacing: '-0.025em' }}>
                    Hi {username}, Welcome back! 👋
                </Typography>
                <Typography sx={{ color: '#6b7280', mb: 5 }}>Find your next mentor or manage your sessions.</Typography>

                {/* Upcoming sessions */}
                {upcoming.length > 0 && (
                    <Box sx={{ mb: 5 }}>
                        <Typography sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>Your Upcoming Sessions</Typography>
                        {upcoming.map(s => <SessionCard key={s._id} session={s} viewerRole="mentee" onUpdated={load} />)}
                        <Divider sx={{ mt: 4 }} />
                    </Box>
                )}

                {/* Mentor browse heading */}
                <Typography variant='h5' sx={{ fontWeight: 800, color: '#111827', mb: 0.5, letterSpacing: '-0.025em', mt: upcoming.length > 0 ? 4 : 0 }}>
                    Mentors for you
                </Typography>
                <Typography sx={{ color: '#6b7280', mb: 3 }}>Click a card to see the full profile and book a session.</Typography>

                {/* Filter chips */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                    {FILTER_OPT.map(opt => (
                        <Chip key={opt} label={opt} clickable onClick={() => setFilter(opt)}
                            sx={{
                                borderRadius: '999px', fontWeight: 600, fontSize: '0.82rem',
                                ...(filter === opt
                                    ? { backgroundColor: '#111827', color: '#fff' }
                                    : { backgroundColor: '#f3f4f6', color: '#374151', '&:hover': { backgroundColor: '#e5e7eb' } }
                                )
                            }}
                        />
                    ))}
                </Box>

                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#111827' }} /></Box>}

                {!loading && displayed.length === 0 && (
                    <Alert severity="info">No verified mentors found{filter !== 'All' ? ` in "${filter}"` : ''} yet.</Alert>
                )}

                {!loading && displayed.length > 0 && (
                    <Grid container spacing={2.5}>
                        {displayed.map(mentor => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={mentor._id}>
                                <MentorCard mentor={mentor} clientId={userId} onBooked={load} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            <EditProfileDialog
                open={editProfileOpen}
                onClose={() => setEditProfileOpen(false)}
                userId={userId}
                role="mentee"
                onSaved={load}
            />
        </Box>
    );
};


// ════════════════════════════════════════
// MENTOR DASHBOARD
// ════════════════════════════════════════
const MentorDashboard = ({ userId, editProfileOpen, setEditProfileOpen }) => {
    const username = localStorage.getItem('username') || 'there';
    const [sessions,      setSessions]      = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [availOpen,     setAvailOpen]     = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        axiosInstance.get(`/session/my-sessions/${userId}`)
            .then(res => setSessions(res.data.sessions))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    useEffect(() => { load(); }, [load]);

    const upcoming  = sessions.filter(s => s.status === 'scheduled');
    const completed = sessions.filter(s => s.status === 'completed');
    const cancelled = sessions.filter(s => s.status === 'cancelled');

    return (
        <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh', px: { xs: 2, md: 6 }, py: 5 }}>
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant='h4' sx={{ fontWeight: 800, color: '#111827', mb: 0.5, letterSpacing: '-0.025em' }}>
                            Hi {username}, Welcome back! 👋
                        </Typography>
                        <Typography sx={{ color: '#6b7280' }}>Manage your sessions and availability.</Typography>
                    </Box>
                    {/* Set availability button */}
                    <Button
                        onClick={() => setAvailOpen(true)}
                        variant="outlined"
                        sx={{ borderColor: '#e5e7eb', color: '#111827', borderRadius: '10px', whiteSpace: 'nowrap' }}
                    >
                        📅 Set Availability
                    </Button>
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: 3, mb: 5, flexWrap: 'wrap' }}>
                    {[
                        { label: 'Upcoming',  value: upcoming.length  },
                        { label: 'Completed', value: completed.length },
                        { label: 'Total',     value: sessions.length  },
                    ].map(s => (
                        <Box key={s.label} sx={{ p: 3, border: '1px solid #f3f4f6', borderRadius: '16px', minWidth: 120 }}>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>{s.label}</Typography>
                            <Typography sx={{ fontWeight: 800, fontSize: '2rem', color: '#111827', lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</Typography>
                        </Box>
                    ))}
                </Box>

                <Typography sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>Upcoming Sessions</Typography>
                <Divider sx={{ mb: 2 }} />
                {loading
                    ? <CircularProgress sx={{ color: '#111827' }} />
                    : upcoming.length === 0
                        ? <Alert severity="info">No upcoming sessions. Your bookings will appear here.</Alert>
                        : upcoming.map(s => <SessionCard key={s._id} session={s} viewerRole="mentor" onUpdated={load} />)
                }

                {completed.length > 0 && (
                    <>
                        <Typography sx={{ fontWeight: 700, color: '#111827', mb: 2, mt: 5 }}>Completed Sessions</Typography>
                        <Divider sx={{ mb: 2 }} />
                        {completed.map(s => <SessionCard key={s._id} session={s} viewerRole="mentor" onUpdated={load} />)}
                    </>
                )}

                {cancelled.length > 0 && (
                    <>
                        <Typography sx={{ fontWeight: 700, color: '#6b7280', mb: 2, mt: 5, fontSize: '0.95rem' }}>Cancelled Sessions</Typography>
                        <Divider sx={{ mb: 2 }} />
                        {cancelled.map(s => <SessionCard key={s._id} session={s} viewerRole="mentor" onUpdated={load} />)}
                    </>
                )}
            </Box>

            <EditProfileDialog
                open={editProfileOpen}
                onClose={() => setEditProfileOpen(false)}
                userId={userId}
                role="mentor"
                onSaved={load}
            />

            <AvailabilityDialog
                open={availOpen}
                onClose={() => setAvailOpen(false)}
                userId={userId}
            />
        </Box>
    );
};


// ════════════════════════════════════════
// ADMIN DASHBOARD
// ════════════════════════════════════════
const AdminDashboard = () => {
    const showToast = useToast();
    const username  = localStorage.getItem('username') || 'Admin';
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/mentor/all')
            .then(res => setMentors(res.data.mentors.filter(m => !m.isVerified)))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const approve = (id) => {
        axiosInstance.put(`/mentor/verify/${id}`)
            .then(() => {
                showToast('Mentor approved!');
                setMentors(prev => prev.filter(m => m._id !== id));
            })
            .catch(() => showToast('Approval failed', 'error'));
    };

    return (
        <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh', px: { xs: 2, md: 6 }, py: 5 }}>
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                <Typography variant='h4' sx={{ fontWeight: 800, color: '#111827', mb: 0.5, letterSpacing: '-0.025em' }}>
                    Hi {username}, Welcome back! 👋
                </Typography>
                <Typography sx={{ color: '#6b7280', mb: 5 }}>Review and approve mentor applications.</Typography>

                <Typography sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>Pending Verifications ({mentors.length})</Typography>
                <Divider sx={{ mb: 3 }} />

                {loading ? <CircularProgress sx={{ color: '#111827' }} /> :
                    mentors.length === 0
                        ? <Alert severity="info">No pending verifications.</Alert>
                        : mentors.map(m => (
                            <Box key={m._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, mb: 1.5, border: '1px solid #f3f4f6', borderRadius: '12px', flexWrap: 'wrap' }}>
                                <Box sx={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6b7280', fontSize: '0.82rem', flexShrink: 0 }}>
                                    {(m.userId?.username || 'M').slice(0, 2).toUpperCase()}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontWeight: 600, color: '#111827' }}>{m.userId?.username}</Typography>
                                    <Typography sx={{ color: '#9ca3af', fontSize: '0.8rem' }}>{m.userId?.email}</Typography>
                                    <Typography sx={{ color: '#6b7280', fontSize: '0.8rem' }}>{m.userId?.title}{m.userId?.company && ` at ${m.userId.company}`}</Typography>
                                    {m.linkedInUrl && <a href={m.linkedInUrl} target="_blank" rel="noreferrer" style={{ color: '#111827', fontSize: '0.78rem' }}>{m.linkedInUrl}</a>}
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Chip label={m.primaryExpertise || 'N/A'} size="small" sx={{ mb: 1, backgroundColor: '#f3f4f6', color: '#374151' }} />
                                    <br />
                                    <Button onClick={() => approve(m._id)} variant="contained" size="small"
                                        sx={{ backgroundColor: '#111827', borderRadius: '999px', '&:hover': { backgroundColor: '#1f2937' } }}>
                                        ✓ Approve
                                    </Button>
                                </Box>
                            </Box>
                        ))
                }
            </Box>
        </Box>
    );
};


// ════════════════════════════════════════
// ROOT
// ════════════════════════════════════════
const Dashboard = ({ editProfileOpen, setEditProfileOpen }) => {
    const role   = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (role === 'mentor') return <MentorDashboard userId={userId} editProfileOpen={editProfileOpen} setEditProfileOpen={setEditProfileOpen} />;
    if (role === 'mentee') return <MenteeDashboard userId={userId} editProfileOpen={editProfileOpen} setEditProfileOpen={setEditProfileOpen} />;
    if (role === 'admin')  return <AdminDashboard />;

    return <Box sx={{ p: 5 }}><Alert severity="warning">Role not found — please log out and log in again.</Alert></Box>;
};

export default Dashboard;