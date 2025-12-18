import cloudinary from "../lib/cloudinary.js";
import messageModel from "../model/messageModel.js";
import userModel from "../model/userModel.js";
import { io, userSocketMap } from "../server.js"
// import { authMiddleware } from "../middleware/auth.js";

// get users except logged in user jo signup in karenge also get the number of unread messages//
//for sidebar users//
export const getUserForSidebar = async (req, res) => {
    try {

        // ab userId mil jayega auth middleware se jisse hum logged in walo ko filter karenge//
        const userId = req.user._id;

        // ab hum filter karenge sabhi users ko except logged in user uski user id ki madad se //
        const filterUsers = await userModel.find({ _id: { $ne: userId } }).select("-password")

        // now count the number of messages not seen jo logged in user ne read nahi kiya //

        const unseenMessages = {};// ye object hoga jisme hum user id ke hisab se unseen messages count karenge //

        // ye promises array hoga jisme hum sabhi users ke unseen messages count karenge isme v me sabhi filter user hai //
        const promises = filterUsers.map(async (v) => {

            // ab hum count karenge ki kitne messages hai jo senderId v._id (jo filter user hai) aur receiverId userId (logged in user) ke beech me hai aur jo abhi tak seen nahi hua //   
            const messages = await messageModel.find({ senderId: v._id, receiverId: userId, seen: false });

            // check karenge ki messages length 0 se jyada hai to hi unseenMessages me add karenge //
            if (messages.length > 0) {

                // yahan obj[key] = value logic use karenge //
                unseenMessages[v._id] = messages.length; // ab hum unseenMessages object me user id ke hisab se unseen messages count karenge //
            }
        })
        await Promise.all(promises); // sabhi promises ko resolve karenge //
        res.json({ success: true, users: filterUsers, unseenMessages }); // ab hum filterUsers aur unseenMessages ko response me bhejenge //
    } catch (error) {
        console.log(error);
        res.json({ success: false, msg: "Failed to fetch users for sidebar" });

    }
}



// get all messages between logged in user and selected user //
//Logged-in user aur selected user ke beech ke saare messages lana//
export const getMessages = async (req, res) => {
    try {

        // const { id: selectedUserId } = req.params;
        const selecteduserId = req.params.id; // yahan pe id se matlab hai selected user ya selected user ki id//
        const myId = req.user._id;  // ye user jo logged in hai uski id hai //
        const allMessages = await messageModel.find({
            $or: [
                { senderId: myId, receiverId: selecteduserId },//maine usse bheje//
                { senderId: selecteduserId, receiverId: myId },//usne mujhe bheje//
            ]
        })
        //Jitne messages selected user ne mujhe bheje un sab ko seen = true kar do//
        await messageModel.updateMany({ senderId: selecteduserId, receiverId: myId }, { seen: true });

        res.json({ success: true, allMessages })
    } catch (error) {
        console.log(error);
        res.json({ success: false, msg: "Failed to fetch" });
    }
}


// api to mark messages as seen using message id//

export const markSeenMessages = async (req, res) => {
    try {
        const { id } = req.params;//ye messages ki id hai//
        // ab messageModel se find karenge id ke through aur update karenge seen true//
        await messageModel.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true })
    } catch (error) {
        console.log(error);
        res.json({ success: false, msg: "Failed to fetch" });
    }
}


// send message to selected User with help  of use of socket io//

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;// from midleware//

        let imageUrl;
        if (image) {
            const uploadImg = await cloudinary.uploader.upload(image);
            imageUrl = uploadImg.secure_url;
        }

        const newMessage = await messageModel.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        //-------------Emit the new message to the reciever's Socket---------- //

        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }
        //----------------------------------------------------------------------//
        res.json({ success: true, newMessage })

    } catch (error) {
        console.log(error);
        res.json({ success: false, msg: "Failed to fetch" });
    }
}

