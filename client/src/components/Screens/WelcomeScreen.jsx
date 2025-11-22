import { Typography, Card, Link, Button } from '@mui/material'

function WelcomeScreen() {
    return (
        <div>
            <Typography variant="h2"> The Playlister </Typography>
            <Button>Continue as Guest</Button>
            <Button href="/login">Login</Button>
            <Button href="/register">Create Account</Button>
            <Button href="/playlists">Playlists</Button>
            <Button href="/songs">Songs</Button>
        </div>
    )
}

export default WelcomeScreen;