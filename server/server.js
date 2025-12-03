require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json()); // ให้ Server อ่าน JSON ได้
app.use(cors()); // ให้ Frontend (Next.js) เรียกใช้งาน API ได้

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes (เดี๋ยวเราจะมาสร้างไฟล์นี้กันใน Step 4)
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/favorites', require('./routes/favorites'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));