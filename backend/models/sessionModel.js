const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    mentorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    clientId:      { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    scheduledDate: { type: Date,   required: true },
    bookingNote:   { type: String, default: '' },

    // Which of the mentor's available slots the mentee picked (display label only)
    slotLabel: { type: String, default: '' },

    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },

    // Mentor adds video call link
    meetingLink: { type: String, default: '' },

    // Set when mentor cancels — shown to mentee so they aren't left in the dark
    cancellationReason: { type: String, default: '' },
    rescheduleNote:     { type: String, default: '' },

    // Mentee leaves after session is completed
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: '' },

}, { timestamps: true });

module.exports = mongoose.model('sessions', sessionSchema);