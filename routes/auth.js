const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Kullanıcı Kaydı
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Email kontrolü
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Kullanıcı zaten mevcut' });
    }

    // Yeni kullanıcı oluşturma
    user = new User({
      name,
      email,
      password,
      preferences: ['general'] // Varsayılan kategori
    });

    // Şifre hashleme
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // JWT token oluşturma
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Giriş
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcı kontrolü
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Geçersiz kimlik bilgileri' });
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Geçersiz kimlik bilgileri' });
    }

    // JWT token oluşturma
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 