import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Swal from 'sweetalert2';

import { PublishPoster } from '../redux/PosterSlice';
import { useNavigate } from 'react-router-dom';


function PostAPost() {
  const [TitleLength, setTittleLength] = useState(0);
  const [BodyLength, setBodyLength] = useState(0);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state.user.user);
  const [poster, setPoster] = useState({
    title: '',
    body: '',
    author: user ? user._id : '',
    imageUrl: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPoster((prevPoster) => ({
      ...prevPoster,
      [name]: value
    }));
    if(name == 'title'){
      setTittleLength(value.toString().length);
    }
    else{
      setBodyLength(value.toString().length);
    }
    
  };

  const handleImageUpload = async () => {
    const { title, body } = poster;

    if (!image && (!title || !body)) {
      Swal.fire('Error', 'Please provide a title and body together, or upload an image before submitting.', 'error');
      return;
    }

    setIsLoading(true);

    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', 'preset');

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/dqkvgv7mh/image/upload`,
          formData
        );

        const imageUrl = response.data.secure_url;
        setPoster((prevPoster) => ({
          ...prevPoster,
          imageUrl
        }));

        handleSubmitPost(imageUrl);
      } catch (error) {
        setIsLoading(false);
        Swal.fire('Error', 'Error uploading image.', 'error');
        console.error('Error uploading image:', error);
      }
    } else {
      handleSubmitPost();
    }
  };

  const handleSubmitPost = async (imageUrl = '') => {
    const updatedPoster = {
      ...poster,
      imageUrl
    };

    if (!updatedPoster.imageUrl && (!updatedPoster.title || !updatedPoster.body)) {
      Swal.fire('Error', 'Please provide a title and body together, or upload an image before submitting.', 'error');
      setIsLoading(false);
      return;
    }
    if(updatedPoster.body.length > 300){
			Swal.fire('Error', 'Body reaches the limit of 300 caracteres', 'error');
      setIsLoading(false);
            return;
		}
		if(updatedPoster.title.length > 50){
			Swal.fire('Error', 'Title reaches the limit of 50 caracteres', 'error');
      setIsLoading(false);
            return;
		}
    setIsLoading(true);
    await dispatch(PublishPoster(updatedPoster));
    setIsLoading(false);
    await sleep(500);
    window.location.reload();
    //navigate('/');


    setPoster({
      title: '',
      body: '',
      author: user ? user._id : '',
      imageUrl: ''
    });
    setImage(null);
    setTittleLength(0);
    setBodyLength(0);
    document.getElementById('fileInput').value = '';
  };
  
  return (
    <div className='conti'>
      <div className="post-container">
        <h1>Create Post</h1>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={poster.title}
          onChange={handleInputChange}
          className="post-input"
        />
        <div className='counterLength'>
          {TitleLength <= 50 ? <p>{TitleLength} / 50</p> : <p style={{color:'red'}}>{TitleLength} / 50</p>}
        </div>     
        
        <textarea
          name="body"
          placeholder={`What's on your mind? ${user.username}`}
          value={poster.body}
          onChange={handleInputChange}
          className="post-textarea"
        ></textarea>
        <div className='counterLength'>
          {BodyLength <= 300 ? <p>{BodyLength} / 300</p> : <p style={{color:'red'}}>{BodyLength} / 300</p>}
        </div>
        
        <div className="custom-file-input">
          <label htmlFor="fileInput">Choose image</label>
        </div>
        <input
          type="file"
          id="fileInput"
          onChange={handleImageChange}
          className="post-file-input"
        />
        {image && <img src={URL.createObjectURL(image)} alt="Preview" className="post-image-preview" />}
        <button onClick={handleImageUpload} className="post-button" disabled={isLoading}>
          {isLoading ? <i class="fa fa-spinner fa-pulse fa-2x fa-fw fa-lg"></i> : 'Post'}
        </button>
      </div>
    </div>
    
  );
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export default PostAPost;
