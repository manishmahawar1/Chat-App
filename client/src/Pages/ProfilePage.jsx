import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';

export default function ProfilePage() {

  const { authUser, updateProfile } = useContext(AuthContext)
  const [selectedimg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser.fullname);
  const [bio, setBio] = useState(authUser.bio)

  const handle = async (e) => {
    e.preventDefault(); 
    if (!selectedimg) {
      await updateProfile({ fullname: name, bio });
      navigate('/');
      return
    }
    // agar mere pass image hai//
    const reader = new FileReader();
    reader.readAsDataURL(selectedimg);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullname: name, bio });
      navigate("/");
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form action="" className='flex flex-col gap-5 p-10 flex-1' onSubmit={handle}>
          <h3 className='text-lg'>Profile Details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input onChange={(e) => setSelectedImg(e.target.files[0])} type="file" id="avatar" accept='.png, .jpg, .jpeg' hidden />
            <img src={selectedimg ? URL.createObjectURL(selectedimg) : assets.avatar_icon} alt="" className={`w-12 h-12 ${selectedimg && 'rounded-full'}`} />
            upload profile image
          </label>

          <input onChange={(e) => setName(e.target.value)} value={name} type="text" required placeholder='your name' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ' />
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder='Write profile bio' required rows={5} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 '></textarea>
          <button type='submit' className='bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer'>Save</button>
        </form>
        <img src={authUser?.profilePic || assets.logo_icon} alt="" className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedimg && 'rounded-full'}`} />

      </div>
    </div>
  )
}
