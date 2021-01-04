const { Router } = require('express');
const bcrypt = require('bcryptjs');
const router = Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const config = require('config');

router.post(
  '/register',
  [
    check('email', 'Неверный email').isEmail(),
    check('password', 'Минимальная длина пароля- 6 символов').isLength({ min: 6 }),

  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors,
          message: 'Неверные данные'
        });
      }

      const { email, password } = req.body;
      const candidate = await User.findOne({ email });

      if (candidate) {
        return res.status(400).json({message: 'Такой пользователь уже существует'});
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        password: hashedPassword
      });
      await user.save();
      res.status(201).json({ message: 'Пользователь создан' });
    } catch (error) {
      res.status(500).json({message: 'Попробуйте позже'});
    }
});

router.post(
  '/login',[
    check('email', 'Неверный email').normalizeEmail().isEmail(),
    check('password', 'Введите пароль').exists(),
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors,
        message: 'Неверные данные',
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'пользователь не найден' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Неверный пароль' });
    }

    const token = jwt.sign(
      { userId: user.id },
      config.get('JWTSecret'),
      { expiresIn: '1h' }
    );

    res.json({
      token,
      userId: user.id,
    })

  } catch (error) {
    res.status(500).json({message: 'Попробуйте позже'});
  }
});

module.exports = router;