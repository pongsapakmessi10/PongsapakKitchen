const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. ดึง Token มาจาก Header (x-auth-token)
  const token = req.header('x-auth-token');

  // 2. ถ้าไม่มี Token -> ไล่กลับไป
  if (!token) {
    return res.status(401).json({ msg: 'ไม่มีสิทธิ์เข้าถึง กรุณาล็อกอิน' });
  }

  // 3. ถ้ามี -> ตรวจสอบว่า Token ของจริงไหม
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // เก็บข้อมูล User ไว้ใน req เพื่อเอาไปใช้ต่อ
    next(); // ปล่อยผ่านไปทำงานต่อ
  } catch (err) {
    res.status(401).json({ msg: 'Token ไม่ถูกต้อง' });
  }
};