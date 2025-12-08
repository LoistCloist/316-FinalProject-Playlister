import React, { useContext } from 'react';
import { Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../auth';

function WelcomeScreen() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    
    return (
        <div>
            <Typography variant="h2" color="textLight"> The Playlister </Typography>
            {!auth.loggedIn && (
                <>
                    <Button variant="contained" onClick={() => navigate('/playlists')}>Continue as Guest</Button>
                    <Button variant="contained" onClick={() => navigate('/login')}>Login</Button>
                    <Button variant="contained" onClick={() => navigate('/register')}>Create Account</Button>
                </>
            )}
            {auth.loggedIn && (
                <>
                <Button variant="contained" onClick={() => navigate('/playlists')}>Playlists</Button>
                <Button variant="contained" onClick={() => navigate('/songs')}>Songs</Button>
                </>
            )}
        </div>
    )
}

export default WelcomeScreen;