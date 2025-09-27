const express = require('express');
const router = express.Router();
const { getChildByChildId, updateChildByChildId, listChildrenByParent } = require('../controllers/childController');

// GET /children/by-parent?parent=Name
router.get('/by-parent/list', listChildrenByParent);

// GET /children/:childId
router.get('/:childId', getChildByChildId);

// PUT /children/:childId
router.put('/:childId', updateChildByChildId);

module.exports = router;
