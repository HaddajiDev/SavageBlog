import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

import { UpdatePoster } from '../redux/PosterSlice';

function UpdatedPoster() {
    const location = useLocation();
    const navigate = useNavigate();
    const { state: post } = location;
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);

    const [title, setTitle] = useState(post.title);
    const [body, setBody] = useState(post.body);
    const [imageUrl, setImageUrl] = useState(post.imageUrl);
    const [newImage, setNewImage] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        setNewImage(e.target.files[0]);
    };

    const handleUpdate = async () => {
        if (!newImage && (!title || !body)) {
            Swal.fire('Error', 'Please provide a title and body together, or upload an image before submitting.', 'error');
            return;
        }

        setLoading(true);

        if (newImage) {
            const formData = new FormData();
            formData.append('file', newImage);
            formData.append('upload_preset', 'preset');

            try {
                const response = await axios.post(
                    `https://api.cloudinary.com/v1_1/dqkvgv7mh/image/upload`,
                    formData
                );

                const imageUrl = response.data.secure_url;
                handleUpdatePost(imageUrl);
            } catch (error) {
                setLoading(false);
                Swal.fire('Error', 'Error uploading image.', 'error');
                console.error('Error uploading image:', error);
            }
        } else {
            handleUpdatePost();
        }
    };

	useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleUpdatePost = async (uploadedImageUrl = '') => {
        const editedPost = {
            title,
            body,
            imageUrl: uploadedImageUrl || imageUrl,
			createdAt: Date.now(),
			updatedAt: true
        };

        if (!editedPost.imageUrl && (!editedPost.title || !editedPost.body)) {
            Swal.fire('Error', 'Please provide a title and body together, or upload an image before submitting.', 'error');
            setLoading(false);
            return;
        }
		if(editedPost.body.length > 300){
			Swal.fire('Error', 'Body reaches the limit of 300 caracteres', 'error');
            setLoading(false);
            return;
		}
		if(editedPost.title.length > 50){
			Swal.fire('Error', 'Title reaches the limit of 50 caracteres', 'error');
            setLoading(false);
            return;
		}

        try {
            await dispatch(UpdatePoster({ id: post._id, edited: editedPost }));
            setLoading(false);
            navigate(`/post/${post._id}`, { state: { ...post, ...editedPost } });
        } catch (error) {
            setLoading(false);
            Swal.fire('Error!', 'Failed to update post.', 'error');
            console.error('Failed to update post:', error);
        }
    };

    return (
        <div className='conti'>
<div className="post-card post-container">
            <h1>Update Post</h1>
            <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="post-input"
                />
            </div>
            <div className="form-group">
                <label htmlFor="body">Body</label>
                <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="post-textarea"
                ></textarea>
            </div>
            <div className="form-group">
                <label htmlFor="imageUrl">Image</label>
                <input
                    type="file"
                    id="imageUrl"
                    onChange={handleImageChange}
                    className="form-control"
                />
                {newImage ? (
                    <img src={URL.createObjectURL(newImage)} alt="New" className="img-fluid mt-2" />
                ) : (
                    imageUrl && <img src={imageUrl} alt="Current" className="img-fluid mt-2" />
                )}
            </div>
            {loading ? (
                <button className="btn btn-primary mt-3">
                    <i className="fa fa-spinner fa-pulse fa-2x fa-fw"></i>
                </button>
            ) : (
                <button onClick={handleUpdate} className="btn btn-primary mt-3">
                    Update Post
                </button>
            )}
			<button onClick={() => navigate('/')} className="btn btn-secondary mt-3">
                    cancel
            </button>
        </div>
        </div>
        
    );
}

export default UpdatedPoster;