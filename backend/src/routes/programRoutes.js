const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const auth = require('../middleware/authMiddleware');

router.get('/', programController.getAllPrograms);
router.get('/timetable/all', programController.getTimetable);
router.get('/upcoming', programController.getUpcomingPrograms);
router.post('/', auth, programController.createProgram);
router.put('/reorder', auth, programController.reorderPrograms);
router.put('/:id', auth, programController.updateProgram);
router.patch('/:id/feature', auth, programController.toggleFeatured);
router.delete('/:id', auth, programController.deleteProgram);
router.patch(..:id/toggle-active., auth, programController.toggleProgramActive);router.get('/:identifier', programController.getProgramByIdOrSlug);

module.exports = router;
