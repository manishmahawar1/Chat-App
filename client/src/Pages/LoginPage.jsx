import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {

  const [currState, setCurrState] = useState("Sign Up");
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");

  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const {login} = useContext(AuthContext);
  const navigate = useNavigate();

  const submitHandler = async(e) => {
    e.preventDefault();

    if (currState === "Sign Up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return
    }

   await login(currState === "Sign Up" ? "signup" : 'login',{fullname,email,password,bio})
     
  navigate('/')

  }


  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl xs:flex-col'>

      {/* ---------left------- */}

      <img src={assets.logo} alt="logo" className='w-[min(30vw,250px)' />

      {/* --------Right-------- */}

      <form className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg xs-w-[100%]' onSubmit={submitHandler}>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {isDataSubmitted && (
            <img src={assets.arrow_icon} alt="cross-arrow" className='w-5 cursor-pointer' onClick={() => setIsDataSubmitted(false)} />
          )}

        </h2>

        {
          currState === "Sign Up" && !isDataSubmitted && (
            <input type="text" name="fullname" className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder='Full Name' required onChange={(e) => setFullName(e.target.value)} value={fullname} />

          )}
        {!isDataSubmitted && (
          <>
            <input type="email" name="email" className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Email' required onChange={(e) => setEmail(e.target.value)} value={email} />
            <input type="password" name="password" className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='password' required onChange={(e) => setPassword(e.target.value)} value={password} />
          </>

        )}

        {currState === "Sign Up" && isDataSubmitted && (
          <textarea name="bio" rows="3" className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder='Bio...' required onChange={(e) => setBio(e.target.value)} value={bio}></textarea>
        )}

        <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
          {currState === "Sign Up" ? "Create Account" : "Login"}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type="checkbox" required className=' accent-purple-600 cursor-pointer' />
          <p>agree to the term of use & privacy policy.</p>
        </div>

        <div className='flex flex-col gap-2'>
          {currState === "Sign Up" ? (
            <p className='text-sm text-gray-600'>Already have an account? <span onClick={() => { setCurrState("Login"); setIsDataSubmitted(false) }} className='font-medium text-violet-500 cursor-pointer'>Login here</span></p>
          ) : (
            <p className='text-sm text-gray'>Create an account <span onClick={() => { setCurrState("Sign Up"); setIsDataSubmitted(false) }} className='font-medium text-violet-500 cursor-pointer'>Click here</span></p>
          )}
        </div>

      </form>


    </div>
  )
}
