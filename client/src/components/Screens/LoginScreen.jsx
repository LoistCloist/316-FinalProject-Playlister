import {
    Typography,
    TextField,
    Button,
    Box,
    Stack
} from '@mui/material'
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import { whiteTextFieldSx } from '../styles';

function LoginScreen() {
    return (
        <>
            <Box id="create-account-header" sx={{ mb: 3}}>
                <LockOutlineIcon sx={{ fontSize: 60 }} />
                <Typography variant="h4">
                    SIGN IN
                </Typography>
            </Box>
            <Stack spacing={2} justifyContents="center">
                <TextField label="Email" variant="outlined" sx={whiteTextFieldSx} />
                <TextField label="Password" variant="outlined" sx={whiteTextFieldSx} />
                <Button >SIGN IN</Button>
            </Stack>
        </>
    )
}
export default LoginScreen;