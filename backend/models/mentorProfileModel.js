const mongoose = require('mongoose');

const mentorProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, unique: true },

    primaryExpertise:   { type: String,   default: '' },
    secondaryExpertise: { type: String,   default: '' },
    specificExpertise:  { type: [String], default: [] },
    yearsOfExperience:  { type: Number,   default: 0  },
    skills:             { type: [String], default: [] },
    tools:              { type: [String], default: [] },
    linkedInUrl:        { type: String,   default: '' },
    bio:                { type: String,   default: '' },

    // Mentor sets their open time slots, e.g. ["Monday 10:00 AM", "Wednesday 3:00 PM"]
    // Mentees see these in the booking modal and pick one
    availableSlots: { type: [String], default: [] },

    isVerified:  { type: Boolean, default: false },
    sessionRate: { type: Number,  default: 0     },

}, { timestamps: true });

module.exports = mongoose.model('mentorProfiles', mentorProfileSchema);