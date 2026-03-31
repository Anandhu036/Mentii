import React, { useState } from 'react'
import axiosInstance from '../axiosinterceptor'
import { useToast }  from '../utils/Toast'
import Box           from '@mui/material/Box';
import Typography    from '@mui/material/Typography';
import Button        from '@mui/material/Button';
import Chip          from '@mui/material/Chip';
import Avatar        from '@mui/material/Avatar';
import Dialog        from '@mui/material/Dialog';
import DialogTitle   from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField     from '@mui/material/TextField';
import Select        from '@mui/material/Select';
import MenuItem      from '@mui/material/MenuItem';
import InputLabel    from '@mui/material/InputLabel';
import FormControl   from '@mui/material/FormControl';
import Divider       from '@mui/material/Divider';

const CANCEL_REASONS = [
    'Schedule Conflict',
    'Not a good fit',
    'Personal emergency',
    'Mentee was unresponsive',
    'Technical issues',
    'Other',
];

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#f9fafb' } };

// ── Mentee profile dialog (mentor view) ──────────────────────────
const MenteeProfileDialog = ({ open, onClose, mentee }) => {
    if (!mentee) return null;
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700, color: '#111827' }}>{mentee.username}'s Profile</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 0.5 }}>
                    {mentee.title    && <Typography sx={{ color: '#374151', fontSize: '0.88rem' }}><strong>Role:</strong> {mentee.title}</Typography>}
                    {mentee.company  && <Typography sx={{ color: '#374151', fontSize: '0.88rem' }}><strong>Company:</strong> {mentee.company}</Typography>}
                    {mentee.fieldOfWork && <Typography sx={{ color: '#374151', fontSize: '0.88rem' }}><strong>Field:</strong> {mentee.fieldOfWork}</Typography>}
                    {mentee.bio && (
                        <>
                            <Divider />
                            <Typography sx={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.7 }}>{mentee.bio}</Typography>
                        </>
                    )}
                    {!mentee.title && !mentee.bio && (
                        <Typography sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>No profile details added yet.</Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#e5e7eb', color: '#111827', borderRadius: '10px' }}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Cancel with reason modal ──────────────────────────────────────
const CancelModal = ({ open, onClose, session, onUpdated }) => {
    const showToast = useToast();
    const [reason,          setReason]          = useState('');
    const [rescheduleNote,  setRescheduleNote]  = useState('');
    const [loading,         setLoading]         = useState(false);

    const handleCancel = async () => {
        if (!reason) { showToast('Please select a reason', 'error'); return; }
        setLoading(true);
        try {
            await axiosInstance.put(`/session/cancel/${session._id}`, {
                cancellationReason: reason,
                rescheduleNote:     rescheduleNote,
            });
            showToast('Session cancelled');
            setReason('');
            setRescheduleNote('');
            onClose();
            onUpdated();
        } catch (err) {
            showToast(err.response?.data?.message || 'Cancellation failed', 'error');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700, color: '#111827' }}>Cancel Session</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
                <FormControl fullWidth>
                    <InputLabel>Reason for cancellation *</InputLabel>
                    <Select value={reason} label="Reason for cancellation *" onChange={(e) => setReason(e.target.value)} sx={{ borderRadius: '10px', backgroundColor: '#f9fafb' }}>
                        {CANCEL_REASONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                    </Select>
                </FormControl>
                <TextField
                    label="Suggest a reschedule time (optional)"
                    value={rescheduleNote}
                    onChange={(e) => setRescheduleNote(e.target.value)}
                    placeholder="e.g. I'm free next Tuesday at 3pm"
                    fullWidth multiline rows={2}
                    sx={fieldSx}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: '#6b7280' }}>Back</Button>
                <Button
                    onClick={handleCancel}
                    disabled={loading}
                    variant="contained"
                    sx={{ backgroundColor: '#dc2626', borderRadius: '10px', '&:hover': { backgroundColor: '#b91c1c' } }}
                >
                    {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ── Review modal ──────────────────────────────────────────────────
const ReviewModal = ({ open, onClose, session, onUpdated }) => {
    const showToast = useToast();
    const [rating,  setRating]  = useState(5);
    const [review,  setReview]  = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        try {
            await axiosInstance.put(`/session/status/${session._id}`, { status: 'completed' });
            await axiosInstance.put(`/session/review/${session._id}`,  { rating, review });
            showToast('Review submitted! Thank you.');
            setRating(5);
            setReview('');
            onClose();
            onUpdated();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to submit review', 'error');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700, color: '#111827' }}>Leave Feedback</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
                <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', mb: 1 }}>Rating *</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Box
                                key={star}
                                onClick={() => setRating(star)}
                                sx={{
                                    fontSize: '2rem', cursor: 'pointer',
                                    color: star <= rating ? '#f59e0b' : '#e5e7eb',
                                    transition: 'color 0.1s',
                                    userSelect: 'none',
                                    '&:hover': { color: '#f59e0b' }
                                }}
                            >★</Box>
                        ))}
                    </Box>
                </Box>
                <TextField
                    label="Your review (optional)"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    fullWidth multiline rows={3}
                    placeholder="How did the session go?"
                    sx={fieldSx}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: '#6b7280' }}>Cancel</Button>
                <Button
                    onClick={submit}
                    disabled={loading}
                    variant="contained"
                    sx={{ backgroundColor: '#111827', borderRadius: '10px', '&:hover': { backgroundColor: '#1f2937' } }}
                >
                    {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


// ── The card itself ───────────────────────────────────────────────
const SessionCard = ({ session, viewerRole, onUpdated }) => {
    const showToast    = useToast();
    const [meetingInput,  setMeetingInput]  = useState(session.meetingLink || '');
    const [savingLink,    setSavingLink]    = useState(false);
    const [reviewOpen,    setReviewOpen]    = useState(false);
    const [cancelOpen,    setCancelOpen]    = useState(false);
    const [menteeDialog,  setMenteeDialog]  = useState(false);

    const isPast      = new Date(session.scheduledDate) < new Date();
    const needsReview = isPast && session.status === 'scheduled' && viewerRole === 'mentee';
    const other       = viewerRole === 'mentor' ? session.clientId : session.mentorId;

    const dateStr = new Date(session.scheduledDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    // Status pill colours
    const statusStyle = {
        completed: { bg: '#dcfce7', color: '#166534' },
        cancelled:  { bg: '#fee2e2', color: '#dc2626' },
        scheduled:  { bg: '#f3f4f6', color: '#374151' },
    }[session.status] || { bg: '#f3f4f6', color: '#374151' };

    const saveLink = async () => {
        if (!meetingInput.trim()) return;
        setSavingLink(true);
        try {
            await axiosInstance.put(`/session/meeting/${session._id}`, { meetingLink: meetingInput });
            showToast('Meeting link saved!');
            onUpdated();
        } catch {
            showToast('Failed to save link', 'error');
        }
        setSavingLink(false);
    };

    return (
        <>
            <Box sx={{
                p: 2.5, mb: 1.5,
                border: `1px solid ${needsReview ? '#fde68a' : '#f3f4f6'}`,
                borderRadius: '12px',
                backgroundColor: needsReview ? '#fffbeb' : '#ffffff',
            }}>
                {/* Top row: avatar, name, status, date */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                    <Avatar
                        src={other?.photoUrl || ''}
                        sx={{ width: 40, height: 40, backgroundColor: '#f3f4f6', color: '#6b7280', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}
                    >
                        {(other?.username || 'U').slice(0, 2).toUpperCase()}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{other?.username}</Typography>
                            {other?.title && (
                                <Typography sx={{ color: '#9ca3af', fontSize: '0.78rem' }}>
                                    {other.title}{other.company ? ` at ${other.company}` : ''}
                                </Typography>
                            )}
                            <Chip
                                label={session.status}
                                size="small"
                                sx={{ backgroundColor: statusStyle.bg, color: statusStyle.color, fontWeight: 600, fontSize: '0.68rem', ml: 'auto' }}
                            />
                        </Box>
                        {session.bookingNote && (
                            <Typography sx={{ color: '#9ca3af', fontSize: '0.76rem', fontStyle: 'italic', mt: 0.3 }}>
                                "{session.bookingNote}"
                            </Typography>
                        )}
                        <Typography sx={{ color: '#6b7280', fontSize: '0.8rem', mt: 0.4 }}>{dateStr}</Typography>

                        {/* Slot label if set */}
                        {session.slotLabel && (
                            <Typography sx={{ color: '#6b7280', fontSize: '0.76rem', mt: 0.2 }}>
                                📅 Slot: {session.slotLabel}
                            </Typography>
                        )}

                        {/* Show cancellation reason to mentee */}
                        {session.status === 'cancelled' && session.cancellationReason && viewerRole === 'mentee' && (
                            <Box sx={{ mt: 1, p: 1.2, backgroundColor: '#fff5f5', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                                <Typography sx={{ fontSize: '0.76rem', color: '#dc2626', fontWeight: 600 }}>
                                    Reason: {session.cancellationReason}
                                </Typography>
                                {session.rescheduleNote && (
                                    <Typography sx={{ fontSize: '0.74rem', color: '#6b7280', mt: 0.3 }}>
                                        💬 Mentor's suggestion: {session.rescheduleNote}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* ── MENTOR actions ── */}
                {viewerRole === 'mentor' && session.status === 'scheduled' && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Meeting link input */}
                        <TextField
                            size="small"
                            placeholder="Paste Google Meet or Zoom link..."
                            value={meetingInput}
                            onChange={(e) => setMeetingInput(e.target.value)}
                            sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '0.82rem' } }}
                        />
                        <Button
                            size="small" variant="outlined"
                            onClick={saveLink}
                            disabled={savingLink || !meetingInput.trim()}
                            sx={{ borderColor: '#e5e7eb', color: '#111827', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                            {savingLink ? 'Saving...' : 'Save Link'}
                        </Button>
                        <Button
                            size="small" variant="outlined"
                            onClick={() => setMenteeDialog(true)}
                            sx={{ borderColor: '#e5e7eb', color: '#374151', borderRadius: '8px', flexShrink: 0 }}
                        >
                            View Profile
                        </Button>
                        <Button
                            size="small" variant="outlined"
                            onClick={() => setCancelOpen(true)}
                            sx={{ borderColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', flexShrink: 0 }}
                        >
                            Cancel
                        </Button>
                    </Box>
                )}

                {/* ── MENTEE: Join button if link exists ── */}
                {viewerRole === 'mentee' && session.meetingLink && session.status === 'scheduled' && (
                    <Box sx={{ mt: 1.5 }}>
                        <Button
                            href={session.meetingLink} target="_blank" rel="noreferrer"
                            variant="contained" size="small"
                            sx={{ backgroundColor: '#111827', borderRadius: '8px', fontSize: '0.8rem', '&:hover': { backgroundColor: '#1f2937' } }}
                        >
                            Join Meeting →
                        </Button>
                    </Box>
                )}

                {/* ── MENTEE: Past session — mark completed + review ── */}
                {needsReview && (
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 500 }}>⏰ This session has passed</Typography>
                        <Button
                            size="small"
                            onClick={() => setReviewOpen(true)}
                            sx={{ backgroundColor: '#f59e0b', color: '#fff', borderRadius: '8px', fontSize: '0.78rem', '&:hover': { backgroundColor: '#d97706' } }}
                        >
                            Mark Completed & Review
                        </Button>
                    </Box>
                )}

                {/* Existing review */}
                {session.status === 'completed' && session.rating && (
                    <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#374151' }}>
                            {'★'.repeat(session.rating)}{'☆'.repeat(5 - session.rating)}{' '}
                            <span style={{ color: '#6b7280' }}>{session.review}</span>
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Sub-dialogs */}
            <ReviewModal    open={reviewOpen}   onClose={() => setReviewOpen(false)}   session={session} onUpdated={onUpdated} />
            <CancelModal    open={cancelOpen}   onClose={() => setCancelOpen(false)}   session={session} onUpdated={onUpdated} />
            <MenteeProfileDialog open={menteeDialog} onClose={() => setMenteeDialog(false)} mentee={session.clientId} />
        </>
    );
};

export default SessionCard;