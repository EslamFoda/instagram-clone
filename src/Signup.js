import './Signup.css'
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { projectAuth } from './firebase';
import { useHistory } from 'react-router';
const Signup = () => {
    const history = useHistory()
    const [email,setEmail] = useState('')
    const [displayName,setdisplayName] = useState('')
    const [password,setPassword] = useState('')
    const [error,setError] = useState(null)
    const [isPending,setIsPending] = useState(false)
    const handleSubmit = async (e)=>{
    e.preventDefault();
    setIsPending(true)
    setError(null)
    try {
        const res = await projectAuth.createUserWithEmailAndPassword(email, password)
        if (!res) {
          throw new Error('Could not complete signup')
        }
        await res.user.updateProfile({ displayName })
        setError(null)
        history.push('/timeline')
        return res
      }
      catch(err) {
        console.log(err.message)
        setError(err.message)
        
      } 
      setIsPending(false) 
  }

    return ( 
        <div className='signup'>
             <form onSubmit={handleSubmit} className='login-form'>
                <h1 style={{marginBottom:'2.5rem',fontFamily:'cursive'}}>InstaClone</h1>
                <input type="email" required placeholder='Email address' onChange={(e)=>{setEmail(e.target.value)}}/>
                <input type="text" required placeholder='Username' onChange={(e)=>{setdisplayName(e.target.value)}}/>
                <input type="password" required placeholder='Password' onChange={(e)=>{setPassword(e.target.value)}}/>
               {!isPending && <button className='login-btn'>Sign up</button>}
                 {isPending && <button disabled style={{cursor:"not-allowed",opacity:'.5'}} className='login-btn'>loading...</button>}
                <span className='error'>{error}</span>
                <span className='error'>{error}</span>
                <p style={{fontSize:'small',color:'GrayText',opacity:'.8',marginTop:'1rem'}}>By signing up, you agree to our Terms , Data Policy and Cookies Policy .</p>
            </form>
            <div className='have-acc'>
                <span>Have an account?<Link className='signup-link' to='/'> Log in</Link></span>
            </div>
        </div>
     );
}
 
export default Signup;