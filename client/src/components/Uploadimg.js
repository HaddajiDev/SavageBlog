import React, { useState } from 'react'
import axios from 'axios';

const Uploadimg = () => {
	const [image, setImage] = useState('');
	const [url, setUrl] = useState('');
  
	const handleImageChange = (e) => {
	  setImage(e.target.files[0]);
	};
  
	const handleImageUpload = async () => {
	  const formData = new FormData();
	  formData.append('file', image);
	  formData.append('upload_preset', 'preset');
  
	  try {
		const response = await axios.post(
		  `https://api.cloudinary.com/v1_1/dqkvgv7mh/image/upload`,
		  formData
		);
		setUrl(response.data.secure_url);
		
	  } catch (error) {
		console.error(error);
	  }
	};
  
	return (
	  <div>
		<input type="file" onChange={handleImageChange} />
		<button onClick={handleImageUpload}>Upload Image</button>
		{url && (
		  <div>
			<img src={url} alt="Uploaded" style={{ width: '300px' }} />
		  </div>
		)}
	  </div>
	);  
};

export default Uploadimg