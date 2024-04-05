import React, { useState } from 'react';
import { usePostsContext } from "../hooks/usePostsContext";
import { useAuthContext } from "../hooks/useAuthContext";

import formateDistanceToNow from 'date-fns/formatDistanceToNow'


const getMaterialIcon = (label) => {
    switch (label) {
        case 'Hand-drawn':
            return 'edit';
        case 'Paint':
            return 'brush';
        case 'Digital':
            return 'stylus_note';
        case 'Graphic Design':
            return 'draw_collage';
        case 'Photography':
            return 'photo';
        case 'Discussion':
            return 'forum';
        case 'Seeking Criticism':
            return 'help';
        case 'Showcase':
            return 'visibility';
        default:
            return '';
    }
};

const PostDetails = ({ post, onUsernameClick }) => {

    const { dispatch } = usePostsContext()
    const { user } = useAuthContext()

    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [showCommentSection, setShowCommentSection] = useState(false);
    const [thisPost, setThisPost] = useState(post);

    const [upvotes, setUpvotes] = useState(post.upvotes);
    const [downvotes, setDownvotes] = useState(post.downvotes);


    const handleClick = async () => {
        if (!user) {
            return
        }
        const response = await fetch('/api/posts/' + post._id, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        })
        const json = await response.json()

        if (response.ok) {
            dispatch({type: 'DELETE_POST', payload: json})
        }
    }

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const toggleCommentSection = () => {
        setShowCommentSection((prev) => !prev);
    };
    
    const handleAddComment = async () => {
        if (!newComment.trim()) {
            return;
        }
        
        try {
            const response = await fetch(`/api/posts/${post._id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ content: newComment })
            });
            const data = await response.json();
    
            setComments([...comments, data]);
    
            const updatedPostResponse = await fetch(`/api/posts/${post._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ comments: [...post.comments, data._id] })
            });
            const updatedPostData = await updatedPostResponse.json();
            setThisPost(updatedPostData);
    
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };
    
    const [upvoteClicked, setUpvoteClicked] = useState(false);
    const [downvoteClicked, setDownvoteClicked] = useState(false);

    const handleUpvote = async () => {
        try {
            const newUpvoteClicked = !upvoteClicked;
            setUpvoteClicked(newUpvoteClicked);
    
            const response = await fetch(`/api/posts/${post._id}/upvote`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ toggle: newUpvoteClicked })
            });
            if (!response.ok) {
                setUpvoteClicked(!newUpvoteClicked);
            } else {
                setUpvotes((prevUpvotes) => newUpvoteClicked ? prevUpvotes + 1 : prevUpvotes - 1);
            }
        } catch (error) {
            console.error('Error upvoting:', error);
        }
    };
    
    const handleDownvote = async () => {
        try {
            const newDownvoteClicked = !downvoteClicked;
            setDownvoteClicked(newDownvoteClicked);
    
            const response = await fetch(`/api/posts/${post._id}/downvote`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ toggle: newDownvoteClicked })
            });
            if (!response.ok) {
                setDownvoteClicked(!newDownvoteClicked);
            } else {
                setDownvotes((prevDownvotes) => newDownvoteClicked ? prevDownvotes + 1 : prevDownvotes - 1);
            }
        } catch (error) {
            console.error('Error downvoting:', error);
        }
    };

    return (
        <div className="post-details">
            <h4 onClick={toggleCommentSection}>{post.title}</h4>
            <div className="user-info" onClick={() => onUsernameClick(post)}>
                <img className="profile-picture" src={post.postedBy.profilePicture} alt={`Profile picture of ${post.postedBy.username}`} />
                <p>@{post.postedBy.username}</p>
            </div>
            <img src={post.image} alt={post.image}></img>
            <p>{post.caption}</p>
            <p>{formateDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
            <div hidden={!user || post.postedBy.username !== user.username}>
                <span className="material-symbols-rounded" onClick={handleClick}>delete</span>
            </div>
            <div className="tags">
                {post.tags.map((tag, index) => (
                    <div className={`tag tag-${tag}`} key={index}>
                        <div className="material-symbols-rounded">{getMaterialIcon(tag)}</div>
                        <div className="tag-text">{tag}</div>
                    </div>
                ))}
            </div>

            <div className="vote-menu">
                <button className={`vote ${upvoteClicked ? 'active' : ''}`} onClick={handleUpvote}>
                    <div className="material-symbols-rounded">arrow_circle_up</div>
                    <p>{upvotes}</p>
                </button>

                <button className={`vote ${downvoteClicked ? 'active' : ''}`} onClick={handleDownvote}>
                    <div className="material-symbols-rounded">arrow_circle_down</div>
                    <p>{downvotes}</p>
                </button>
            </div>

            {/* Comments */}
            {showCommentSection && (
                <div className="comment-section">
                    <h5>Comments</h5>
                    <ul>
                        {comments.map((comment, index) => (
                            <li key={index}>{comment}</li>
                        ))}
                    </ul>
                    {user && (
                        <div>
                            <textarea value={newComment} onChange={handleCommentChange} />
                            <button onClick={handleAddComment}>Add Comment</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default PostDetails