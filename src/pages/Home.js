import { useEffect, useState } from 'react'
import { usePostsContext } from '../hooks/usePostsContext'
import { useAuthContext } from '../hooks/useAuthContext'

// Components
import PostDetails from '../components/PostDetails'
import PostForm from '../components/PostForm'
import ProfilePage from '../components/ProfilePage'

const Home = () => {
    const {posts = [], dispatch} = usePostsContext()
    const {user} = useAuthContext()
    
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTags, setSelectedTags] = useState('')

    const [showProfilePage, setShowProfilePage] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const handleUsernameClick = (post) => {
        setSelectedPost(post);
        setShowProfilePage(true);
        window.scrollTo(0, 0);
    };

    // const handleProfileLinkClick = (clickedPost) => {
    //     setProfileUsername(clickedPost.postedBy);
    //     setShowProfilePage(true);
    //     window.scrollTo(0, 0);
    // };

    const handleProfilePageClose = () => {
        setSelectedPost(null);
        setShowProfilePage(false)
    };

    useEffect(() => {
        const fetchPosts = async () => {


            const response = await fetch('api/posts'

            // This code will hide posts from guests
            // , {
            //     headers: {
            //         'Authorization': `Bearer ${user.token}`
            //     }
            // }
            )
            const json = await response.json()

            if (response.ok) {
                dispatch({type: 'SET_POSTS', payload: json})
            }
        }

        // This code will hide posts from guests
        // if (user) {
        //     fetchPosts()
        // }
        fetchPosts()
    }, [dispatch, user])

    const filteredPosts = posts ? posts.filter(post =>
        ((post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.caption.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedTags.length === 0 || selectedTags.every(tag => post.tags.includes(tag)))) &&
        (!selectedPost || post.postedBy.username === selectedPost.postedBy.username)
    ) : [];

    const handleTagClick = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(selectedTag => selectedTag !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    }

    // if(searchQuery) {
    //     filteredPosts = posts.filter(post =>
    //         post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //         post.caption.toLowerCase().includes(searchQuery.toLowerCase())
    //     )
    // }

    return (
        <div className="home">
            <div className="posts">
                <div className="post-details">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <div className="filters">
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
                                    <div className={'material-symbols-rounded'}>{tag.icon}</div>
                                    <div className="tag-text">{tag.label}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
                {/* {posts && posts.map((post) => (
                    <PostDetails key={post._id} post={post}/>
                ))} */}
                {showProfilePage && <ProfilePage post={selectedPost} onClose={handleProfilePageClose}/>}
                {filteredPosts.map(post => (
                    <PostDetails
                        key={post._id}
                        post={post}
                        onUsernameClick={handleUsernameClick} // Pass the click handler to PostDetails
                    />
                ))}
            </div>
            <PostForm/>
        </div>
    )
}

export default Home