const auth = require('../auth')
const db = require('../db')
const bcrypt = require('bcryptjs')

getLoggedIn = async (req, res) => {
    try {
        let userId = auth.verifyUser(req);
        console.log(`userId from token: ${userId}`)
        if (!userId) {
            console.log("No userId, returning loggedIn: false");
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "No userId"
            })
        }

        const loggedInUser = await User.findOne({ _id: userId });

        return res.status(200).json({
            loggedIn: true,
            user: {
                firstName: loggedInUser.firstName,
                lastName: loggedInUser.lastName,
                email: loggedInUser.email
            }
        })
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
}

registerUser = async (req, res) => {
    console.log("NOW REGISTERING USER IN BACKEND")
    try {
        const { firstName, lastName, email, password, passwordVerify } = req.body;
        console.log(`Creating user: ${firstName} ${lastName} ${email} ${password} ${passwordVerify}`);
        // If any of these fields are empty, return error.
        if (!firstName || !lastName || !email || !password || !passwordVerify) {
            return res
                    .status(400)
                    .json({ errorMessage: "Please enter all required fields."});
        }
        // If password has insufficient length, return error.
        if (password.length < 8) {
            return res
                    .status(400)
                    .json({ errorMessage: "Password must be at least 8 characters."})
        }
        if (password !== passwordVerify) {
            return res
                    .status(400)
                    .json({ errorMessage: "Passwords do not match!"})
        }
        // check if an existing user already exists.
        const existingUser = await db.findUserByEmail(email);
        if (existingUser) {
            return res
                    .status(400)
                    .json({
                        success: false,
                        errorMessage: "An account with this email address already exists."
                    })
        }

        // Creating password Hash
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash: " + passwordHash)

        // Saving the new user
        const savedUser = await db.createUser({
            firstName,
            lastName,
            email,
            passwordHash
        })
        console.log(`New user saved: ${savedUser._id}`);

        // LOGIN THE USER
        const userId = savedUser._id;
        const token = auth.signToken(userId);
        // sending the cookie back in response 
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            samesite: 'lax'
        }).status(200).json({
            success: true,
            user: {
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email
            }
        })
        console.log(`Token has been sent!`)
    } catch (error) {
        console.error("Error in registered User: ", err);
        res.status(500).json({ errorMessage: "Server error: " + err.message });
    }
}

loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                    .status(400)
                    .json({ error: "Please enter all required fields."});
        }

        const existingUser = await User.findOne({ email: email });
        console.log("existingUser: " + existingUser);
        if (!existingUser) {
            return res
                    .status(401)
                    .json({
                        errorMessage: "Wrong email or password provided or user does not exist."
                    })
        }
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            return res
                    .status(401)
                    .json({
                        errorMessage: "Wrong email or password provided."
                    })
        }

        // LOGIN USER
        const token = auth.signToken(existingUser._id);
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email
            }
        })
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
}

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}