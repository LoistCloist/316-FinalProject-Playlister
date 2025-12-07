const auth = require('../auth')
const User = require('../schemas/user-model')
const bcrypt = require('bcrypt')
const { randomUUID } = require('crypto');

getLoggedIn = async (req, res) => {
    try {
        console.log("getLoggedIn called");
        console.log("Cookies received:", req.cookies);
        console.log("Token cookie:", req.cookies.token);
        // verifyUser returns MongoDB _id (document ID), not the UUID userId
        let mongooseId = auth.verifyUser(req);
        console.log("Verified mongoose _id:", mongooseId);
        if (!mongooseId) {
            console.log("No mongoose _id found, returning loggedIn: false");
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            })
        }

        const loggedInUser = await User.findOne({ _id: mongooseId });
        console.log("loggedInUser found:", loggedInUser ? "yes" : "no");

        const response = {
            loggedIn: true,
            user: {
                userId: loggedInUser.userId,
                userName: loggedInUser.userName,
                email: loggedInUser.email,
                avatar: loggedInUser.avatar,
                playlists: loggedInUser.playlists
            }
        };
        console.log("Sending getLoggedIn response:", JSON.stringify(response));
        return res.status(200).json(response)
    } catch (err) {
        console.log("getLoggedIn error: " + err);
        console.log("Error stack:", err.stack);
        return res.status(200).json({
            loggedIn: false,
            user: null,
            errorMessage: err.message
        });
    }
}

loginUser = async (req, res) => {
    console.log("=== loginUser called ===");
    try {
        const { email, password } = req.body;
        console.log("Login attempt - email:", email);
        console.log("Login attempt - password provided:", password ? "yes" : "no");

        if (!email || !password) {
            console.log("Missing required fields - email:", !!email, "password:", !!password);
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const existingUser = await User.findOne({ email: email });
        console.log("User lookup result:", existingUser ? "found" : "not found");
        if (existingUser) {
            console.log("Found user - _id:", existingUser._id, "userId:", existingUser.userId, "userName:", existingUser.userName);
        }
        
        if (!existingUser) {
            console.log("User not found with email:", email);
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        console.log("Comparing password...");
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        console.log("Password comparison result:", passwordCorrect ? "correct" : "incorrect");
        
        if (!passwordCorrect) {
            console.log("Incorrect password for user:", email);
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                })
        }

        // LOGIN THE USER - use MongoDB _id (document ID) for JWT token
        console.log("Password correct, generating token with _id:", existingUser._id);
        const token = auth.signToken(existingUser._id);
        console.log("Token generated:", token ? "success" : "failed");

        const responseData = {
            success: true,
            user: {
                userId: existingUser.userId,
                userName: existingUser.userName,
                email: existingUser.email,
                avatar: existingUser.avatar,
                playlists: existingUser.playlists          
            }
        };
        console.log("Sending login response:", JSON.stringify(responseData));
        console.log("Setting cookie with token");
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Set to false for localhost (HTTP), true for production (HTTPS)
            sameSite: "lax" // Use "lax" for localhost
        }).status(200).json(responseData);
        
        console.log("=== loginUser completed successfully ===");

    } catch (err) {
        console.error("=== loginUser error ===");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        res.status(500).send();
    }
}
// clears the jwt token by setting it to an empty string.
logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: false, // Set to false for localhost (HTTP), true for production (HTTPS)
        sameSite: "lax" // Use "lax" for localhost
    }).send();
}

registerUser = async (req, res) => {
    console.log("REGISTERING USER IN BACKEND");
    try {
        const { userName, email, password, passwordVerify, avatar } = req.body;
        console.log("create user: " + userName + " " + email + " " + password + " " + passwordVerify);
        if (!userName || !email || !password || !passwordVerify) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        console.log("all fields provided");
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        console.log("password long enough");
        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        console.log("password and password verify match");
        const existingUser = await User.findOne({ email: email });
        console.log("existingUser: " + existingUser);
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash: " + passwordHash);

        const userId = randomUUID(); // UUID for user identification
        const newUser = new User({ userId, userName, email, passwordHash, avatar: avatar || ''});
        const savedUser = await newUser.save();
        console.log("new user saved - _id:", savedUser._id, "userId:", savedUser.userId);

        // LOGIN THE USER - use MongoDB _id (document ID) for JWT token
        const token = auth.signToken(savedUser._id);
        console.log("token:" + token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Set to false for localhost (HTTP), true for production (HTTPS)
            sameSite: "lax" // Use "lax" for localhost, "none" requires secure: true
        }).status(200).json({
            success: true,
            user: {
                userId: savedUser.userId, // UUID
                userName: savedUser.userName,
                email: savedUser.email,
                avatar: savedUser.avatar,
                playlists: savedUser.playlists
            }
        })

        console.log("token sent");

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

editUser = async (req, res) => {
    console.log("EDITING USER IN BACKEND");
    try {
        // Verify the user is logged in and get their MongoDB _id
        const mongooseId = auth.verifyUser(req);
        console.log("Verified mongoose _id:", mongooseId);
        
        if (!mongooseId) {
            console.log("No authenticated user found");
            return res.status(401).json({
                errorMessage: "You must be logged in to edit your account."
            });
        }

        // Find the logged-in user by their MongoDB _id
        const loggedInUser = await User.findOne({ _id: mongooseId });
        console.log("Logged in user found:", loggedInUser ? "yes" : "no");
        
        if (!loggedInUser) {
            console.log("Logged in user not found in database");
            return res.status(401).json({
                errorMessage: "User not found."
            });
        }

        const { userName, email, password, passwordVerify, avatar } = req.body;
        console.log("Edit request - userName:", userName, "email:", email);
        
        if (!userName || !email || !password || !passwordVerify) {
            console.log("Missing required fields");
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        
        if (password.length < 8) {
            console.log("Password too short");
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        
        if (password !== passwordVerify) {
            console.log("Passwords do not match");
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }

        // Check if email is being changed and if the new email is already taken by another user
        if (email !== loggedInUser.email) {
            const emailTaken = await User.findOne({ email: email });
            if (emailTaken) {
                console.log("Email already taken by another user");
                return res.status(400).json({
                    errorMessage: "An account with this email address already exists."
                });
            }
        }

        // Update the logged-in user's information
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("Password hash generated");
        
        loggedInUser.userName = userName;
        loggedInUser.email = email;
        loggedInUser.passwordHash = passwordHash;
        
        // Only update avatar if a new one is provided
        if (avatar !== null && avatar !== undefined) {
            console.log("Updating avatar");
            loggedInUser.avatar = avatar;
        }
        
        const savedUser = await loggedInUser.save();
        console.log("User saved - _id:", savedUser._id, "userId:", savedUser.userId);
        
        return res.status(200).json({
            success: true,
            user: {
                userId: savedUser.userId,
                userName: savedUser.userName,
                email: savedUser.email,
                avatar: savedUser.avatar,
                playlists: savedUser.playlists
            }
        })
    } catch (err) {
        console.error("=== editUser error ===");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        res.status(500).json({
            errorMessage: "An error occurred while updating your account."
        });
    }
}
module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    editUser
}