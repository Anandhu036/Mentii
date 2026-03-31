const express       = require('express');
const router        = express.Router();
const jwt           = require('jsonwebtoken');
const bcrypt        = require('bcrypt');          
const mongoose      = require('mongoose');        
const userModel     = require('../models/userModel');
const mentorProfile = require('../models/mentorProfileModel');
const sessionModel  = require('../models/sessionModel');
const verifyToken   = require('../middleware/auth');

const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN_REGEX = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
const SALT_ROUNDS    = 10;


// ════════════════════════════════════════
// POST /user/register
// ════════════════════════════════════════
router.post('/register', async (req, res) => {
    // Start a MongoDB session so we can wrap both saves in a transaction.
    // If either save fails, the session aborts and NEITHER document is
    // written to the database — no half-created accounts.
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            username, email, password, role,
            country, title, company,
            fieldOfWork, experienceLevel, bio,
            primaryExpertise, secondaryExpertise, specificExpertise,
            yearsOfExperience, linkedInUrl, skills, tools,
        } = req.body;

        // ── Validation  ──
        if (!username || !username.trim())    return res.status(400).send({ message: 'Username is required' });
        if (!email    || !email.trim())       return res.status(400).send({ message: 'Email is required' });
        if (!EMAIL_REGEX.test(email))         return res.status(400).send({ message: 'Please enter a valid email address' });
        if (!password || password.length < 6) return res.status(400).send({ message: 'Password must be at least 6 characters' });

        if (role === 'mentor') {
            if (!linkedInUrl || !linkedInUrl.trim()) return res.status(400).send({ message: 'LinkedIn URL is required for mentors' });
            if (!LINKEDIN_REGEX.test(linkedInUrl))   return res.status(400).send({ message: 'Please enter a valid LinkedIn URL' });
            if (!primaryExpertise)                   return res.status(400).send({ message: 'Primary expertise is required for mentors' });
        }

        const existing = await userModel.findOne({ email }).session(session);
        if (existing) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).send({ message: 'Email already registered' });
        }

        
        const salt           = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ── Save user (inside the transaction session) ───────────────
        const newUser = new userModel({
            username,
            email,
            password:        hashedPassword,   // ← hashed, never plain text
            role:            role            || 'mentee',
            country:         country         || '',
            title:           title           || '',
            company:         company         || '',
            fieldOfWork:     fieldOfWork     || '',
            experienceLevel: experienceLevel || '',
            bio:             bio             || '',
        });
        const saved = await newUser.save({ session });  // ← pass session

        // ── Save mentor profile (inside the SAME transaction) ────────
        // If this save throws, the catch block runs session.abortTransaction(),
        // which rolls back the user save above too — no orphaned user document.
        if (saved.role === 'mentor') {
            const profile = new mentorProfile({
                userId:             saved._id,
                primaryExpertise:   primaryExpertise   || '',
                secondaryExpertise: secondaryExpertise || '',
                specificExpertise:  Array.isArray(specificExpertise) ? specificExpertise : [],
                yearsOfExperience:  Number(yearsOfExperience) || 0,
                skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []),
                tools:  Array.isArray(tools)  ? tools  : [],
                linkedInUrl: linkedInUrl || '',
                bio:         bio         || '',
            });
            await profile.save({ session });  // ← same session
        }

        // ── Both saves succeeded — commit and close ──────────────────
        await session.commitTransaction();
        session.endSession();

        res.status(201).send({ message: 'Registration successful', userId: saved._id, role: saved.role });

    } catch (error) {
        // Something failed — roll back every write made in this transaction
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        res.status(500).send({ message: 'Registration error' });
    }
});


// ════════════════════════════════════════
// POST /user/login
// ════════════════════════════════════════
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).send({ message: 'Email and password are required' });

        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).send({ message: 'User not found' });

        // ── bcrypt.compare checks the plain-text input against the hash ──
        // It does NOT decrypt — it re-hashes and compares. Safe by design.
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).send({ message: 'Incorrect password' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

        res.status(200).send({
            message:   'Login successful',
            usertoken: token,
            userId:    user._id,
            role:      user.role,
            username:  user.username,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Login error' });
    }
});


// ════════════════════════════════════════
// GET /user/profile/:userId
// ════════════════════════════════════════
router.get('/profile/:userId', verifyToken, async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).send({ message: 'User not found' });
        res.status(200).send({ user });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error fetching profile' });
    }
});


// ════════════════════════════════════════
// PUT /user/profile/:userId
// ════════════════════════════════════════
router.put('/profile/:userId', verifyToken, async (req, res) => {
    try {
        const { title, company, country, bio, fieldOfWork, experienceLevel,
                primaryExpertise, secondaryExpertise, specificExpertise,
                yearsOfExperience, linkedInUrl, skills, tools } = req.body;

        const updatedUser = await userModel.findByIdAndUpdate(
            req.params.userId,
            { title, company, country, bio, fieldOfWork, experienceLevel },
            { returnDocument: 'after' }
        );
        if (!updatedUser) return res.status(404).send({ message: 'User not found' });

        if (updatedUser.role === 'mentor') {
            await mentorProfile.findOneAndUpdate(
                { userId: req.params.userId },
                {
                    primaryExpertise, secondaryExpertise,
                    specificExpertise: Array.isArray(specificExpertise) ? specificExpertise : [],
                    yearsOfExperience: Number(yearsOfExperience) || 0,
                    linkedInUrl,
                    skills: Array.isArray(skills) ? skills : [],
                    tools:  Array.isArray(tools)  ? tools  : [],
                    bio,
                },
                { returnDocument: 'after' }
            );
        }

        res.status(200).send({ message: 'Profile updated successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error updating profile' });
    }
});


// ════════════════════════════════════════
// DELETE /user/:userId — cascade delete
// ════════════════════════════════════════
router.delete('/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const deleted = await userModel.findByIdAndDelete(userId);
        if (!deleted) return res.status(404).send({ message: 'User not found' });

        await mentorProfile.findOneAndDelete({ userId });
        await sessionModel.deleteMany({ $or: [{ mentorId: userId }, { clientId: userId }] });

        res.status(200).send({ message: 'Account and all data deleted successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error deleting account' });
    }
});


module.exports = router;