import express from 'express';
import {
    createPost,
    updatePost,
    archivePost,
    deletePost,
    unarchivePost,
    getMyPosts,
    getAllPosts,
    markPostAsSeen
} from '../Controllers/post.controller.js';
import authenticateUser from '../Middleware/authMiddleware.js';

const router = express.Router();

// Route to create a post
router.post('/create-post', authenticateUser, createPost);

// Route to update a post
router.put('/update-post', authenticateUser, updatePost);

// Route to archive a post
router.patch('/archive-post', authenticateUser, archivePost);

// Route to delete a post
router.delete('/delete-post', authenticateUser, deletePost);

// Route to unarchive a post
router.patch('/unarchive-post', authenticateUser, unarchivePost);

// Route to get posts for a specific user
router.get('/my-posts/:user_id', authenticateUser, getMyPosts);

// Route to get all posts
router.get('/all-posts/:user_id', authenticateUser, getAllPosts);

// Route to mark a post as seen
router.post('/mark-post-as-seen', authenticateUser, markPostAsSeen);

export default router;
