export const getPosts = async () => fetch('http://localhost:3000/posts').then(res => res.json())

export const  createPost = (newPostData) => 
    fetch('http://localhost:3000/posts', {
        method: 'POST',
        body: newPostData,
    }).then(res => res.json())

export const patchPost = (id, updatedPostData) => 
    fetch(`http://localhost:3000/posts/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPostData),
    })

