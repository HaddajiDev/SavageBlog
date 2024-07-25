import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { DislikePost, GetComments, GetPoster, LikePost } from '../redux/PosterSlice';
import { AddComment } from '../redux/CommentSlice';
import PostCard, { timeFromNow } from './PostCard';
import CommentDropDown from './CommentDropDown';

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
            {/* <div className="post-card">
                <div className='pr-author'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {displayPost.author.profileImageUrl ? (
                            <img src={displayPost.author.profileImageUrl} className='pr_image' alt={displayPost.author.username} />
                        ) : (
                            <img src={generateAvatarUrl(displayPost.author.username)} className='pr_image' alt={displayPost.author.username} />
                        )}
                        <h6>{displayPost.author.username}</h6>
                    </div>
                    <div>
                        <p style={{ fontSize: '12px' }}>{displayPost.updatedAt ? <>updated {timeFromNow(displayPost.createdAt)}</> : timeFromNow(post.createdAt)}</p>
                    </div>
                </div>
                <h1>{displayPost.title}</h1>
                <p>{displayPost.body}</p>
                {displayPost.imageUrl ? <img src={displayPost.imageUrl} alt="" className="img-fluid" /> : null}
                <div className='likesContainer'>
                    <div className='btnContainer'>
                        <button onClick={handleLike} className="btn btn-primary">
                            <i className="fa fa-thumbs-up" aria-hidden="true"></i>{displayPost.likes}
                        </button>
                    </div>
                    <div className='btnContainer'>
                        <button onClick={handleDislike} className="btn btn-danger">
                            <i className="fa fa-thumbs-down" aria-hidden="true"></i>{displayPost.dislikes}
                        </button>
                    </div>
                </div>

                <p className='mt-2'>Comments</p>
                <div className='comments-section'>
                    {comments.length > 0 ? comments.slice().reverse().map((el) => (
                        <div className='comment' key={el._id}>
                            <div>
                                {el.profileImageUrl ? (
                                    <img src={el.profileImageUrl} alt={el.username} />
                                ) : (
                                    <img src={generateAvatarUrl(el.username)} alt={el.username} />
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <p>{el.username}</p>
                                    <p style={{ fontSize: '12px' }}>{timeFromNow(el.createdAt)}</p>
                                </div>
                                <h1>{el.body}</h1>
                            </div>
                            
                        </div>
                    )) : (
                        <div className='noComment'><p>No comments</p></div>
                    )}
                </div>

                <div className='comment-field'>
                    <input
                        type='text'
                        placeholder='Leave a comment'
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <button onClick={handleComment} style={{ all: 'unset' }}>
                        <i className="fa fa-paper-plane" aria-hidden="true"></i>
                    </button>
                </div>
            </div> */}
            <PostCard post={post} check={"page"}/>
        </div>
    );
}

export default PostPagee;
