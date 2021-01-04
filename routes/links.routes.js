const { Router } = require('express');
const Link = require('../models/Link');
const auth = require('../middleware/auth.middleware');
const config = require('config');
const shortid = require('shortid');

const router = Router();

router.post('/generate', auth, async (req, res) => {
  try {

    const baseUrl = config.get('baseUrl');
    const { from } = req.body;

    const exist = await Link.findOne({ from });
    if (exist) {
      res.json({link: exist});
    }

    const code = shortid.generate();
    const to = `${baseUrl}/t/${code}`;
    const link = new Link({
      code,
      to,
      from,
      owner: req.user.userId,
    })

    await link.save();

    res.status(201).json({ link });

  } catch (error) {
    res.status(500).json({message: 'Что-от пошло не так. Попробуйте позже.'});
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const links = await Link.find({owner: req.user.userId,});
    res.json(links);
  } catch (error) {
    res.status(500).json({message: 'Что-от пошло не так. Попробуйте позже.'});
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    res.json(link);
  } catch (error) {
    res.status(500).json({message: 'Что-от пошло не так. Попробуйте позже.'});
  }
});

module.exports = router;
