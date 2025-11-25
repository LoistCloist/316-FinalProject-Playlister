import { Typography, Card, Link, Button } from '@mui/material'

function WelcomeScreen() {
    return (
        <div>
            <Typography variant="h2" color="textLight"> The Playlister </Typography>
            <Button variant="contained">Continue as Guest</Button>
            <Button variant="contained" href="/login">Login</Button>
            <Button variant="contained" href="/register">Create Account</Button>
            <Button variant="contained" href="/playlists">Playlists</Button>
            <Button variant="contained" href="/songs">Songs</Button>
        </div>
    )
}

export default WelcomeScreen;