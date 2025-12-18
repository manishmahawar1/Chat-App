import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import userModel from "../model/userModel.js";
import bcrypt from "bcrypt";

// Signup controller //

export const signup = async (req, res) => {
    const { fullname, email, password, bio } = req.body;
    
    try {
        if (!fullname || !email || !password || !bio) {
            return res.json({ success: false, msg: "Missing details" })
        }
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, msg: "User already exists" });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                msg: "Password must be at least 6 characters"
            });
        }
        // password hashing //
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // new user create krna h //
        const newUser = new userModel({
            fullname,
            email: email.toLowerCase(),
            password: hashedPassword,
            bio: bio
        })
        // new user ko db m save krna h //
        await newUser.save();
        // JWT token generate krna h new user ke liye //
        const token = generateToken(newUser._id);
        res.json({
            success: true,
            token,
            userData: {
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                bio: newUser.bio
            },
            msg: "User registered successfully"
        });



    } catch (error) {
        console.log(error);
        res.json({ success: false, msg: "Signup failed" })

    }
}


// Login controller //

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.json({ success: false, msg: "Missing details" })
        }

        // ab SARA Data Existing user ke pass hoga//

        const existingUser = await userModel.findOne({ email });

        if (!existingUser) {
            return res.json({ success: false, msg: "User does not exist" });
        }
        // user ka pssword aur db m jo password h wo match krana h //
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, msg: "Invalid credentials" });
        }
        // JWT token generate karenge existing user ke liye existing user ki id se  taaki har new login se naya token generate ho //
        const token = generateToken(existingUser._id);
        res.json({
            success: true,
            msg: "Login successful",
            existingUser,
            token,
        })

    } catch (error) {
        console.log(error);
        res.json({ success: false, msg: "Login failed" });
    }
}

// controller to check if user is authenticated  ye function user data dega agar user authenticate hoga //

 export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user })
}


// user update profile details controller //

export const updateProfile = async (req, res) => {
    try {
        const { fullname, bio, profilePic } = req.body;
        //yahan sabse pehle authenticated user ki id milegi auth middleware se, auth me humne req.user me poora user pass kiya tha ye yahan hum userId variable me usii user ki id le rahe hai //
        const userId = req.user._id;


        // ab hum ek updateUser variable banayenge//
        let updatedUser;
        if (!profilePic) {
          // agar profilePic nahi hai to hum sirf bio aur fullname update karenge //
            updatedUser = await userModel.findByIdAndUpdate( userId , { bio, fullname }, { new: true });
        } else {
            // agar profilePic h to hum cloudinary pe upload karenge //
            const upload = await cloudinary.uploader.upload(profilePic);
            // ab user ko update karenge new profile pic ke sath //
            updatedUser = await userModel.findByIdAndUpdate( userId , { bio, fullname, profilePic: upload.secure_url }, { new: true })
        }
        res.json({ success: true, user: updatedUser, msg: "Profile updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, msg: "Profile update failed" });

    }
}