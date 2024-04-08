const fs = require('fs');

const Book = require('../Models/Book');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject.userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
  });
  book
    .save()
    .then(() => {
      res.status(201).json({ message: 'Livre enregistré !' });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const bookObject = req.file
        ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${
              req.file.filename
            }`,
          }
        : { ...req.body };

      delete bookObject._userId;

      if (req.file) {
        const oldBookName = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${oldBookName}`, (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: err });
          }
          updateBook(req, res, bookObject);
        });
      } else {
        updateBook(req, res, bookObject);
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

function updateBook(req, res, bookObject) {
  Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Livre modifié!' }))
    .catch((error) => res.status(400).json({ error }));
}

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'Livre supprimé !' });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

exports.addRating = (req, res, next) => {
  const rating = {
    userId: req.auth.userId,
    grade: Number(req.body.rating),
  };

  Book.findById(req.params.id)
    .then((book) => {
      const existingRating = book.ratings.find(
        (r) => r.userId === req.auth.userId
      );
      if (existingRating) {
        return res
          .status(403)
          .json({ message: 'Vous avez déjà noté ce livre' });
      }

      book.ratings.push(rating);

      const totalRating = book.ratings.reduce(
        (acc, rating) => acc + rating.grade,
        0
      );
      book.averageRating = parseFloat(
        (totalRating / book.ratings.length).toFixed(2)
      );

      book
        .save()
        .then((updatedBook) => res.status(201).json(updatedBook))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.bestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((book) => res.status(201).json(book))
    .catch((error) => res.status(401).json({ error }));
};
