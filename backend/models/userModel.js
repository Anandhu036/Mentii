const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['mentee', 'mentor', 'admin'], default: 'mentee' },

    // Step 2 — Basics
    country: { type: String, default: '' },
    title:   { type: String, default: '' },
    company: { type: String, default: '' },

    // Step 3 — Mentee
    fieldOfWork:     { type: String, default: '' },
    experienceLevel: { type: String, default: '' },
    bio:             { type: String, default: '' },

}, { timestamps: true });

module.exports = mongoose.model('users', userSchema);