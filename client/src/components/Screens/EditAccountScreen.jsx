import LockOutlineIcon from '@mui/icons-material/LockOutline';
import { 
    Box, 
    Typography,
    Stack,
    TextField,
    Button,
    IconButton,
    Avatar,
    Toolbar
} from '@mui/material'
import { whiteTextFieldSx } from '../styles';
import AuthContext from '../../auth';
import { useContext } from 'react';

function EditAccountScreen() {
    const { auth } = useContext(AuthContext);
    const handleGetLoggedIn = () => {
        console.log(auth.getLoggedIn());
    }
    return (
        <>
            <Box id="edit-account-header" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <LockOutlineIcon color="white" sx={{ fontSize: 60 }} />
                <Typography variant="h4" color="white">
                    Edit Account
                </Typography>
            </Box>
            <Stack spacing={1} alignItems="center">
                <IconButton component="label">
                    <Stack spacing={1} justifyContent="center" alignItems="center">
                        <Avatar alt="P" src="../../assets/react.svg" />
                        <Typography sx={{ color: 'white'}} >Change Avatar</Typography>
                    </Stack>
                    <input type="file" hidden accept="image/*" />
                </IconButton>
                <TextField label="Username" variant="outlined" sx={whiteTextFieldSx} />
                <TextField label="Email" variant="outlined" sx={whiteTextFieldSx} />
                <TextField label="Password" variant="outlined" sx={whiteTextFieldSx} />
                <TextField label="Confirm Password" variant="outlined" sx={whiteTextFieldSx} />
                <Toolbar>
                    <Button variant="contained">Confirm</Button>
                    <Button variant="contained">Cancel</Button>
                </Toolbar>
                <Button variant="contained" onClick={handleGetLoggedIn}>getLoggedIn</Button>
            </Stack>
        </>
    )
}
export default EditAccountScreen;