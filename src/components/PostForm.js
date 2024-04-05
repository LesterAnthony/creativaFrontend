import { useState, useRef, useEffect } from "react"
import { usePostsContext } from '../hooks/usePostsContext'
import { useAuthContext } from "../hooks/useAuthContext"
import axios from 'axios'

const PostForm = () => {
    const { dispatch } = usePostsContext()
    const { user } = useAuthContext()

    const [title, setTitle] = useState('')
    const [image, setImage] = useState('')
    const fileInputRef = useRef(null)
    const [caption, setCaption] = useState('')
    const [selectedTags, setSelectedTags] = useState([])

    const [error, setError] = useState(null)
    const [emptyFields, setEmptyFields] = useState([])

    const handleTagClick = (tag) => {
        if (selectedTags.includes(tag) && selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(selectedTag => selectedTag !== tag))
        } else {
            setSelectedTags([...selectedTags, tag])
        }

        console.log(selectedTags)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!user) {
            setError('You must be logged in')
            return
        }
        
        let imageUrl = "";
        if (image) {
            const formData = new FormData();
            formData.append("file", image);
            formData.append("upload_preset", "imagePreset");
            const dataRes = await axios.post(
                "https://api.cloudinary.com/v1_1/dwuve60k3/image/upload",
                formData
            );
            imageUrl = dataRes.data.url;
        }

        const post = {
            title,
            image: imageUrl,
            caption,
            postedBy: user,
            tags: selectedTags
        }

        const response = await fetch('/api/posts', {
            method: 'POST',
            body: JSON.stringify(post),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        })

        console.log('emptyFields:',emptyFields)

        const json = await response.json()

        if (!response.ok) {
            setError(json.error)
            setEmptyFields(json.emptyFields)
        }
        if (response.ok) {
            setEmptyFields([])
            setError(null)
            setTitle('')
            setImage('')
            fileInputRef.current.value = null
            setCaption('')
            document.querySelectorAll('.tag').forEach((el) => {
                el.classList.remove('active');
            });
            setSelectedTags([])
            dispatch({type: 'CREATE_POST', payload: json})
        }


    }
    
    return (
        <div className="create">
            <h3>Create Post</h3>

            <label>Title:</label>
            <input
                type="text"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                className={emptyFields.includes('title') ? 'error' : ''}
            />

            <label>Image:</label>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files[0]
                    setImage(file)
                }}
                className={emptyFields.includes('image') ? 'error' : ''}
            />

            <label>Caption:</label>
            <input
                type="text"
                onChange={(e) => setCaption(e.target.value)}
                value={caption}
                className={emptyFields.includes('caption') ? 'error' : ''}
            />

            <div>
                <label>Tags:</label>
                <div className="tags">
                    {[
                        { label: 'Hand-drawn', icon: 'Edit' },
                        { label: 'Paint', icon: 'Brush' },
                        { label: 'Digital', icon: 'Stylus_Note' },
                        { label: 'Graphic Design', icon: 'Draw_Collage' },
                        { label: 'Photography', icon: 'Photo' },
                        { label: 'Discussion', icon: 'Forum' },
                        { label: 'Seeking Criticism', icon: 'Help' },
                        { label: 'Showcase', icon: 'Visibility' },

                    ].map((tag, index) => {
                        const isActive = selectedTags.includes(tag.label);
                        return (
                        <button key={index} className={`tag ${isActive ? 'active' : ''} tag-${tag.label}`} onClick={(e) => handleTagClick(tag.label)}>
                            <span className="material-symbols-rounded">{tag.icon}</span>
                            <span className="tag-text">{tag.label}</span>
                        </button>
                        );
                    })}
                </div>
            </div>

            <button className="submitButton" onClick={handleSubmit}>Create Post</button>
            {error && <div className="error">{error}</div>}
        </div>
    )
}

export default PostForm