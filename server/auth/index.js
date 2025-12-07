const jwt = require("jsonwebtoken")

function authManager() {
    verify = (req, res, next) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({
                    loggedIn: false,
                    user: null,
                    errorMessage: "Unauthorized"
                })
            }
            // checks with our secret key to see if the token belongs to the right person.
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            console.log(`verified.userId: ${verified.userId}`);
            // gives the request a userId field.
            // I don't like that it's a sideffect but apparently it's a common pattern in Express so whatever man.
            req.userId = verified.userId;
            next();
            
        } catch (err) {
            console.error(err);
            return res.status(401).json({
                loggedIn: false,
                user: null,
                errorMessage: "Unauthorized"
            })
        }
    }
    // easier wrapper, just returning the loggedIn userId
    verifyUser = (req) => {
        try {
            const token = req.cookies.token;
            console.log("verifyUser - token from cookies:", token ? "exists" : "missing");
            if (!token) {
                console.log("verifyUser - no token found");
                return null;
            }

            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            console.log("verifyUser - decoded token userId:", decodedToken.userId);
            return decodedToken.userId;
        } catch (err) {
            console.log("verifyUser - error verifying token:", err.message);
            return null;
        }
    }

    signToken = (userId) => {
        return jwt.sign({
            userId: userId
        }, process.env.JWT_SECRET);
    }

    return this;
}

const auth = authManager();
module.exports = auth;