import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { DislikePost, GetComments, GetPoster, LikePost } from '../redux/PosterSlice';
import { AddComment } from '../redux/CommentSlice';
import PostCard from './PostCard';

function PostPagee() {
    const location = useLocation();
    const { state: post } = location;
    const dispatch = useDispatch();
    const currentuser = useSelector((state) => state.user.user);
    const comments = useSelector((state) => state.poster.comments[post._id]) || [];
    const updatedPost = useSelector((state) => state.poster.poster);

    useEffect(() => {
        if (post?._id) {
            dispatch(GetComments(post._id));
            dispatch(GetPoster(post._id));
        }
    }, [dispatch, post]);

    const [comment, setComment] = useState('');

    const handleLike = async () => {
        if (currentuser) {
            try {
                await dispatch(LikePost({ id: post._id, userId: currentuser._id }));
                dispatch(GetPoster(post._id));
            } catch (error) {
                console.error('Failed to like post:', error);
            }
        }
    };

    const handleDislike = async () => {
        if (currentuser) {
            try {
                await dispatch(DislikePost({ id: post._id, userId: currentuser._id }));
                dispatch(GetPoster(post._id));
            } catch (error) {
                console.error('Failed to dislike post:', error);
            }
        }
    };

    const handleComment = async () => {
        if (comment.trim()) {
            try {
                await dispatch(AddComment({ id: post._id, user: { author: currentuser._id, body: comment } }));
                setComment('');
                dispatch(GetComments(post._id));
                dispatch(GetPoster(post._id));
            } catch (error) {
                console.error('Failed to add comment:', error);
            }
        } else {
            alert('Write a comment first');
        }
    };

    const generateAvatarUrl = (username) => {
        return `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}&flip=true&backgroundColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=solid,gradientLinear&backgroundRotation=0,10,20&shapeColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,transparent`;
    };

    const displayPost = updatedPost?._id === post._id ? updatedPost : post;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="post-page-container">            
            <PostCard post={post} check={"page"}/>
        </div>
    );
}

export default PostPagee;
