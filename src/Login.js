import loginImg from "./imgs/instagram-login.png";
import "./Login.css";
import { Link } from "react-router-dom";
import { projectAuth } from "./firebase";
import { useState } from "react";
import { useHistory } from "react-router";
const Login = () => {
  const history = useHistory();
  const [email, setEmail] = useState("eslam@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      const res = await projectAuth.signInWithEmailAndPassword(email, password);
      if (!res) {
        throw new Error("Could not complete login");
      }
      setError(null);
      history.push("/timeline");
    } catch (err) {
      console.log(err.message);
      setError(err.message);
    }
    setIsPending(false);
  };
  return (
    <div>
      <div className="login">
        <img src={loginImg} alt="" />
        <div className="log-container">
          <form onSubmit={handleLogin} className="login-form">
            <h1 style={{ marginBottom: "2.5rem", fontFamily: "cursive" }}>
              InstaClone
            </h1>
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            {!isPending && <button className="login-btn">Log in</button>}
            {isPending && (
              <button
                disabled
                style={{ cursor: "not-allowed", opacity: ".5" }}
                className="login-btn"
              >
                loading...
              </button>
            )}
            <span className="error">{error}</span>
          </form>
          <div className="dont-have">
            <span>
              Don't have an account?
              <Link className="signup-link" to="/signup">
                {" "}
                Sign up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
