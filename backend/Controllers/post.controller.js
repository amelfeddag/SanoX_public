import { pool } from '../DB/connect.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { extractPublicId, deleteImageFromCloudinary } from './Utils/cloudinaryDelete.js';
import HttpStatus from 'http-status-codes';

dotenv.config();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create a post
const createPost = async (req, res) => {
    const { user_id, post_title, post_content, post_type, post_image } = req.body;
    try {
        let postImageUrl = post_image;

        if (post_image) {
            const uploadResult = await cloudinary.uploader.upload(post_image, {
                folder: 'Agrisistance/Posts-Pictures',
            });
            postImageUrl = uploadResult.secure_url;
        }

        pool.query(
            `INSERT INTO posts (user_id, post_title, post_content, post_type, post_image) 
            VALUES (?, ?, ?, ?, ?)`,
            [user_id, post_title, post_content, post_type, postImageUrl],
            (error, results) => {
                if (error) {
                    console.error('Error creating post:', error);
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                        timestamp: new Date().toISOString(),
                        path: '/createPost',
                        message: 'Failed to create post.',
                    });
                }
                res.status(HttpStatus.OK).json({ message: 'Post created successfully', post_id: results.insertId });
            }
        );
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: '/createPost',
            message: 'Failed to create post.',
        });
    }
};

// Update a post
const updatePost = async (req, res) => {
    const { post_id, user_id, post_title, post_content, post_type, post_image } = req.body;
    try {
        pool.query(
            `SELECT * FROM posts WHERE post_id = ? AND user_id = ?`,
            [post_id, user_id],
            async (error, results) => {
                if (error || results.length === 0) {
                    return res.status(HttpStatus.NOT_FOUND).json({
                        statusCode: HttpStatus.NOT_FOUND,
                        timestamp: new Date().toISOString(),
                        path: '/updatePost',
                        message: 'Post not found for the user.',
                    });
                }

                let updatedImageUrl = post_image;
                if (post_image) {
                    const existingImage = results[0].post_image;
                    if (existingImage) {
                        const publicId = extractPublicId(existingImage);
                        if (publicId) {
                            await deleteImageFromCloudinary(publicId, 'Posts-Pictures');
                        }
                    }

                    const uploadResult = await cloudinary.uploader.upload(post_image, {
                        folder: 'Agrisistance/Posts-Pictures',
                    });
                    updatedImageUrl = uploadResult.secure_url;
                }

                pool.query(
                    `UPDATE posts SET post_title = ?, post_content = ?, post_type = ?, post_image = ? 
                    WHERE post_id = ?`,
                    [post_title, post_content, post_type, updatedImageUrl, post_id],
                    (error) => {
                        if (error) {
                            console.error('Error updating post:', error);
                            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                                timestamp: new Date().toISOString(),
                                path: '/updatePost',
                                message: 'Failed to update post.',
                            });
                        }
                        res.status(HttpStatus.OK).json({ message: 'Post updated successfully' });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: '/updatePost',
            message: 'Failed to update post.',
        });
    }
};

// Archive a post
const archivePost = async (req, res) => {
    const { post_id } = req.body;
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM posts WHERE post_id = $1', [post_id]);

        if (result.rows.length === 0) {
            return res.status(HttpStatus.NOT_FOUND).json({
                statusCode: HttpStatus.NOT_FOUND,
                timestamp: new Date().toISOString(),
                path: '/archivePost',
                message: 'Post not found.',
            });
        }

        await client.query('UPDATE posts SET is_active = false WHERE post_id = $1', [post_id]);

        res.status(HttpStatus.OK).json({ message: 'Post archived successfully' });
    } catch (error) {
        console.error('Error archiving post:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: '/archivePost',
            message: 'Failed to archive post.',
        });
    } finally {
        client.release();
    }
};

// Delete a post
const deletePost = async (req, res) => {
    const { post_id } = req.body;
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM posts WHERE post_id = $1', [post_id]);

        if (result.rows.length === 0) {
            return res.status(HttpStatus.NOT_FOUND).json({
                statusCode: HttpStatus.NOT_FOUND,
                timestamp: new Date().toISOString(),
                path: '/deletePost',
                message: 'Post not found.',
            });
        }

        const existingImage = result.rows[0].post_image;
        if (existingImage) {
            const publicId = extractPublicId(existingImage);
            if (publicId) {
                await deleteImageFromCloudinary(publicId, 'Posts-Pictures');
            }
        }

        await client.query('DELETE FROM posts WHERE post_id = $1', [post_id]);

        res.status(HttpStatus.OK).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: '/deletePost',
            message: 'Failed to delete post.',
        });
    } finally {
        client.release();
    }
};

// Unarchive a post
const unarchivePost = async (req, res) => {
    const { post_id } = req.body;
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM posts WHERE post_id = $1', [post_id]);

        if (result.rows.length === 0) {
            return res.status(HttpStatus.NOT_FOUND).json({
                statusCode: HttpStatus.NOT_FOUND,
                timestamp: new Date().toISOString(),
                path: '/unarchivePost',
                message: 'Post not found.',
            });
        }

        await client.query('UPDATE posts SET is_active = true WHERE post_id = $1', [post_id]);

        res.status(HttpStatus.OK).json({ message: 'Post unarchived successfully' });
    } catch (error) {
        console.error('Error unarchiving post:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: '/unarchivePost',
            message: 'Failed to unarchive post.',
        });
    } finally {
        client.release();
    }
};

// Get my posts
const getMyPosts = async (req, res) => {
    const { user_id } = req.params;
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT p.*, u.user_id, u.first_name, u.last_name, u.country, u.phone_number, u.profile_picture 
            FROM posts p 
            JOIN users u ON p.user_id = u.user_id 
            WHERE p.user_id = $1`,
            [user_id]
        );
        res.status(HttpStatus.OK).json(result.rows);
    } catch (error) {
        console.error('Error fetching my posts:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: '/getMyPosts',
            message: 'Failed to fetch posts.',
        });
    } finally {
        client.release();
    }
};

// Get all posts
const getAllPosts = async (req, res) => {
    const { user_id } = req.params;
    const client = await pool.connect();
    try {
        const seenPostsRes = await client.query('SELECT post_id FROM user_seen_posts WHERE user_id = $1', [user_id]);
        const seenPostIds = seenPostsRes.rows.map(row => row.post_id);

        const postsRes = await client.query(
            `SELECT p.*, u.user_id, u.first_name, u.last_name, u.country, u.phone_number, u.profile_picture 
            FROM posts p 
            JOIN users u ON p.user_id = u.user_id 
            WHERE p.is_active = true`
        );

        const posts = postsRes.rows.map(post => ({
            ...post,
            seen: seenPostIds.includes(post.post_id)
        }));

        res.status(HttpStatus.OK).json(posts);
    } catch (error) {
        console.error('Error fetching all posts:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: '/getAllPosts',
            message: 'Failed to fetch posts.',
        });
    } finally {
        client.release();
    }
};

// Mark post as seen
const markPostAsSeen = async (req, res) => {
    const { user_id, post_id } = req.body;
    try {
        await pool.query('INSERT INTO user_seen_posts (user_id, post_id) VALUES ($1, $2)', [user_id, post_id]);
        res.status(HttpStatus.OK).json({ message: 'Post marked as seen' });
    } catch (error) {
        console.error('Error marking post as seen:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: '/markPostAsSeen',
            message: 'Failed to mark post as seen.',
        });
    }
};

export {
    createPost,
    updatePost,
    archivePost,
    deletePost,
    unarchivePost,
    getMyPosts,
    getAllPosts,
    markPostAsSeen
};
