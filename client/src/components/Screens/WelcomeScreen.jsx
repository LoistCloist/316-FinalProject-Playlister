import { Typography, Card, Link, Button } from '@mui/material'

function WelcomeScreen() {
    return (
        <div>
            <Typography variant="h2"> The Playlister </Typography>
            <Button>Continue as Guest</Button>
            <Button href="/login">Login</Button>
            <Button href="/register">Create Account</Button>
        </div>
    )
}

export default WelcomeScreen;