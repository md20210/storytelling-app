// backend/src/routes/chapters.js
const express = require('express');
const chapterController = require('../controllers/chapterController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Chapter routes
router.get('/books/:bookId/chapters', chapterController.getChapters);                    // GET /api/chapters/books/:bookId/chapters
router.post('/books/:bookId/chapters', chapterController.createChapter);                 // POST /api/chapters/books/:bookId/chapters
router.get('/books/:bookId/chapters/:chapterId', chapterController.getChapter);          // GET /api/chapters/books/:bookId/chapters/:chapterId
router.put('/books/:bookId/chapters/:chapterId', chapterController.updateChapter);       // PUT /api/chapters/books/:bookId/chapters/:chapterId
router.delete('/books/:bookId/chapters/:chapterId', chapterController.deleteChapter);    // DELETE /api/chapters/books/:bookId/chapters/:chapterId

// Chapter AI-powered actions
router.post('/books/:bookId/chapters/:chapterId/enhance', chapterController.enhanceChapter);        // POST /api/chapters/books/:bookId/chapters/:chapterId/enhance
router.post('/books/:bookId/chapters/:chapterId/integrate', chapterController.integrateThought);    // POST /api/chapters/books/:bookId/chapters/:chapterId/integrate
router.post('/books/:bookId/chapters/:chapterId/summary', chapterController.generateSummary);       // POST /api/chapters/books/:bookId/chapters/:chapterId/summary

module.exports = router;