import loginImg from './imgs/instagram-login.png'
import './Login.css'
import { Link } from 'react-router-dom';
import { projectAuth } from './firebase';
import { useState } from 'react';
import { useHistory } from 'react-router';
const Login = () => {
    const history = useHistory()
     const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [error,setError] = useState(null)

    const handleLogin = async (e)=>{
    e.preventDefault();
    setError(null)
    try {
        const res = await projectAuth.signInWithEmailAndPassword(email,password)
        if (!res) {
          throw new Error('Could not complete login')
        }
        setError(null)
        history.push('/timeline')
      }
      catch(err) {
        console.log(err.message)
        setError(err.message)
      }  
     
  }
    return ( 
        <div>
            <div className='login'>
            <img src={loginImg} alt="" />
            <div>
            <form onSubmit={handleLogin} className='login-form'>
                <h1 style={{marginBottom:'2.5rem',fontFamily:'cursive'}}>InstaClone</h1>
                <input type="email" required placeholder='Email address' onChange={(e)=>{setEmail(e.target.value)}}/>
                <input type="password" required placeholder='Password' onChange={(e)=>{setPassword(e.target.value)}}/>
                <button className='login-btn'>Log in</button>
                <span className='error'>{error}</span>
            </form>
            <div  className='dont-have'>
                <span>Don't have an account?<Link className='signup-link' to='/signup'> Sign up</Link></span>
            </div>
            </div>
            </div>
        </div>
     );
}
 
export default Login;