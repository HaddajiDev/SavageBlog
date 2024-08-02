import React, { useEffect, useState, forwardRef  } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeletePoster, DislikePost, GetComments, LikePost, UpdatePoster } from '../redux/PosterSlice';
import { AddComment } from '../redux/CommentSlice';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import CommentDropDown from './CommentDropDown';
import { clearPosters } from '../redux/UserPostsSlice';

function PostCard({ post, check, refreshPosts }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentuser = useSelector((state) => state.user.user);
    const comments = useSelector((state) => state.poster.comments[post._id]) || [];

    const [ping, setping] = useState(false);
    

    const [comment, setComment] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const [dropdownVisibleC, setDropdownVisibleC] = useState(false);
    const [loading, setLoading] = useState(false);


    const handleLike = async () => {
        if (currentuser) {
            try {
                await dispatch(LikePost({ id: post._id, userId: currentuser._id }));
                refreshPosts(0);
            } catch (error) {
                console.error('Failed to like post:', error);
            }
        }
    };

    const handleDislike = async () => {
        if (currentuser) {
            try {
                await dispatch(DislikePost({ id: post._id, userId: currentuser._id }));
                refreshPosts(0);
            } catch (error) {
                console.error('Failed to dislike post:', error);
            }
        }
    };

    useEffect(() => {
        if (post.comments?.length > 0) {
            dispatch(GetComments(post._id));
        }
    }, [dispatch, ping]);

    const [commentLength, setCommentLength] = useState(0);
    const handleComment = async () => {
        if(commentLength > 100){
            setLoading(false);
            Swal.fire('Error', 'Comment reaches the limit of 100 caracteres.', 'error');
            return;
        }
        if (comment.trim()) {
            try {
                setLoading(true);
                await dispatch(AddComment({ id: post._id, user: { author: currentuser._id, body: comment } }));
                setLoading(false);
                setComment('');
                setping(!ping);
                if(comments.length == 0 || comments.length == 1){                    
                    navigate(`/post/${post._id}`, { state: post }); 
                }
                
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

    
    const commentSliced = comments.slice(-2).reverse();

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };
    const location = useLocation();
    const handleDelete = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to delete this post? This process cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {                
                try {
                    await dispatch(DeletePoster(post._id));
                    toggleDropdown();
                    refreshPosts(1);
                    if(location.pathname == '/profile'){
                        window.location.reload();
                    }
                    Swal.fire(
                        'Deleted!',
                        'Your post has been deleted.',
                        'success'
                    );
                } catch (error) {
                    Swal.fire(
                        'Error!',
                        'There was an error deleting your post.',
                        'error'
                    );
                    console.error('Failed to delete post:', error);
                }
            }
        });
    };

    const handleReport = () => {
        Swal.fire({
            title: 'Report post?',
            text: "Do you really want to report this post ?.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, report it!'
        }).then((result) => {
            if (result.isConfirmed) {                
                try {                    
                    toggleDropdown();
                    Swal.fire(
                        'Reported!',
                        'Post reported',
                        'success'
                    );
                } catch (error) {
                    Swal.fire(
                        'Error!',
                        'There was an error report the post.',
                        'error'
                    );                    
                }
            }
        });
    }

    const handleEdit = async() => {
        Swal.fire({
            title: 'Edit post?',
            text: "Do you really want to edit this post ?.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.isConfirmed) {                
                try {                    
                    toggleDropdown();
                    navigate('/updatePost', { state: post });                   

                } catch (error) {
                    Swal.fire(
                        'Error!',
                        'There was an error report the post.',
                        'error'
                    );
                }
            }
        });
    }

    

    const [visibleDropdowns, setVisibleDropdowns] = useState({});

    const toggleDropdown_2 = (id) => {
        setVisibleDropdowns((prevState) => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };
    
    
    return (
        <div className="post-card">
            <div className="pr-author">
                <Link style={{ all: 'unset', cursor: 'pointer' }} to={`/profile/${post.author?.username}`} state={post.author}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {post.author?.profileImageUrl ? (
                            <img src={post.author.profileImageUrl} className="pr_image" alt={post.author?.username} />
                        ) : (
                            <img src={generateAvatarUrl(post.author?.username)} className="pr_image" alt={post.author?.username} />
                        )}
                        <h6>{post.author?.username}</h6>
                    </div>
                </Link>
                
                <div>
                    <p style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {post.updatedAt ? <>updated {timeFromNow(post.createdAt)}</> : timeFromNow(post.createdAt)}
                        <i 
                            style={{ cursor: 'pointer' }} 
                            onClick={toggleDropdown}
                            className="fa fa-ellipsis-h fa-lg" 
                            aria-hidden="true"></i>
                    </p>
                    {dropdownVisible && (
                        <div className="dropdown-menu_">                        
                        {currentuser.isAdmin ? (
                            <>
                                <button onClick={handleDelete}><i className="fa-solid fa-trash"></i> Delete</button>
                                <button onClick={handleEdit}><i className="fa-solid fa-pen"></i> Edit</button>
                            </>
                        ) : (
                            
                            currentuser.posts.some(userPost => userPost.postId.toString() === post._id.toString()) ? (
                                <>
                                    <button onClick={handleEdit}><i className="fa-solid fa-pen"></i> Edit</button>
                                    <button onClick={handleDelete}><i className="fa-solid fa-trash"></i> Delete</button>
                                </>
                            ) : (
                                <button onClick={handleReport}><i className="fa fa-flag" aria-hidden="true"></i> Report</button>
                            )
                        )}
                        </div>
                    )}
                </div>
            </div>
            <Link to={`/post/${post._id}`} state={post} style={{ all: 'unset', cursor: 'pointer' }}>
                <h1>{post.title}</h1>
                <p>{post.body}</p>
                {post.imageUrl ? <img src={post.imageUrl} alt="" className="img-fluid" /> : null}
            </Link>
            
            <div className="likesContainer">
                <div className="btnContainer">
                    <button onClick={handleLike} className="btn btn-primary">
                        <i className="fa fa-thumbs-up" aria-hidden="true"></i>{post.likes}
                    </button>
                </div>
                <div className="btnContainer">
                    <button onClick={handleDislike} className="btn btn-danger">
                        <i className="fa fa-thumbs-down" aria-hidden="true"></i>{post.dislikes}
                    </button>
                </div>
            </div>

            <p className="mt-2">Comments</p>
            <div className="comments-section">
            {check === "check" ?
                comments.length > 0 ? comments.slice(-2).reverse().map((el) => (
                    <div className="comment" key={el._id}>                        
                        <div>
                            <Link 
                                style={{ all: 'unset', cursor: 'pointer' }} 
                                to={`/profile/${el.username}`} 
                                state={{ _id: el.authorId, profileImageUrl: el.profileImageUrl, username: el.username, bio: el.bio, friendInvitation: el.friendInvitation, friends: el.friends }}
                                onClick={() => dispatch(clearPosters())}
                            >
                                {console.log(el)}
                                {el.profileImageUrl ? (
                                    <img src={el.profileImageUrl} alt={el.username} />
                                ) : (
                                    <img src={generateAvatarUrl(el.username)} alt={el.username} />
                                )}
                            </Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Link 
                                    style={{ all: 'unset', cursor: 'pointer', width: '50%' }} 
                                    to={`/profile/${el.username}`} 
                                    state={{ _id: el.authorId, profileImageUrl: el.profileImageUrl, username: el.username, bio: el.bio, friendInvitation: el.friendInvitation, friends: el.friends }}
                                    onClick={() => dispatch(clearPosters())}
                                >
                                    <div>
                                        <p className='comment_author'>{el.username}</p>                                        
                                    </div>
                                </Link>
                                <p style={{ fontSize: '12px' }}>{timeFromNow(el.createdAt)}</p>
                                <i 
                                    style={{ cursor: 'pointer', marginBottom: '10px' }} 
                                    onClick={() => toggleDropdown_2(el._id)}
                                    className="fa fa-ellipsis-h fa-lg" 
                                    aria-hidden="true">
                                </i>
                            </div>

                            <h1>{el.body}</h1>
                            {visibleDropdowns[el._id] && (
                                <CommentDropDown
                                    post={post}
                                    comment={el}
                                    currentuser={currentuser}
                                />
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="noComment"><p>No comments</p></div>
                )
            :
                comments ? comments.map((el) => (
                    <div className="comment" key={el._id}>
                        <div>
                            <Link 
                                style={{ all: 'unset', cursor: 'pointer' }} 
                                to={`/profile/${el.username}`} 
                                state={{ _id: el.authorId, profileImageUrl: el.profileImageUrl, username: el.username, bio: el.bio, friendInvitation: el.friendInvitation, friends: el.friends }}
                                onClick={() => dispatch(clearPosters())}
                            >
                                {el.profileImageUrl ? (
                                    <img src={el.profileImageUrl} alt={el.username} />
                                ) : (
                                    <img src={generateAvatarUrl(el.username)} alt={el.username} />
                                )}
                            </Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <Link 
                                    style={{ all: 'unset', cursor: 'pointer', width: '50%' }} 
                                    to={`/profile/${el.username}`} 
                                    state={{ _id: el.authorId, profileImageUrl: el.profileImageUrl, username: el.username, bio: el.bio }}
                                    onClick={() => dispatch(clearPosters())}
                                >
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <p className='comment_author'>{el.username}</p>
                                        <p style={{ fontSize: '10px'}}>{timeFromNow(el.createdAt)}</p>
                                    </div>
                                </Link>
                                <i 
                                    style={{ cursor: 'pointer', marginBottom: '10px' }} 
                                    onClick={() => toggleDropdown_2(el._id)}
                                    className="fa fa-ellipsis-h fa-lg" 
                                    aria-hidden="true">
                                </i>
                            </div>
                            
                            <h1>{el.body}</h1>
                            {visibleDropdowns[el._id] && (
                                <CommentDropDown 
                                    post={post}
                                    comment={el}
                                    currentuser={currentuser}
                                />                   
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="noComment"><p>No comments</p></div>
                )
            }
            </div>

            <div className="comment-field">
                <input
                    type="text"
                    placeholder="Leave a comment"
                    value={comment}
                    onChange={(e) => {setComment(e.target.value); setCommentLength(e.target.value.length)}}
                />
                <button onClick={handleComment} style={{ all: 'unset' }}>
                    {!loading ? <i className="fa fa-paper-plane" aria-hidden="true"></i> : <i class="fa fa-spinner fa-pulse fa-2x fa-fw fa-lg"></i>}
                </button>
            </div>
            <div className='counterLength commentCounter'>
                {commentLength <= 100 ? <p>{commentLength} / 100</p> : <p style={{color:'red'}}>{commentLength} / 100</p>}
            </div>

            {check == "check" ? comments.length > 2 && (
                <Link className="mt-2" to={`/post/${post._id}`} state={post}>View all comments</Link>
            ): <></>}
            
        </div>
    );
}



export default PostCard;


export function timeFromNow(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.abs(now - date);

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
        return "just now";
    } else if (minutes < 60) {
        return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (weeks < 4) {
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (months < 12) {
        return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }
}
