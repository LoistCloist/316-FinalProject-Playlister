import React, { useContext } from 'react';
import { Typography, Card, Link, Button } from '@mui/material'
import AuthContext from '../../auth';

function WelcomeScreen() {
    const { auth } = useContext(AuthContext);
    
    return (
        <div>
            <Typography variant="h2" color="textLight"> The Playlister </Typography>
            {!auth.loggedIn && (
                <>
                    <Button variant="contained">Continue as Guest</Button>
                    <Button variant="contained" href="/login">Login</Button>
                    <Button variant="contained" href="/register">Create Account</Button>
                </>
            )}
            {auth.loggedIn && (
                <>
                <Button variant="contained" href="/playlists">Playlists</Button>
                <Button variant="contained" href="/songs">Songs</Button>
                </>
            )}
        </div>
    )
}

export default WelcomeScreen;