const express       = require('express');
const router        = express.Router();
const mentorProfile = require('../models/mentorProfileModel');
const verifyToken   = require('../middleware/auth');


// GET /mentor/feed — all verified mentors for browse page
router.get('/feed', verifyToken, async (req, res) => {
    try {
        const mentors = await mentorProfile.find({ isVerified: true })
            .populate('userId', 'username email title company country bio');
        res.status(200).send({ message: 'Feed fetched', mentors });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error fetching feed' });
    }
});


// GET /mentor/all — admin: includes unverified
router.get('/all', verifyToken, async (req, res) => {
    try {
        const mentors = await mentorProfile.find()
            .populate('userId', 'username email title company country');
        res.status(200).send({ message: 'All mentors fetched', mentors });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error fetching mentors' });
    }
});


// GET /mentor/profile/:userId — mentor fetches their own profile doc
router.get('/profile/:userId', verifyToken, async (req, res) => {
    try {
        const profile = await mentorProfile.findOne({ userId: req.params.userId })
            .populate('userId', 'username email title company country bio');
        if (!profile) return res.status(404).send({ message: 'Profile not found' });
        res.status(200).send({ profile });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error fetching profile' });
    }
});


// PUT /mentor/verify/:profileId — admin approves mentor
router.put('/verify/:profileId', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).send({ message: 'Admin access only' });
        const profile = await mentorProfile.findByIdAndUpdate(
            req.params.profileId,
            { isVerified: true },
            { returnDocument: 'after' }
        );
        if (!profile) return res.status(404).send({ message: 'Profile not found' });
        res.status(200).send({ message: 'Mentor verified', profile });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error verifying mentor' });
    }
});


// PUT /mentor/availability/:userId — mentor saves their available time slots
// Body: { availableSlots: ["Monday 10:00 AM", "Wednesday 3:00 PM"] }
router.put('/availability/:userId', verifyToken, async (req, res) => {
    try {
        const { availableSlots } = req.body;

        if (!Array.isArray(availableSlots)) {
            return res.status(400).send({ message: 'availableSlots must be an array of strings' });
        }

        const updated = await mentorProfile.findOneAndUpdate(
            { userId: req.params.userId },
            { availableSlots },
            { returnDocument: 'after' }
        );

        if (!updated) return res.status(404).send({ message: 'Mentor profile not found' });
        res.status(200).send({ message: 'Availability saved', availableSlots: updated.availableSlots });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error saving availability' });
    }
});


module.exports = router;