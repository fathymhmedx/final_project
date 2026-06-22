const express = require('express');
const router = express.Router();

const postRoutes = require('./posts/posts.routes');
const commentRoutes = require('./comments/comments.routes');
const chatRoutes = require('./chat/chat.routes');
const notificationRoutes = require('./notifications/notifications.routes');

router.use('/posts', postRoutes);
router.use('/', commentRoutes); // comments routes handle both /posts/:postId/comments and /comments/:id
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
