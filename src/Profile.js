import { useState,useEffect,useRef } from "react";
import { Link } from "react-router-dom";
import userImg from './imgs/user.jpg'
import { projectAuth,database,timestamp,projectStorage } from "./firebase";
import { Redirect } from "react-router";
import { motion,AnimatePresence } from "framer-motion";
import './Profile.css'
const Profile = () => {
    const [model,setModel] = useState()
    const [isPending,setIsPending] = useState(false)
    const [user,setUser] = useState(projectAuth.currentUser)
    const type = ["image/jpeg","image/png"]
    const [file,setFile] = useState(null)
    const [fileError,setFileError] = useState(null)
    const [post,setPost] = useState('')
    const [posts,setPosts] = useState(null)
    const [logoutModel,setLogoutModel] = useState(false)
    let filePath = null
    let url = null
    const [singlePost,setSinglePost] = useState(null)
    const [openModel,setOpenModel] = useState(false)
    const [postId,setPostId] = useState(null)
    const [postPath,setPostPath] = useState(null)
    const [comment,setComment] = useState('')
     const ref = useRef();
     const [userId,setUserId] = useState(null)
    const [deleteModel,setDeleteModel] = useState(false)
    const [deleteCommentModel,setDeleteCommentModel] = useState(false)
    const [commentId,setCommentId] = useState(null)
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
                    {user && user.uid === userId && <h5 style={{borderBottom:'1px solid rgba(0, 0, 0, 0.39)',color:'red',fontWeight:"bold"}} onClick={async()=>{
                        setDeleteModel(false)
                        setOpenModel(false)
                        await database.collection('post').doc(postId).delete()
                        const storageRef = projectStorage.ref(postPath)
                        await storageRef.delete()
                    }}>Delete post</h5>}
                    <h5 onClick={()=>setDeleteModel(false)}>Cancel</h5>
                </motion.div>
            </div>}
            <AnimatePresence>
            {openModel && singlePost && <div className='model-overlay'>
                <span className="material-icons-outlined close-post" onClick={()=>{setOpenModel(false)}}>close</span>
                <motion.div className='explore-model' initial={{opacity:0,scale:.5}} animate={{opacity:1,scale:1}} transition={{type:'just'}}
                exit={{scale:.5,opacity:0}}
                >
                    <div className='mod-user-det' style={{display:'none',justifyContent:'space-between',borderBottom:'1px solid rgba(0, 0, 0, 0.178)'}}>
                        <div style={{margin:'1rem'}} className='model-user'>
                            <span className="material-icons-outlined">account_circle</span>
                            <span style={{fontWeight:'bold'}}>{singlePost.userName}</span>
                        </div>
                        <span style={{margin:'1rem',cursor:'pointer',color:'gray'}} className="material-icons-outlined" onClick={()=>{
                             setDeleteModel(true)
                             setPostId(singlePost.id)
                             setPostPath(singlePost.filePath)
                             setUserId(singlePost.userId)
                        }}>more_horiz</span>
                        </div>
                    <div className='left-model'>
                        <img src={singlePost.imgUrl} alt="" />
                    </div>
                    <div className='right-model'>
                        <div className='mod-user-details' style={{display:'flex',justifyContent:'space-between',borderBottom:'1px solid rgba(0, 0, 0, 0.178)'}}>
                        <div style={{margin:'1rem'}} className='model-user'>
                            <span className="material-icons-outlined">account_circle</span>
                            <span style={{fontWeight:'bold'}}>{singlePost.userName}</span>
                        </div>
                        <span style={{margin:'1rem',cursor:'pointer',color:'gray'}} className="material-icons-outlined" onClick={()=>{
                             setDeleteModel(true)
                             setPostId(singlePost.id)
                             setPostPath(singlePost.filePath)
                             setUserId(singlePost.userId)
                        }}>more_horiz</span>
                        </div>
                        <div className='model-center'>
                            <div style={{display:'flex'}}>
                               <span style={{marginRight:'.5rem'}} className="material-icons-outlined">account_circle</span>
                               <span style={{fontWeight:'bold',marginRight:".5rem"}}>{singlePost.userName}</span>
                               <p>{singlePost.post}</p>
                            </div>
                            {singlePost && singlePost.comments && <div>
                            {singlePost.comments.map(comment=>
                                <motion.div className='single-model-comment' key={comment.id} initial={{opacity:0}} animate={{opacity:1}}>
                                    <div style={{display:'flex',alignItems:'center'}}>
                                    <span style={{marginRight:'.5rem'}} className="material-icons-outlined">account_circle</span>
                               <span style={{fontWeight:'bold',marginRight:".5rem"}}>{comment.username}</span>
                               <span>{comment.comment}</span>
                                    </div>
                                    {user && user.uid === comment.userId && <span className="material-icons-outlined del-comment" onClick={()=>{
                                         setCommentId(comment.id)
                                         setPostId(singlePost.id)
                                         setDeleteCommentModel(true)
                                     }}>more_horiz</span>}
                                     
                                </motion.div>
                            )}

                            </div>}
                            
                        </div>
                         <div style={{borderTop:"1px solid rgba(0, 0, 0, 0.178)",marginTop:".1rem"}} className='post-icons'>
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
                        <form type="reset" onSubmit={async(e)=>{
                            e.preventDefault()
                            const newComments = {
                                username:user.displayName,
                                comment: comment,
                                userId: user.uid,
                                id: Math.floor(Math.random() * 100000000000000)
                            }

                           await database.collection('post').doc(singlePost.id).update({comments:[...singlePost.comments,newComments]})
                           ref.current.value = "";
                        }} className='comment-container'>
                        <input className='comment-input' ref={ref} type="text" placeholder='Add a comment...' onChange={(e)=>{setComment(e.target.value)}}/>
                        <button type="submit">Post</button>
                        </form>
                    </div>
                </motion.div>
            </div>}

            </AnimatePresence>
            {logoutModel && <div className='del-model-overlay'>
                <motion.div className='delete-container' initial={{opacity:0,y:-100}} animate={{opacity:1,y:0}} transition={{type:'just'}}>
                     <h5 style={{borderBottom:'1px solid rgba(0, 0, 0, 0.39)'}} onClick={async()=>{
                        await projectAuth.signOut()
                    }}>Log Out</h5>
                    <h5 onClick={()=>setLogoutModel(false)}>Cancel</h5>
                </motion.div>
            </div>}
            {model && <div className='model-overlay' onClick={(e)=>{if(e.target.className === 'model-overlay'){setModel(false)}}}>
                <motion.div className='model-container' initial={{opacity:0,y:-100}} animate={{opacity:1,y:0}} transition={{type:'just'}}>
                    <div className='model-top'>
                    <h3>Create post</h3>
                    <span className="material-icons-outlined close-post" onClick={()=>{setModel(false)}}>close</span>
                    </div>
                    <div className='model-center-send'>
                        <div className='model-user'>
                            <span className="material-icons-outlined">account_circle</span>
                            <span>{user.displayName}</span>
                        </div>
                        <textarea className='caption' cols="30" rows="10" required placeholder={`What's on your mind, ${user.displayName}?`} onChange={(e)=>{setPost(e.target.value)}}></textarea>
                        <input type="file" onChange={changeHandler}/>
                        <div>
                        <span className='error'>{fileError}</span>
                        </div>
                    {!isPending && <button className='login-btn' onClick={async(e)=>{
                        e.preventDefault()
                        if(file){
                            setIsPending(true)
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
                            setIsPending(false)
                            setModel(false)
                            setFile(null)
                        }
                    }}>Post</button>}
                    {isPending && <button disabled style={{cursor:"not-allowed",opacity:'.5'}} className='login-btn'>Posting...</button>}
                    </div>
                </motion.div>
            </div>}
            <nav>
               <Link style={{textDecoration:'none',color:"inherit"}} to='/timeline'>
               <div className='logo'>
                    <h3 style={{fontFamily:'cursive',cursor:'pointer'}}>InstaClone</h3>
                </div>
               </Link> 
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
                    
                    <i className="fas fa-user-circle"></i>
                
                </div>
            </nav>
            <div className='user-profile'>
                <div className='user-profile-container'>
                    <div className='profile-img-container'>
                        <img src={userImg} alt="" />
                    </div>
                   {posts && <div className='user-details'>
                         <div className='user-details-top'>
                             <span style={{fontSize:'1.3rem'}}>{user.displayName}</span>
                             <span className='edit-profile'>Edit Profile</span>
                             <i className="las la-cog" style={{fontSize:"25px",cursor:"pointer"}} onClick={()=>{
                                 setLogoutModel(true)
                             }}></i>
                         </div>
                         <div className='user-followers'>
                             <span>{posts.length} posts</span>
                             <span className='followers'>0 followers</span>
                             <span>0 following</span>
                         </div>
                         <div className='user-email'>
                             <span>{user.email}</span>
                         </div>
                    </div>}
                </div>
            </div>

            <div className='profile-post-container'>
                <div className='post-icon-container'>
                    <div className='align-it'>
                    <span className="material-icons-outlined">grid_on</span>
                    <span style={{marginTop:'-5px',marginLeft:'5px'}}>posts</span>
                    </div>
                </div>
               {posts && <div className='profile-posts-grid'>
                   {posts.map(post=>
                   <motion.div className='single-explore-post' key={post.id} onClick={async()=>{
                   setOpenModel(true)
                   database.collection('post').doc(post.id).onSnapshot(snap=>{
                       setSinglePost({...snap.data(),id:snap.id})
                   })
               }} initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}}>
                   <div className='explore-overview'>
                           <div className='explore-icon'>
                               <span style={{marginRight:"2.3rem"}} className='explore-icon-container'>
                           <i style={{marginRight:'.6rem'}} className="fas fa-heart"></i>
                           <i>0</i>
                               </span>
                               <span className='explore-icon-container'>
                           <i style={{marginRight:'.6rem'}} className="fas fa-comment"></i>
                           <i>{post.comments.length}</i>
                               </span>
                       </div>
                   </div>
                   <img src={post.imgUrl} alt="" />
               </motion.div>
                   )}
                </div>}
                {posts && !posts.length && <div style={{textAlign:'center'}}>there is no posts yet</div>}
            </div>
        </div>
     );
}
 
export default Profile;