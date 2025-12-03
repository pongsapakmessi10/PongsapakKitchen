const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // ดึง Schema User ที่เราทำไว้ตอน Phase 1

// 1. REGISTER (สมัครสมาชิก)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // เช็คว่ามี User นี้หรือยัง
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    // สร้าง User ใหม่
    user = new User({ username, email, password });

    // เข้ารหัส Password (จาก "123456" เป็น "$2a$10$OfG...")
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save(); // บันทึกลง MongoDB

    res.status(201).json({ msg: 'สมัครสมาชิกสำเร็จ' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. LOGIN (เข้าสู่ระบบ)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // เช็คว่ามีอีเมลนี้ไหม
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // เช็ครหัสผ่าน (เอารหัสที่พิมพ์ มาเทียบกับรหัสที่เข้ารหัสไว้ใน DB)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // สร้าง JWT Token (บัตรผ่าน)
    const payload = {
      user: { id: user.id, username: user.username }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }, // Token มีอายุ 7 วัน
      (err, token) => {
        if (err) throw err;
        res.json({ token, username: user.username }); // ส่ง Token กลับไปให้ Frontend
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;