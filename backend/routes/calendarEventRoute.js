const express = require('express');
const router = express.Router();
const { createEvent, listEvents, updateEvent, deleteEvent } = require('../controllers/calendarEventController');

// Create a calendar event
router.post('/events', createEvent);

// List events in a date range (optional)
router.get('/events', listEvents);

// Update an event
router.put('/events/:id', updateEvent);

// Delete an event
router.delete('/events/:id', deleteEvent);

module.exports = router;
