import React, { useState } from 'react';
import axios from 'axios';
import { useAuthContext } from "../hooks/useAuthContext";

const ProfilePage = ({ post, onClose }) => {
    const { _id, username, profilePicture, profileBanner, bio } = post.postedBy;

    const [isEditing, setIsEditing] = useState(false);
    const [bioValue, setBioValue] = useState(bio);
    const [profilePictureFile, setProfilePictureFile] = useState('');
    const [profileBannerFile, setProfileBannerFile] = useState('');
    const { user } = useAuthContext()

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setBioValue(bio);
    };

    const handleSaveClick = async (e) => {
        e.preventDefault()

        try {
            // Upload profile picture to Cloudinary
            let profilePictureUrl = profilePicture;
            if (profilePictureFile) {
                const formData = new FormData();
                formData.append('file', profilePictureFile);
                formData.append('upload_preset', 'imagePreset');
                const response = await axios.post('https://api.cloudinary.com/v1_1/dwuve60k3/image/upload', formData);
                profilePictureUrl = response.data.url;
            }
    
            // Upload profile banner to Cloudinary
            let profileBannerUrl = profileBanner;
            if (profileBannerFile) {
                const formData = new FormData();
                formData.append('file', profileBannerFile);
                formData.append('upload_preset', 'imagePreset');
                const response = await axios.post('https://api.cloudinary.com/v1_1/dwuve60k3/image/upload', formData);
                profileBannerUrl = response.data.url; 
            }
    
            const data = {
                bio: bioValue,
                profilePicture: profilePictureUrl,
                profileBanner: profileBannerUrl
            };
    
            const response = await axios.patch(`/api/user/${_id}`, data);
    
            setIsEditing(false);
    
            console.log('User profile updated successfully:', response.data);
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    }

    return (
        <div className="profile-page">
            <img className="profile-banner" src={profileBanner} alt={`Profile banner of ${username}`} />
            <div className="profile-details">
                <div className="profile-top-row">
                    <img className="profile-picture" src={profilePicture} alt={`Profile picture of ${username}`} />
                    <h1>@{username}</h1>
                    <div hidden={!user || post.postedBy.username !== user.username}>
                        {!isEditing && <button className="material-symbols-rounded" onClick={handleEditClick}>Edit</button>}
                    </div>
                </div>
                <p>{bio}</p>
                {/* Edit form */}
                {isEditing && (
                    <form>
                        <div>
                            <label htmlFor="bio">Bio:</label>
                            <textarea id="bio" name="bio" rows="4" value={bioValue} onChange={(e) => setBioValue(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="profilePicture">Profile Picture:</label>
                            <input
                                type="file"
                                id="profilePicture"
                                name="profilePicture"
                                accept="image/*"
                                onChange={(e) => setProfilePictureFile(e.target.files[0])}
                                className="fileInput"
                            />
                        </div>
                        <div>
                            <label htmlFor="profileBanner">Profile Banner:</label>
                            <input
                                type="file"
                                id="profileBanner"
                                name="profileBanner"
                                accept="image/*"
                                onChange={(e) => setProfileBannerFile(e.target.files[0])}
                                className="fileInput"
                            />
                        </div>
                        <div className="editButtons">
                            <button onClick={handleSaveClick}>Save</button>
                            <button onClick={handleCancelClick}>Cancel</button>
                        </div>
                    </form>
                )}
                {/* Edit button */}
            </div>
            <button onClick={onClose}>Close</button>
        </div>
    );
}

export default ProfilePage;
