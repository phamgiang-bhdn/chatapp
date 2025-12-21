const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/search', authMiddleware, userController.searchUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/status', authMiddleware, userController.updateStatus);

router.post('/:userId/follow', authMiddleware, userController.followUser);
router.delete('/:userId/follow', authMiddleware, userController.unfollowUser);
router.get('/:userId/followers', authMiddleware, userController.getFollowers);
router.get('/:userId/following', authMiddleware, userController.getFollowing);
router.get('/:userId/is-following', authMiddleware, userController.checkFollowing);

module.exports = router;
