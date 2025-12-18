import React, { useContext, useEffect, useState } from 'react'
import assets, { imagesDummyData } from '../assets/assets'
import { ChatContext } from '../../Context/ChatContext'
import { AuthContext } from '../../Context/AuthContext';

export default function RightSidebar() {
  const {selectedUser, message} = useContext(ChatContext);
  const {logout, onlineUser} = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([])

//Get all the images from the messages and set them to state//

  useEffect(()=>{
    setMsgImages(
      message.filter(msg=>msg.image).map(msg=>msg.image)
    )
  },[message])

  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? 'mx-md-hidden' : ""}`}>

      <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-20 aspect-[1/1] rounded-full' />
        <h1 className='text-white px-10 text-xl font-medium mx-auto flex items-center gap-2 flex-row-reverse'>
            {onlineUser.includes(selectedUser._id) && <p className='w-2 h-2 rounded-full bg-green-500'></p>}
          {selectedUser.fullName}
        </h1>
        <p className='px-10 mx-auto'>{selectedUser.bio}</p>
      </div>

      <hr className='border-[#ffffff50] my-4' />

      <div className='px-5 text-xs' >
        <p>Media</p>
        <div className=' mb-2 mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80' >
          {msgImages.map((img, index) => (
            <div key={index} onClick={() => window.open(img)} className='cursor-pointer rounded'>
              <img src={img} alt="" className='h-full rounded-md' />
            </div>
          ))}
        </div>
      </div>


      {/*---- logout button----- */}
      
      <div className="mt-6 mb-6 flex justify-center">
        <button onClick={()=>logout()} className='bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm font-light py-2 px-20 rounded-full'>
          Logout
        </button>
      </div>

    </div>
  )
}
