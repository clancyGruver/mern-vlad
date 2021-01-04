const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const config = require('config');

const PORT = config.get('port') || 5000;

const app = express();
app.use(express.json({ extended: true }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/link', require('./routes/links.routes'));
app.use('/t/', require('./routes/redirect.routes'));

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join(__dirname, 'client', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}

async function start() {
  try {
    await mongoose.connect(config.get('mongoUrl'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    app.listen(PORT,() => {
      app.get('/', (req, res) => {
        res.send('index page');
      })
    });
  } catch (error) {
    console.log('Server error: ', error.message);
    process.exit(1);
  }
}

start();
