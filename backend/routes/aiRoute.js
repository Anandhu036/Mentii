const express    = require('express');
const router     = express.Router();
const axios      = require('axios');

// POST /ai/enhance-bio
// Removed verifyToken so it works during onboarding/registration
router.post('/enhance-bio', async (req, res) => {
    try {
        const { title, company, fieldOfWork, experienceLevel, skills } = req.body;

        if (!title || !company) {
            return res.status(400).send({ message: 'title and company are required to enhance bio' });
        }

        const skillsStr = Array.isArray(skills) ? skills.join(', ') : (skills || 'various skills');

const prompt = `Write a single, professional 2-3 sentence bio written strictly in the FIRST PERSON ("I", "my", "I'm") for someone who is a ${title} at ${company}. 
My field is ${fieldOfWork} with ${experienceLevel} experience. 
I am skilled in: ${skillsStr}. 
Make it sound inspiring and community-focused. 
CRITICAL: Do NOT provide multiple options. Do NOT use placeholders like [Name] or [He/She]. Return ONLY the final paragraph of text.`;
const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;const geminiRes = await axios.post(geminiUrl, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        const bioText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!bioText) {
            return res.status(500).send({ message: 'Gemini returned an empty response' });
        }

        res.status(200).send({ message: 'Bio enhanced successfully', bio: bioText.trim() });

} catch (error) {
    console.log('=== GEMINI ERROR ===');
    console.log('Status:', error?.response?.status);
    console.log('Data:',   JSON.stringify(error?.response?.data, null, 2));
    console.log('Message:', error.message);
    console.log('====================');
    res.status(500).send({
        message: 'AI enhancement failed',
        detail:  error?.response?.data || error.message
    });
}
});

module.exports = router;