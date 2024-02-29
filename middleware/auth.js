const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    // eslint-disable-next-line prefer-destructuring
    const userId = decodedToken.userId;
    req.auth = {
      // eslint-disable-next-line object-shorthand, comma-dangle
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
