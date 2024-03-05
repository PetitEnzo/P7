const sharp = require('sharp');

const imageMiddleware = (req, res, next) => {
  if (req.file && req.file.buffer) {
    sharp(req.file.buffer)
      .resize({ width: 206, height: 260 })
      .toBuffer()
      .then((data) => {
        req.file.buffer = data;
        next();
      })
      .catch((err) => {
        console.error('Error processing image:', err);
        res.status(500).json({ error: 'Error processing image' });
      });
  } else {
    next();
  }
};

module.exports = imageMiddleware;
