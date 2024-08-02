import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GetUserPosts, UpdateUser } from '../redux/UserSlice';
import PostCard from './PostCard';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

function Profile() {
  const currentuser = useSelector((state) => state.user.user);
  const posts = useSelector((state) => state.user.posts);
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [ping, setPing] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      if (currentuser) {
        setLoading(true);
        try {
          const result = await dispatch(GetUserPosts({ id: currentuser._id, page }));
          const fetchedPosts = result.payload;

          if (fetchedPosts.length < pageSize) {
            setHasMore(false);
          }
        } catch (error) {
          console.error('Failed to fetch posts:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPosts();
  }, [dispatch, currentuser?._id, page, ping]);

  const loadMorePosts = () => {
    if (hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const refreshPosts = async () => {
    setPage(1);
    dispatch(GetUserPosts({ id: currentuser._id, page: 1 }));   
  };

  const [imgUrl, setAvatar] = useState('');

  useEffect(() => {
    if (currentuser) {
      const avatarUrl = `https://api.dicebear.com/9.x/thumbs/svg?seed=${currentuser.username}&flip=true&backgroundColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=solid,gradientLinear&backgroundRotation=0,10,20&shapeColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,transparent`;
      setAvatar(avatarUrl);
    }
  }, [currentuser]);

  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        Swal.fire({
          title: 'Preview Image',
          imageUrl: reader.result,
          imageAlt: 'Preview Image',
          showCancelButton: true,
          confirmButtonText: 'Upload',
          preConfirm: () => handleImageUpload(file)
        }).then((result) => {
          if (result.isDismissed) {
            setImage(null);
            setPreviewUrl('');
            document.getElementById('file-input').value = '';
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', 'preset');

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dqkvgv7mh/image/upload`,
        formData
      );

      const imageUrl = response.data.secure_url;
      setPreviewUrl('');
      
      const updatedUser = { ...currentuser, profileImageUrl: imageUrl };
      
      const result = await dispatch(UpdateUser({ id: currentuser._id, edited: updatedUser }));
      setPing(!ping);
      if (UpdateUser.fulfilled.match(result)) {
        Swal.fire('Uploaded!', 'Your profile picture has been updated.', 'success');
      } else {
        Swal.fire('Error', 'There was an error uploading your image. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire('Error', 'There was an error uploading your image. Please try again.', 'error');
    }
  };

  const handleEditProfile = () => {
    Swal.fire({
      title: 'Edit Profile',
      html:
        `<label>Username<input type="text" id="username" class="swal2-input" placeholder="Username" value="${currentuser.username}"></label>` +
        `<label>Email<input type="email" id="email" class="swal2-input" placeholder="Email" value="${currentuser.email}"></label>` +
        `<label>Bio<input type="text" id="bio" class="swal2-input" placeholder="Bio" value="${currentuser.bio ?? ''}"></label>` +
        `<input type="password" id="currentPassword" class="swal2-input none" placeholder="Current Password">` +
        `<label>New Pass<input type="password" id="newPassword" class="swal2-input" placeholder="New Password"></label>` +
        `<label>Confirm<input type="password" id="confirmNewPassword" class="swal2-input" placeholder="Confirm Password"></label>`,
      showCancelButton: true,
      confirmButtonText: 'Save',
      preConfirm: () => {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const bio = document.getElementById('bio').value;
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (!username || !email) {
          Swal.showValidationMessage('Username and Email are required');
          return;
        }

        if (newPassword && newPassword !== confirmNewPassword) {
          Swal.showValidationMessage('New passwords do not match');
          return;
        }

        return { username, email, currentPassword, newPassword, bio };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { username, email, currentPassword, newPassword, bio } = result.value;

        try {
          const updatedUser = { ...currentuser, username, email, bio: bio || '' };
          if (newPassword) {
            updatedUser.password = newPassword;
          }
          const response = await dispatch(UpdateUser({ id: currentuser._id, edited: updatedUser }));

          if (UpdateUser.fulfilled.match(response)) {
            Swal.fire('Updated!', 'Your profile has been updated.', 'success');
          } else {
            Swal.fire('Error', 'There was an error updating your profile. Please try again.', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'There was an error updating your profile. Please try again.', 'error');
        }
      }
    });
  };

  return (
    <div className='mt-5'>
      <div className="profile">
        {currentuser?.profileImageUrl ? (
          <div className="image-container" onClick={() => document.getElementById('file-input').click()}>
            <img src={currentuser.profileImageUrl} style={{ width: '150px' }} alt="Profile" />
            <div className="camera-icon">
              <i className="fa fa-camera" aria-hidden="true"></i>
            </div>
          </div>
        ) : (
          <div className="image-container" onClick={() => document.getElementById('file-input').click()}>
            <img src={imgUrl} style={{ width: '150px' }} alt="Avatar" />
            <div className="camera-icon">
              <i className="fa fa-camera" aria-hidden="true"></i>
            </div>
          </div>
        )}

        <input
          id="file-input"
          type="file"
          className="uploadpr"
          onChange={handleImageChange}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <h1 className='mt-3'>{currentuser?.username}</h1>
          <button className='mt-3' style={{ all: 'unset', cursor: 'pointer' }} onClick={handleEditProfile}>
            <i className="fa-solid fa-gear fa-2xl gear"></i>
          </button>
        </div>
        <p style={{textAlign: 'center', padding: '10px'}}>{currentuser?.bio}</p>
        <Link style={{all: 'unset'}} to={`/friends/${currentuser.username}`} state={currentuser}>
          <button style={{display: 'flex', justifyContent: 'center'}} className='buttonPage'>Veiw All Freinds</button>
        </Link>
      </div>
      

      <div className="posts-list">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} check={"check"} refreshPosts={refreshPosts} />
          ))
        ) : (
          <p>No posts found</p>
        )}

        {loading && <p>Loading...</p>}

        {hasMore && !loading && (
          <button onClick={loadMorePosts} className='load-more'>
            Load More
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile;
