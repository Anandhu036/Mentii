const express = require('express');
const cors    = require('cors');
const app     = express();
require('dotenv').config();
require('./db');

app.use(cors());
app.use(express.json());

app.use('/user',    require('./routes/userRoute'));
app.use('/mentor',  require('./routes/mentorRoute'));
app.use('/session', require('./routes/sessionRoute'));
app.use('/ai',      require('./routes/aiRoute'));       

app.get('/', (req, res) => res.json({ message: 'Mentii API is running' }));

app.listen(process.env.PORT, () =>
    console.log(`Mentii server running on PORT ${process.env.PORT}`)
);