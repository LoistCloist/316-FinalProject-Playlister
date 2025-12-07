import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import authRequestSender from './requests'

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    REGISTER_USER: "REGISTER_USER"
}

function AuthContextProvider(props) {
    const [authState, setAuth] = useState({
        user: null,
        loggedIn: false,
        errorMessage: null
    });
    const navigate = useNavigate();

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: null
                });
            }
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: payload.errorMessage
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    errorMessage: null
                })
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: payload.errorMessage
                })
            }
            default:
                return;
        }
    }

    const getLoggedIn = async function () {
        try {
            const response = await authRequestSender.getLoggedIn();
            console.log("getLoggedIn response:", response.data);
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.GET_LOGGED_IN,
                    payload: {
                        loggedIn: response.data.loggedIn,
                        user: response.data.user
                    }
                });
                console.log("Auth state updated - loggedIn:", response.data.loggedIn);
            }
        } catch (error) {
            console.error("getLoggedIn error:", error);
        }
    }

    const loginUser = async function(email, password) {
        try{
            const response = await authRequestSender.loginUser(email, password);
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.LOGIN_USER,
                    payload: {
                        user: response.data.user,
                        loggedIn: true,
                        errorMessage: null
                    }
                })
                navigate("/playlists");
            }
        } catch(error){
            authReducer({
                type: AuthActionType.LOGIN_USER,
                payload: {
                    user: authState.user,
                    loggedIn: false,
                    errorMessage: error.response?.data?.errorMessage || "Login failed"
                }
            })
        }
    }

    const registerUser = async function(userName, email, password, passwordVerify, avatar = null) {
        console.log("REGISTERING USER");
        try{   
            const response = await authRequestSender.registerUser(userName, email, password, passwordVerify, avatar);   
            if (response.status === 200) {
                console.log("Registered Sucessfully");
                // Verify the cookie was set by calling getLoggedIn
                await getLoggedIn();
                // Navigate to home page since user is now logged in
                navigate("/playlists");
            }
        } catch(error){
            authReducer({
                type: AuthActionType.REGISTER_USER,
                payload: {
                    user: authState.user,
                    loggedIn: false,
                    errorMessage: error.response?.data?.errorMessage || "Registration failed"
                }
            })
        }
    }

    const logoutUser = async function() {
        const response = await authRequestSender.logoutUser();
        if (response.status === 200) {
            authReducer( {
                type: AuthActionType.LOGOUT_USER,
                payload: null
            })
            navigate("/");
        }
    }

    const clearErrorMessage = function() {
        setAuth({
            ...authState,
            errorMessage: null
        });
    }

    // Combine state and methods into auth object (without mutating state)
    const auth = {
        ...authState,
        getLoggedIn,
        registerUser,
        loginUser,
        logoutUser,
        clearErrorMessage
    };

    useEffect(() => {
        auth.getLoggedIn();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };