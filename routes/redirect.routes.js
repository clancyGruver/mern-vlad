const { Router } = require('express');
const Link = require('../models/Link');
const router = Router();

router.get('/:code', async (req, res) => {
  try {
    const link = await Link.findOne({ code: req.params.code});

    if (link) {
      link.clickCount += 1;
      await link.save();
      return res.redirect(link.from);
    }
    return res.status(404).json({ message: 'Ссылка не найдена'});
  } catch (error) {
    res.status(500).json({message: 'Что-от пошло не так. Попробуйте позже.'});
  }
});

module.exports = router;