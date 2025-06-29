// backend/src/routes/books.js
const express = require('express');
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Book routes
router.get('/', bookController.getBooks);                    // GET /api/books
router.post('/', bookController.createBook);                 // POST /api/books
router.get('/:bookId', bookController.getBook);              // GET /api/books/:bookId
router.put('/:bookId', bookController.updateBook);           // PUT /api/books/:bookId
router.delete('/:bookId', bookController.deleteBook);        // DELETE /api/books/:bookId

// Book-specific actions
router.post('/:bookId/summary', bookController.generateBookSummary);  // POST /api/books/:bookId/summary
router.get('/:bookId/stats', bookController.getBookStats);            // GET /api/books/:bookId/stats

module.exports = router;