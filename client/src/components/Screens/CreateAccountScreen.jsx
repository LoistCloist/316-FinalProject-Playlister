import React, { useContext, useState } from 'react';
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
import AuthContext from '../../auth';
import MUIErrorModal from '../Modals/MUIErrorModal';

function CreateAccountScreen() {
    const { auth } = useContext(AuthContext);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarData, setAvatarData] = useState(null);

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Convert to base64 data URL for sending to server
            const base64Reader = new FileReader();
            base64Reader.onloadend = () => {
                setAvatarData(base64Reader.result);
            };
            base64Reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        auth.registerUser(
            formData.get('username'),
            formData.get('email'),
            formData.get('password'),
            formData.get('passwordVerify'),
            avatarData
        )
    }
    
    return (
        <>
            <Box id="create-account-header" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <LockOutlineIcon color="white" sx={{ fontSize: 60 }} />
                <Typography variant="h4" color="white">
                    Create Account
                </Typography>
            </Box>
            <Stack component="form" noValidate onSubmit={handleSubmit} spacing={1} alignItems="center">
                <IconButton component="label">
                    <Stack spacing={1} justifyContent="center" alignItems="center">
                        <Avatar alt="Avatar" src={avatarPreview || "../../assets/react.svg"} />
                        <Typography sx={{ color: 'white'}} >Select Avatar</Typography>
                    </Stack>
                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                </IconButton>
                <TextField name="username" label="Username" variant="outlined" sx={whiteTextFieldSx} />
                <TextField name="email" label="Email" variant="outlined" sx={whiteTextFieldSx} />
                <TextField name="password" type="password" label="Password" variant="outlined" sx={whiteTextFieldSx} />
                <TextField name="passwordVerify" type="password" label="Confirm Password" variant="outlined" sx={whiteTextFieldSx} />
                <Button variant="contained" type="submit">Create Account</Button>
            </Stack>
            <MUIErrorModal />
        </>
    )
}
export default CreateAccountScreen;