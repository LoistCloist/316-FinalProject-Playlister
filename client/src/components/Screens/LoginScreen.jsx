import {
    Typography,
    TextField,
    Button,
    Box,
    Stack
} from '@mui/material'
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import { whiteTextFieldSx } from '../styles';
import AuthContext from '../../auth';
import { useContext } from 'react';

function LoginScreen() {
    const { auth } = useContext(AuthContext);
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        auth.loginUser(formData.get('email'), formData.get('password'));
    }
    return (
        <>
            <Box id="create-account-header" sx={{ mb: 3}}>
                <LockOutlineIcon sx={{ fontSize: 60 }} />
                <Typography variant="h4">
                    SIGN IN
                </Typography>
            </Box>
            <Stack component="form" noValidate onSubmit={handleSubmit} spacing={2} justifyContents="center">
                <TextField name="email" label="Email" variant="outlined" sx={whiteTextFieldSx} />
                <TextField name="password" type="password" label="Password" variant="outlined" sx={whiteTextFieldSx} />
                <Button type="submit">SIGN IN</Button>
            </Stack>
        </>
    )
}
export default LoginScreen;