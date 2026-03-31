import React, { useState } from 'react'
import axiosInstance  from '../axiosinterceptor'
import { useToast }   from '../utils/Toast'
import Box            from '@mui/material/Box';
import Card           from '@mui/material/Card';
import CardContent    from '@mui/material/CardContent';
import Typography     from '@mui/material/Typography';
import Button         from '@mui/material/Button';
import Chip           from '@mui/material/Chip';
import Divider        from '@mui/material/Divider';
import Avatar         from '@mui/material/Avatar';
import Dialog         from '@mui/material/Dialog';
import DialogTitle    from '@mui/material/DialogTitle';
import DialogContent  from '@mui/material/DialogContent';
import DialogActions  from '@mui/material/DialogActions';
import TextField      from '@mui/material/TextField';
import Select         from '@mui/material/Select';
import MenuItem       from '@mui/material/MenuItem';
import InputLabel     from '@mui/material/InputLabel';
import FormControl    from '@mui/material/FormControl';

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#f9fafb' } };

// ── Mentor Profile + Booking Dialog ──────────────────────────────
const MentorProfileDialog = ({ open, onClose, mentor, clientId, onBooked }) => {
    const showToast = useToast();
    const user = mentor?.userId || {};

    const [scheduledDate, setScheduledDate] = useState('');
    const [bookingNote,   setBookingNote]   = useState('');
    const [selectedSlot,  setSelectedSlot]  = useState('');

    const availableSlots = mentor?.availableSlots || [];
    const hasSlots = availableSlots.length > 0;

    const book = async () => {
        if (!scheduledDate) { showToast('Please select a date and time', 'error'); return; }
        try {
            await axiosInstance.post('/session/book', {
                mentorId:    user._id || mentor?.userId?._id,
                clientId,
                scheduledDate,
                bookingNote,
                slotLabel: selectedSlot || '',
            });
            showToast('Session booked successfully!');
            setScheduledDate('');
            setBookingNote('');
            setSelectedSlot('');
            onClose();
            if (onBooked) onBooked();
        } catch (err) {
            showToast(err.response?.data?.message || 'Booking failed', 'error');
        }
    };

    if (!mentor) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            {/* Header */}
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={user.photoUrl || ''}
                        sx={{ width: 52, height: 52, backgroundColor: '#111827', fontWeight: 700 }}
                    >
                        {(user.username || 'M').slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '1.05rem' }}>{user.username}</Typography>
                        <Typography sx={{ color: '#6b7280', fontSize: '0.82rem' }}>
                            {user.title}{user.company && ` at ${user.company}`}
                            {user.country && `, ${user.country}`}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent>
                {/* Expertise chips */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {mentor.primaryExpertise   && <Chip label={mentor.primaryExpertise}   size="small" sx={{ backgroundColor: '#111827', color: '#fff', fontWeight: 600, fontSize: '0.72rem' }} />}
                    {mentor.secondaryExpertise && <Chip label={mentor.secondaryExpertise} size="small" sx={{ backgroundColor: '#f3f4f6', color: '#374151', fontSize: '0.72rem' }} />}
                    {(mentor.specificExpertise || []).map(s => (
                        <Chip key={s} label={s} size="small" sx={{ backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '0.68rem' }} />
                    ))}
                </Box>

                {/* Bio */}
                {(user.bio || mentor.bio) && (
                    <Typography sx={{ color: '#374151', fontSize: '0.88rem', lineHeight: 1.7, mb: 2 }}>
                        {user.bio || mentor.bio}
                    </Typography>
                )}

                {/* Skills */}
                {mentor.skills?.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.8 }}>Skills</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {mentor.skills.map(s => <Chip key={s} label={s} size="small" sx={{ backgroundColor: '#f9fafb', color: '#374151', fontSize: '0.7rem' }} />)}
                        </Box>
                    </Box>
                )}

                {/* Tools */}
                {mentor.tools?.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.8 }}>Tools</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {mentor.tools.map(t => <Chip key={t} label={t} size="small" sx={{ backgroundColor: '#f9fafb', color: '#374151', fontSize: '0.7rem' }} />)}
                        </Box>
                    </Box>
                )}

                {/* LinkedIn */}
                {mentor.linkedInUrl && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>LinkedIn</Typography>
                        <a href={mentor.linkedInUrl} target="_blank" rel="noreferrer" style={{ color: '#111827', fontSize: '0.85rem' }}>
                            {mentor.linkedInUrl}
                        </a>
                    </Box>
                )}

                <Divider sx={{ my: 2.5 }} />
                <Typography sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>Book a Session</Typography>
                <Typography sx={{ color: '#9ca3af', fontSize: '0.8rem', mb: 2 }}>
                    {hasSlots ? 'Choose one of the mentor\'s available time slots, then confirm a date.' : 'Pick a date and time for your session.'}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Available slots dropdown — shown only if mentor has set slots */}
                    {hasSlots && (
                        <FormControl fullWidth>
                            <InputLabel>Available Time Slot *</InputLabel>
                            <Select
                                value={selectedSlot}
                                label="Available Time Slot *"
                                onChange={(e) => setSelectedSlot(e.target.value)}
                                sx={{ borderRadius: '10px', backgroundColor: '#f9fafb' }}
                            >
                                {availableSlots.map(slot => (
                                    <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <TextField
                        label="Confirm date & time *"
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        helperText={hasSlots ? 'Pick the date that matches your chosen slot above' : ''}
                        sx={fieldSx}
                    />

                    <TextField
                        label="What would you like help with?"
                        value={bookingNote}
                        onChange={(e) => setBookingNote(e.target.value)}
                        fullWidth multiline rows={2}
                        placeholder="Tell the mentor about your goals..."
                        sx={fieldSx}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: '#6b7280', borderRadius: '10px' }}>Cancel</Button>
                <Button
                    onClick={book}
                    variant="contained"
                    sx={{ backgroundColor: '#111827', borderRadius: '10px', px: 3, '&:hover': { backgroundColor: '#1f2937' } }}
                >
                    Confirm Booking
                </Button>
            </DialogActions>
        </Dialog>
    );
};


// ── The card itself ───────────────────────────────────────────────
const MentorCard = ({ mentor, clientId, onBooked }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const user = mentor?.userId || {};

    return (
        <>
            <Card
                onClick={() => setDialogOpen(true)}
                sx={{
                    height: '100%',
                    cursor: 'pointer',
                    border: '1px solid #f3f4f6',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    '&:hover': {
                        borderColor: '#d1d5db',
                        boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                    }
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    {/* Avatar + name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                            src={user.photoUrl || ''}
                            sx={{
                                width: 48, height: 48,
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                fontWeight: 700,
                                fontSize: '1rem',
                                border: '2px solid #e5e7eb',
                                flexShrink: 0,
                            }}
                        >
                            {(user.username || 'M').slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem', lineHeight: 1.3 }}>
                                {user.username}
                                {user.country && (
                                    <Typography component="span" sx={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.78rem', ml: 0.8 }}>
                                        {user.country}
                                    </Typography>
                                )}
                            </Typography>
                            <Typography sx={{ color: '#6b7280', fontSize: '0.8rem', mt: 0.2 }} noWrap>
                                {user.title}
                                {user.company && <> <span style={{ color: '#9ca3af' }}>at</span> <strong style={{ color: '#374151' }}>{user.company}</strong></>}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Primary expertise chip */}
                    {mentor.primaryExpertise && (
                        <Chip
                            label={mentor.primaryExpertise}
                            size="small"
                            sx={{ backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 600, fontSize: '0.7rem', mb: 1.5 }}
                        />
                    )}

                    {/* Bio snippet */}
                    {user.bio && (
                        <Typography sx={{
                            color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.6,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                            {user.bio}
                        </Typography>
                    )}

                    <Divider sx={{ my: 1.5, borderColor: '#f3f4f6' }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#6b7280' }}>
                            {mentor.yearsOfExperience ? `${mentor.yearsOfExperience} yrs exp` : '—'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af' }}>View profile →</Typography>
                    </Box>
                </CardContent>
            </Card>

            <MentorProfileDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                mentor={mentor}
                clientId={clientId}
                onBooked={onBooked}
            />
        </>
    );
};

export default MentorCard;