const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/sprints',  require('./routes/sprints'));
app.use('/api/tasks',    require('./routes/tasks'));
app.use('/api/burnout',  require('./routes/burnout'));
app.use('/api/users',    require('./routes/users'));

app.get('/', (req, res) => res.json({ message: 'WorkBalance AI Backend Running' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Backend running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });
