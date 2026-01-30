const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

dotenv.config();

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const assetRoutes = require('./src/routes/assets');
const activityRoutes = require('./src/routes/activities');
const aiRoutes = require('./src/routes/ai');
const marketRoutes = require('./src/routes/market');

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:DE38ScI9784EVO58@ifams-mongodb.ns-g3sz2zop.svc:27017';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/market', marketRoutes);

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ code: 500, msg: err.message || 'Server error', data: null });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;
