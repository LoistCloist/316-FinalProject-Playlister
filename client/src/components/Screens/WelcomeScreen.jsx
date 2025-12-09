import React, { useContext } from 'react';
import { Typography, Button, Box, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../auth';

function WelcomeScreen() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 200px)',
                gap: 3
            }}
        >
            <Typography variant="h2" color="textLight"> The Playlister </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
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
            </Stack>
        </Box>
    )
}

export default WelcomeScreen;