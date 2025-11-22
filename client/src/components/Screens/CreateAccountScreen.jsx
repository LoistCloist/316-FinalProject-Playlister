import LockOutlineIcon from '@mui/icons-material/LockOutline';
import { 
    Box, 
    Typography,
    Stack,
    TextField,
    Button,
    IconButton,
    Avatar
} from '@mui/material'
import { whiteTextFieldSx } from '../styles';

function CreateAccountScreen() {
    return (
        <>
            <Box id="create-account-header" >
                <LockOutlineIcon sx={{ fontSize: 60 }} />
                <Typography variant="h4">
                    Create Account
                </Typography>
            </Box>
            <Stack spacing={1} justifyContents="center">
                <IconButton component="label">
                    <Stack spacing={1} justifyContent="center" alignItems="center">
                        <Avatar alt="P" src="../../assets/react.svg" />
                        <Typography sx={{ color: 'white'}} >Select Avatar</Typography>
                    </Stack>
                    <input type="file" hidden accept="image/*" />
                </IconButton>
                <TextField label="Username" variant="outlined" sx={whiteTextFieldSx} />
                <TextField label="Email" variant="outlined" sx={whiteTextFieldSx} />
                <TextField label="Password" variant="outlined" sx={whiteTextFieldSx} />
                <TextField label="Confirm Password" variant="outlined" sx={whiteTextFieldSx} />
                <Button >Create Account</Button>
            </Stack>
        </>
    )
}
export default CreateAccountScreen;