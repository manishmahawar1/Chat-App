import { createContext, useContext, useEffect, useState } from "react"
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = (props) => {

    const [message, setMessage] = useState([]);
    const [users, setUsers] = useState([]); // list of user left sidebar
    const [selectedUser, setSelectedUser] = useState(null);// we store id of user to whom we want to chat//
    const [unseenMessages, setUnSeenMessages] = useState({})

    const { socket, axios } = useContext(AuthContext);


    // function to get all user for sidebar//

    const getUserForSidebar = async () => {
        try {
            const { data } = await axios.get("/api/messages/users")
            if (data.success) {
                setUsers(data.users) // backend ke response//
                setUnSeenMessages(data.unseenMessages)//backend ke response//
            }

        } catch (error) {
            toast.error(error.msg)
        }
    }

    // function to get messages for selected user//
    // const selecteduserId = req.params.id = userId ye selected user ki id hai//
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessage(data.allMessages)// allMessages from backend api//
            }
        } catch (error) {
            toast.error(error.msg)
        }
    }
    // function for send messages to the particular selected user//
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessage((prevMessages) => [...prevMessages, data.newMessage]) // newmessages from backend api ke res.json se//
            }
        } catch (error) {
            toast.error(error.msg)
        }
    }

    //  function to subscribe to messages for selected user//

    const subscribeToMessages = async () => {
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessage((prevMessages) => [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnSeenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages, [newMessage.senderId]:
                        prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }


    // function to unSubscribe from messages//

    const unsubscribeFromMessages = () => {
        if (socket) socket.off("newMessage");

    }

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages()
    }, [socket, selectedUser])

    const chatContextValue = {

        message,
        users, selectedUser,
        getUserForSidebar,
        setMessage, sendMessage,
        setSelectedUser, unseenMessages, setUnSeenMessages, getMessages

    }
    return (
        <ChatContext.Provider value={chatContextValue}>
            {props.children}
        </ChatContext.Provider>
    )
}