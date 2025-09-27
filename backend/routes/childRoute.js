const express = require('express');
const router = express.Router();
const { getChildByChildId, updateChildByChildId } = require('../controllers/childController');

// GET /children/:childId
router.get('/:childId', getChildByChildId);

// PUT /children/:childId
router.put('/:childId', updateChildByChildId);

module.exports = router;
