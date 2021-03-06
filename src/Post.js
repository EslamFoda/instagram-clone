import { useEffect, useState, useRef } from "react";
import { Redirect } from "react-router";
import { projectAuth, projectStorage, database, timestamp } from "./firebase";
import { motion } from "framer-motion";
import "./Post.css";
import { Link, useHistory, useParams } from "react-router-dom";
const Post = () => {
  const param = useParams();
  const ref = useRef();
  const [deleteModel, setDeleteModel] = useState(false);
  const [postPath, setPostPath] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState(null);
  const [model, setModel] = useState(false);
  const [user, setUser] = useState(projectAuth.currentUser);
  const [post, setPost] = useState("");
  const [fileError, setFileError] = useState(null);
  const [file, setFile] = useState(null);
  const [singlePost, setSinglePost] = useState(null);
  const history = useHistory();
  let filePath = null;
  let url = null;
  const type = ["image/jpeg", "image/png"];
  const [deleteCommentModel, setDeleteCommentModel] = useState(false);
  const [commentId, setCommentId] = useState(null);
  useEffect(() => {
    const unsub = projectAuth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return unsub;
  }, []);

  const changeHandler = (e) => {
    setFileError(null);
    const selected = e.target.files[0];
    if (selected && type.includes(selected.type)) {
      setFileError(null);
      setFile(selected);
    } else {
      setFileError("please select png or jpg image");
    }
  };

  const uploadImage = async () => {
    filePath = `post/${user.uid}/${file.name}`;
    const storageRef = projectStorage.ref(filePath);
    try {
      const res = await storageRef.put(file);
      url = await res.ref.getDownloadURL();
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    const unsub = database
      .collection("post")
      .doc(param.id)
      .onSnapshot((snap) => {
        setSinglePost(snap.data());
      });

    return () => unsub();
  }, [param.id]);

  if (!user) return <Redirect to="/"></Redirect>;
  return (
    <div className="container">
      {deleteCommentModel && (
        <div className="del-model-overlay">
          <motion.div
            className="delete-container"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "just" }}
          >
            <h5
              style={{
                borderBottom: "1px solid rgba(0, 0, 0, 0.39)",
                color: "red",
                fontWeight: "bold",
              }}
              onClick={async () => {
                const delComments = singlePost.comments.filter((comment) => {
                  return comment.id !== commentId;
                });

                database
                  .collection("post")
                  .doc(param.id)
                  .update({ comments: delComments });
                setDeleteCommentModel(false);
              }}
            >
              Delete
            </h5>
            <h5 onClick={() => setDeleteCommentModel(false)}>Cancel</h5>
          </motion.div>
        </div>
      )}
      {deleteModel && (
        <div className="del-model-overlay">
          <motion.div
            className="delete-container"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "just" }}
          >
            <h5 style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.39)" }}>
              Go to post
            </h5>
            {user && user.uid === userId && (
              <h5
                style={{
                  borderBottom: "1px solid rgba(0, 0, 0, 0.39)",
                  color: "red",
                  fontWeight: "bold",
                }}
                onClick={async () => {
                  history.push("/timeline");
                  await database.collection("post").doc(param.id).delete();
                  const storageRef = projectStorage.ref(postPath);
                  await storageRef.delete();
                  setDeleteModel(false);
                }}
              >
                Delete post
              </h5>
            )}
            <h5 onClick={() => setDeleteModel(false)}>Cancel</h5>
          </motion.div>
        </div>
      )}
      {model && (
        <div
          className="model-overlay"
          onClick={(e) => {
            if (e.target.className === "model-overlay") {
              setModel(false);
            }
          }}
        >
          <motion.div
            className="model-container"
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "just" }}
          >
            <div className="model-top">
              <h3>Create post</h3>
              <span
                className="material-icons-outlined close-post"
                onClick={() => {
                  setModel(false);
                }}
              >
                close
              </span>
            </div>
            <div className="model-center-send">
              <div className="model-user">
                <span className="material-icons-outlined">account_circle</span>
                <span>{user.displayName}</span>
              </div>
              <textarea
                className="caption"
                cols="30"
                rows="10"
                required
                placeholder={`What's on your mind, ${user.displayName}?`}
                onChange={(e) => {
                  setPost(e.target.value);
                }}
              ></textarea>
              <input type="file" onChange={changeHandler} />
              <div>
                <span className="error">{fileError}</span>
              </div>
              {!isPending && (
                <button
                  className="login-btn"
                  onClick={async (e) => {
                    e.preventDefault();
                    if (file) {
                      setIsPending(true);
                      if (!fileError) {
                        await uploadImage();
                        await database.collection("post").add({
                          userId: user.uid,
                          userName: user.displayName,
                          imgUrl: url,
                          createdAt: timestamp(),
                          comments: [],
                          filePath: filePath,
                          post: post,
                        });
                      }
                      setIsPending(false);
                      setModel(false);
                      setFile(null);
                      history.push("/timeline");
                    }
                  }}
                >
                  Post
                </button>
              )}
              {isPending && (
                <button
                  disabled
                  style={{ cursor: "not-allowed", opacity: ".5" }}
                  className="login-btn"
                >
                  Posting...
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
      <nav>
        <Link
          style={{ textDecoration: "none", color: "inherit" }}
          to="/timeline"
        >
          <div className="logo">
            <h3 style={{ fontFamily: "cursive", cursor: "pointer" }}>
              InstaClone
            </h3>
          </div>
        </Link>
        <div className="search-container">
          <input type="text" placeholder="Search" />
          <i className="fas fa-search search"></i>
        </div>
        <div className="nav-icons">
          <i
            className="far fa-plus-square"
            onClick={() => {
              setModel(true);
            }}
          ></i>
          <Link to="/explore">
            <i className="far fa-compass"></i>
          </Link>
          <i className="far fa-heart"></i>
          <Link to={`/profile/${user.displayName}`}>
            <i className="far fa-user-circle"></i>
          </Link>
        </div>
      </nav>
      {singlePost && (
        <div className="post-contain">
          <motion.div
            className="the-post"
            style={{ border: "1px solid rgba(0, 0, 0, 0.178)" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              className="mod-user-det"
              style={{
                display: "none",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(0, 0, 0, 0.178)",
              }}
            >
              <div style={{ margin: "1rem" }} className="model-user">
                <span className="material-icons-outlined">account_circle</span>
                <span style={{ fontWeight: "bold" }}>
                  {singlePost.userName}
                </span>
              </div>
              <span
                style={{ margin: "1rem", cursor: "pointer", color: "gray" }}
                className="material-icons-outlined"
                onClick={() => {
                  setDeleteModel(true);

                  setPostPath(singlePost.filePath);
                  setUserId(singlePost.userId);
                }}
              >
                more_horiz
              </span>
            </div>
            <div className="left-model">
              <img src={singlePost.imgUrl} alt="" />
            </div>
            <div className="right-model">
              <div
                className="mod-user-details"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.178)",
                }}
              >
                <div style={{ margin: "1rem" }} className="model-user">
                  <span className="material-icons-outlined">
                    account_circle
                  </span>
                  <span style={{ fontWeight: "bold" }}>
                    {singlePost.userName}
                  </span>
                </div>
                <span
                  style={{ margin: "1rem", cursor: "pointer", color: "gray" }}
                  className="material-icons-outlined"
                  onClick={() => {
                    setDeleteModel(true);

                    setPostPath(singlePost.filePath);
                    setUserId(singlePost.userId);
                  }}
                >
                  more_horiz
                </span>
              </div>
              <div className="model-center for-post">
                <div style={{ display: "flex" }}>
                  <span
                    style={{ marginRight: ".5rem" }}
                    className="material-icons-outlined"
                  >
                    account_circle
                  </span>
                  <span style={{ fontWeight: "bold", marginRight: ".5rem" }}>
                    {singlePost.userName}
                  </span>
                  <p>{singlePost.post}</p>
                </div>
                {singlePost && singlePost.comments && (
                  <div>
                    {singlePost.comments.map((comment) => (
                      <motion.div
                        className="single-model-comment"
                        key={comment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span
                            style={{ marginRight: ".5rem" }}
                            className="material-icons-outlined"
                          >
                            account_circle
                          </span>
                          <span
                            style={{ fontWeight: "bold", marginRight: ".5rem" }}
                          >
                            {comment.username}
                          </span>
                          <span>{comment.comment}</span>
                        </div>
                        {user && user.uid === comment.userId && (
                          <span
                            className="material-icons-outlined del-comment"
                            onClick={() => {
                              setCommentId(comment.id);

                              setDeleteCommentModel(true);
                            }}
                          >
                            more_horiz
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              <div
                style={{
                  borderTop: "1px solid rgba(0, 0, 0, 0.178)",
                  marginTop: ".1rem",
                }}
                className="post-icons"
              >
                <div className="left-icons">
                  <i className="far fa-heart"></i>
                  <i
                    className="far fa-comment"
                    onClick={() => {
                      const input = document.querySelector(".comment-input");
                      input.focus();
                    }}
                  ></i>
                  <i className="far fa-paper-plane"></i>
                </div>
                <i className="far fa-bookmark"></i>
              </div>
              <div>
                <span style={{ fontSize: "15px", marginLeft: "1rem" }}>
                  Be the first to{" "}
                  <span style={{ fontWeight: "bold" }}>like this</span>
                </span>
              </div>
              <form
                type="reset"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const newComments = {
                    username: user.displayName,
                    comment: comment,
                    userId: user.uid,
                    id: Math.floor(Math.random() * 100000000000000),
                  };

                  await database
                    .collection("post")
                    .doc(param.id)
                    .update({
                      comments: [...singlePost.comments, newComments],
                    });
                  ref.current.value = "";
                }}
                className="comment-container"
              >
                <input
                  className="comment-input"
                  ref={ref}
                  type="text"
                  placeholder="Add a comment..."
                  onChange={(e) => {
                    setComment(e.target.value);
                  }}
                />
                <button type="submit">Post</button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Post;
