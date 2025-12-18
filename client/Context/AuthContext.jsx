import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast'
import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;  //Ab har axios request automatically is URL se jayegi contextValue me backendURL dene ki jaroorat nahi //

export const AuthContext = createContext(null);

export const AuthProvider = (props) => {

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUser, setOnlineuser] = useState([]);
    const [socket, setSocket] = useState(null)


    //-----------Check if user is authenticated and if so, set the user data and connect the socket-----------//

    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }

    }

    // Login function to handle user authenticate and socket connection//

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials)
            if (data.success) {
                setAuthUser(data.existingUser);
                connectSocket(data.existingUser);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.existingUser));
                toast.success(data.msg)
            } else {
                toast.error(data.msg)
            }
        } catch (error) {
            toast.error(error?.response?.data?.msg || "Something went wrong")
        }
    }

    // logout function to handle user logout and socket disconnection//

    const logout = async () => {
        // localStorage.removeItem("token");
        // setToken(null)
        // setAuthUser(null);
        // setOnlineuser([]);
        // delete axios.defaults.headers.common["token"]
        // toast.success("Logged Out Successfully");
        //  socket.disconnect();

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setAuthUser(null);
        setOnlineuser([]);

        delete axios.defaults.headers.common["token"];

        if (socket) {
            socket.disconnect();
            setSocket(null);
        }

        toast.success("Logged Out Successfully");

    }


    //Update profile function to handle user profile updates//

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            toast.error(error.msg)
        }
    }


    // connects socket function to handle socket connection and online user update//
    //----------------------------------------------------------------------------------------//
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;//socket?.connected = is false
        const newsocket = io(backendUrl, {
            query: {
                userId: userData._id
            }
        });
        newsocket.connect();
        setSocket(newsocket);

        newsocket.on("getOnlineUsers", (userIds) => {
            setOnlineuser(userIds)
        })
    }

    //---------------------------------------------------------------------------------------//

    useEffect(() => {

        // if (token) {
        //     axios.defaults.headers.common["token"] = token;
        //     checkAuth();
        // }
        const storedToken = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedToken && storedUser) {
            setToken(storedToken);
            setAuthUser(storedUser);
            axios.defaults.headers.common["token"] = storedToken;
            connectSocket(storedUser);
        }

        if (storedToken) {
            checkAuth();
        }


    }, [])

    const contextValue = {
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {props.children}
        </AuthContext.Provider>
    )
};