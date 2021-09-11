import { useEffect, useState,useRef  } from "react";
import { Redirect } from "react-router";
import { projectAuth,projectStorage,database,timestamp } from "./firebase";
import './Timeline.css'
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
const Timeline = () => {
    const ref = useRef();
    const [deleteModel,setDeleteModel] = useState(false)
    const [model,setModel] = useState(false)
    const [user,setUser] = useState(projectAuth.currentUser)
    const [file,setFile] = useState(null)
    const [fileError,setFileError] = useState(null)
    const [postId,setPostId] = useState(null)
    const [postPath,setPostPath] = useState(null)
    let filePath = null
    let url = null
    const [post,setPost] = useState('')
    const [singlePost,setSinglePost] = useState(null)
    const [posts,setPosts] = useState(null)
    const [comment,setComment] = useState('')
    const type = ["image/jpeg","image/png"]
    const [commentId,setCommentId] = useState(null)
    const [deleteCommentModel,setDeleteCommentModel] = useState(false)


    const reset = () => {
    ref.current.value = "";
  };


    useEffect(()=>{
        const unsub = projectAuth.onAuthStateChanged(user=>{
            setUser(user)
        })

        return unsub
    },[])

    useEffect(()=>{
        if(user){
             database.collection('post').orderBy('createdAt','desc').where('userId','==',user.uid).onSnapshot(snap=>{
                let results = []
                snap.docs.forEach(doc=>{
                 doc.data().createdAt && results.push({...doc.data(),id:doc.id})
                })
                setPosts(results)
            })
        }
      


    },[user])


    const changeHandler = (e)=>{
        setFileError(null)
        const selected = e.target.files[0]
            if(selected && type.includes(selected.type)){
                setFileError(null)
                setFile(selected)         
            } else {
                setFileError('please select png or jpg image')
            }
    }


    const uploadImage = async ()=>{
       filePath = `post/${user.uid}/${file.name}`
        const storageRef = projectStorage.ref(filePath)
        try {
            const res = await storageRef.put(file)
            url = await res.ref.getDownloadURL()
        } catch (err) {
            console.log(err.message)   
        }
    }


    

    if(!user) return <Redirect to='/'></Redirect>
    return ( 
        <div className='container'>
            {deleteCommentModel && <div className='del-model-overlay'>
                <motion.div className='delete-container' initial={{opacity:0,scale:1.2}} animate={{opacity:1,scale:1}}>
                   <h5 style={{borderBottom:'1px solid rgba(0, 0, 0, 0.39)',color:'red',fontWeight:"bold"}} onClick={async()=>{
                       const delComments = singlePost.comments.filter(comment=>{
                            return comment.id !== commentId
                        })
                         database.collection('post').doc(postId).update({comments:delComments})
                         setDeleteCommentModel(false)
                    }}>Delete</h5>
                    <h5 onClick={()=>setDeleteCommentModel(false)}>Cancel</h5>
                </motion.div>
            </div>}
           {deleteModel && <div className='del-model-overlay'>
                <motion.div className='delete-container' initial={{opacity:0,scale:1.2}} animate={{opacity:1,scale:1}}>
                    <Link to={`/post/${postId}`}>
                    <h5 style={{borderBottom:'1px solid rgba(0, 0, 0, 0.39)'}}>Go to post</h5>
                    </Link>
                    <h5 style={{borderBottom:'1px solid rgba(0, 0, 0, 0.39)',color:'red',fontWeight:"bold"}} onClick={async()=>{
                        setDeleteModel(false)
                       await database.collection('post').doc(postId).delete()
                        const storageRef = projectStorage.ref(postPath)
                        await storageRef.delete()
                    }}>Delete post</h5>
                    <h5 onClick={()=>setDeleteModel(false)}>Cancel</h5>
                </motion.div>
            </div>}
           {model && <div className='model-overlay' onClick={(e)=>{if(e.target.className === 'model-overlay'){setModel(false)}}}>
                <motion.div className='model-container' initial={{opacity:0,y:-100}} animate={{opacity:1,y:0}} transition={{type:'just'}}>
                    <div className='model-top'>
                    <h3>Create post</h3>
                    <span className="material-icons-outlined close-post" onClick={()=>{setModel(false)}}>close</span>
                    </div>
                    <div className='model-center'>
                        <div className='model-user'>
                            <span className="material-icons-outlined">account_circle</span>
                            <span>{user.displayName}</span>
                        </div>
                        <textarea className='caption' cols="30" rows="10" required placeholder={`What's on your mind, ${user.displayName}?`} onChange={(e)=>{setPost(e.target.value)}}></textarea>
                        <input type="file" onChange={changeHandler}/>
                        <div>
                        <span className='error'>{fileError}</span>
                        </div>
                    <button className='login-btn' onClick={async(e)=>{
                        e.preventDefault()
                        if(!fileError){
                           await uploadImage()
                           await database.collection('post').add({
                            userId:user.uid,
                            userName: user.displayName,
                            imgUrl: url,
                            createdAt: timestamp(),
                            comments: [],
                            filePath: filePath,
                            post: post
                        })
                        }
                        setModel(false)
                    }}>Post</button>
                    </div>
                </motion.div>
            </div>}
            <nav>
                <div className='logo'>
                    <h3 style={{fontFamily:'cursive',cursor:'pointer'}}>InstaClone</h3>
                </div>
                <div className='search-container'>
                    <input type="text" placeholder='Search'/>
                    <i className="fas fa-search search"></i>
                </div>
                <div className='nav-icons'>
                    <i className="far fa-plus-square" onClick={()=>{setModel(true)}}></i>
                   <Link to='/explore'>
                      <i className="far fa-compass"></i>
                   </Link>
                    <i className="far fa-heart"></i>
                    <Link to={`/profile/${user.displayName}`}>
                    <i className="far fa-user-circle"></i>
                    </Link>
                </div>
            </nav>
            <div className='timeline-grid'>
            
           {posts && <div className='timeline'>
                {posts.map(post=>
                    <motion.div className='single-post' key={post.id} initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}}
                     transition={{type:'just'}}
                    >
                        <div style={{display:'flex',justifyContent:'space-between'}}>
                        <div style={{margin:'1rem'}} className='model-user'>
                            <span className="material-icons-outlined">account_circle</span>
                            <span>{post.userName}</span>
                        </div>
                        <span style={{margin:'1rem',cursor:'pointer',color:'gray'}} className="material-icons-outlined" onClick={()=>{
                            setDeleteModel(true)
                            setPostId(post.id)
                            setPostPath(post.filePath)
                        }}>more_horiz</span>
                        </div>
                        <div className='timeline-img-container'>
                        <img src={post.imgUrl} alt="" />
                        </div>
                        <div className='post-icons'>
                            <div className='left-icons'>
                                <i className="far fa-heart"></i>
                                <i className="far fa-comment" onClick={()=>{
                                    const input = document.querySelector('.comment-input')
                                    input.focus()
                                }}></i>
                                <i className="far fa-paper-plane"></i>
                            </div>
                            <i className="far fa-bookmark"></i>
                        </div>
                        <div>
                            <span style={{fontSize:'15px',marginLeft:'1rem'}}>Be the first to <span style={{fontWeight:'bold'}}>like this</span></span>
                            
                        </div>
                        <div style={{margin:'.5rem 1rem',fontSize:'.9rem'}}>
                        <span style={{fontWeight:'bold'}}>{post.userName}</span> <span>{post.post}</span>
                        <Link style={{textDecoration:"none"}} to={`/post/${post.id}`}>
                        <span style={{color:'grey',margin:'.3rem 0',display:"block"}}>View all comments</span>
                        </Link>
                        </div>
                        {post.comments.map(comment=>
                            <motion.div className='single-model-comment' key={comment.id} style={{margin:'.5rem 1rem',fontSize:'.9rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}
                            initial={{opacity:0}} animate={{opacity:1}}
                            >
                                <div>
                        <span style={{fontWeight:'bold'}}>{comment.username}</span> <span>{comment.comment}</span>
                                </div>
                        {user && user.uid === comment.userId && <span className="material-icons-outlined del-comment" onClick={()=>{
                                         setCommentId(comment.id)
                                         setPostId(post.id)
                                         setDeleteCommentModel(true)
                                        database.collection('post').doc(post.id).onSnapshot(snap=>{
                                        setSinglePost({...snap.data(),id:snap.id})
                                      })
                                     }}>more_horiz</span>}
                        </motion.div>
                        )}
                        <form type="reset" onSubmit={async(e)=>{
                            e.preventDefault()
                            const newComments = {
                                username:user.displayName,
                                comment: comment,
                                userId: user.uid,
                                id: Math.floor(Math.random() * 100000000000000)
                            }
                           await database.collection('post').doc(post.id).update({comments:[...post.comments,newComments]})
                           reset()
                        }} className='comment-container'>
                        <input className='comment-input' ref={ref} type="text" placeholder='Add a comment...' onChange={(e)=>{setComment(e.target.value)}}/>
                        <button type="submit" onClick={reset}>Post</button>
                        </form>
                    </motion.div>
                )}
            </div>}
           
                {posts && !posts.length && <div>there is no posts yet</div>}
            </div>
        </div>
     );
}
 
export default Timeline;