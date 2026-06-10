const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const auth = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/authMiddleware');

router.get('/', programController.getAllPrograms);
router.get('/timetable/all', programController.getTimetable);
router.get('/upcoming', programController.getUpcomingPrograms);
router.post('/', auth, requirePermission('programs'), programController.createProgram);
router.put('/reorder', auth, requirePermission('programs'), programController.reorderPrograms);
router.put('/:id', auth, requirePermission('programs'), programController.updateProgram);
router.patch('/:id/feature', auth, requirePermission('programs'), programController.toggleFeatured);
router.delete('/:id', auth, requirePermission('programs'), programController.deleteProgram);
router.patch('/:id/toggle-active', auth, requirePermission('programs'), programController.toggleProgramActive);
router.get('/:identifier', programController.getProgramByIdOrSlug);

module.exports = router;
