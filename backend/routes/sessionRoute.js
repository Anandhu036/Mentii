const express      = require('express');
const router       = express.Router();
const sessionModel = require('../models/sessionModel');
const userModel    = require('../models/userModel');
const verifyToken  = require('../middleware/auth');


// POST /session/book
router.post('/book', verifyToken, async (req, res) => {
    try {
        const { mentorId, clientId, scheduledDate, bookingNote, slotLabel } = req.body;
        if (!mentorId || !clientId || !scheduledDate)
            return res.status(400).send({ message: 'mentorId, clientId and scheduledDate are required' });

        const mentor = await userModel.findById(mentorId);
        const client = await userModel.findById(clientId);
        if (!mentor || mentor.role !== 'mentor') return res.status(404).send({ message: 'Mentor not found' });
        if (!client)                              return res.status(404).send({ message: 'Client not found' });

        const session = await new sessionModel({
            mentorId, clientId,
            scheduledDate: new Date(scheduledDate),
            bookingNote:   bookingNote || '',
            slotLabel:     slotLabel   || '',
        }).save();

        res.status(200).send({ message: 'Session booked', session });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Booking error' });
    }
});


// GET /session/my-sessions/:userId
router.get('/my-sessions/:userId', verifyToken, async (req, res) => {
    try {
        const sessions = await sessionModel.find({
            $or: [{ clientId: req.params.userId }, { mentorId: req.params.userId }]
        })
        .populate('mentorId', 'username email title company')
        .populate('clientId', 'username email title company fieldOfWork bio')
        .sort({ scheduledDate: 1 });

        res.status(200).send({ message: 'Sessions fetched', sessions });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error fetching sessions' });
    }
});


// PUT /session/status/:sessionId — generic status update (completed only, not cancel)
router.put('/status/:sessionId', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        // 'cancelled' is intentionally excluded here — use /cancel route instead
        if (!['scheduled', 'completed'].includes(status))
            return res.status(400).send({ message: 'Use /cancel route for cancellations. Status must be: scheduled or completed' });

        const updated = await sessionModel.findByIdAndUpdate(
            req.params.sessionId,
            { status },
            { returnDocument: 'after' }
        );
        if (!updated) return res.status(404).send({ message: 'Session not found' });
        res.status(200).send({ message: 'Status updated', session: updated });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error updating status' });
    }
});


// PUT /session/cancel/:sessionId — smart cancellation with mandatory reason
// Body: { cancellationReason: String, rescheduleNote?: String }
router.put('/cancel/:sessionId', verifyToken, async (req, res) => {
    try {
        const { cancellationReason, rescheduleNote } = req.body;

        if (!cancellationReason || !cancellationReason.trim()) {
            return res.status(400).send({ message: 'A cancellation reason is required' });
        }

        const session = await sessionModel.findById(req.params.sessionId);
        if (!session) return res.status(404).send({ message: 'Session not found' });
        if (session.status !== 'scheduled')
            return res.status(400).send({ message: 'Only scheduled sessions can be cancelled' });

        const updated = await sessionModel.findByIdAndUpdate(
            req.params.sessionId,
            {
                status:             'cancelled',
                cancellationReason: cancellationReason.trim(),
                rescheduleNote:     rescheduleNote ? rescheduleNote.trim() : '',
            },
            { returnDocument: 'after' }
        );

        res.status(200).send({ message: 'Session cancelled', session: updated });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error cancelling session' });
    }
});


// PUT /session/meeting/:sessionId — mentor saves meeting link
router.put('/meeting/:sessionId', verifyToken, async (req, res) => {
    try {
        const { meetingLink } = req.body;
        if (!meetingLink || !meetingLink.trim())
            return res.status(400).send({ message: 'Meeting link is required' });

        const updated = await sessionModel.findByIdAndUpdate(
            req.params.sessionId,
            { meetingLink },
            { returnDocument: 'after' }
        );
        if (!updated) return res.status(404).send({ message: 'Session not found' });
        res.status(200).send({ message: 'Meeting link saved', session: updated });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error saving meeting link' });
    }
});


// PUT /session/review/:sessionId — leave rating + review (completed sessions only)
router.put('/review/:sessionId', verifyToken, async (req, res) => {
    try {
        const { rating, review } = req.body;
        if (!rating || rating < 1 || rating > 5)
            return res.status(400).send({ message: 'Rating must be between 1 and 5' });

        const session = await sessionModel.findById(req.params.sessionId);
        if (!session) return res.status(404).send({ message: 'Session not found' });
        if (session.status !== 'completed')
            return res.status(400).send({ message: 'Reviews can only be left on completed sessions' });

        const updated = await sessionModel.findByIdAndUpdate(
            req.params.sessionId,
            { rating, review: review || '' },
            { returnDocument: 'after' }
        );
        res.status(200).send({ message: 'Review saved', session: updated });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error saving review' });
    }
});


module.exports = router;