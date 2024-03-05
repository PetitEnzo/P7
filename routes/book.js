const express = require('express');

const router = express.Router();
const bookCtrl = require('../controllers/book');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sharpMiddleware = require('../middleware/imageMiddleware');

router.post('/', auth, multer, bookCtrl.createBook);

router.get('/', bookCtrl.getAllBooks);

router.get('/bestrating', bookCtrl.bestRating);

router.get('/:id', bookCtrl.getOneBook);

router.post('/:id/rating', auth, bookCtrl.addRating);

router.put('/:id', auth, multer, bookCtrl.modifyBook);

router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;
