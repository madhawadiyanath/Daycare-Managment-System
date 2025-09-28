const CalendarEvent = require('../models/CalendarEvent');

// POST /calendar/events
async function createEvent(req, res) {
  try {
    const { title, date, description, childId, createdBy } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: 'date is required' });
    }
    const evt = await CalendarEvent.create({
      title: String(title).trim(),
      date: new Date(date),
      description: description ? String(description).trim() : '',
      childId: childId ? String(childId).trim() : undefined,
      createdBy: createdBy || undefined,
    });
    return res.status(201).json({ success: true, data: evt });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// GET /calendar/events?from=YYYY-MM-DD&to=YYYY-MM-DD
async function listEvents(req, res) {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    const events = await CalendarEvent.find(filter).sort({ date: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: events });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /calendar/events/:id
async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, date, description, childId } = req.body;
    const evt = await CalendarEvent.findById(id);
    if (!evt) return res.status(404).json({ success: false, message: 'Event not found' });
    if (typeof title !== 'undefined') evt.title = String(title).trim();
    if (typeof date !== 'undefined') evt.date = new Date(date);
    if (typeof description !== 'undefined') evt.description = String(description).trim();
    if (typeof childId !== 'undefined') evt.childId = String(childId).trim();
    await evt.save();
    return res.status(200).json({ success: true, data: evt });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /calendar/events/:id
async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const evt = await CalendarEvent.findByIdAndDelete(id);
    if (!evt) return res.status(404).json({ success: false, message: 'Event not found' });
    return res.status(200).json({ success: true, data: evt });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { createEvent, listEvents, updateEvent, deleteEvent };
