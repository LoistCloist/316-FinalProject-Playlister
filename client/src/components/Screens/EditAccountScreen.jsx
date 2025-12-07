import React, { useContext, useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import MUIErrorModal from '../Modals/MUIErrorModal';

function EditAccountScreen() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [avatarPreview, setAvatarPreview] = useState(auth.user?.avatar || null);
    const [avatarData, setAvatarData] = useState(null);

    const handleGetLoggedIn = () => {
        console.log(auth.getLoggedIn());
    }
    
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
        auth.editUser(
            formData.get('username'),
            formData.get('email'),
            formData.get('password'),
            formData.get('passwordVerify'),
            avatarData
        );
    }
    
    const handleCancel = () => {
        navigate("/playlists");
    }
    return (
        <>
            <Box id="edit-account-header" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <LockOutlineIcon color="white" sx={{ fontSize: 60 }} />
                <Typography variant="h4" color="white">
                    Edit Account
                </Typography>
            </Box>
            <Stack spacing={1} alignItems="center" component="form" noValidate onSubmit={handleSubmit}>
                <IconButton component="label">
                    <Stack spacing={1} justifyContent="center" alignItems="center">
                        <Avatar alt="Avatar" src={avatarPreview || auth.user?.avatar || "../../assets/react.svg"} />
                        <Typography sx={{ color: 'white'}} >Change Avatar</Typography>
                    </Stack>
                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                </IconButton>
                <TextField name="username" label="Username" variant="outlined" sx={whiteTextFieldSx} defaultValue={auth.user?.userName} />
                <TextField name="email" label="Email" variant="outlined" sx={whiteTextFieldSx} defaultValue={auth.user?.email} />
                <TextField name="password" type="password" label="Password" variant="outlined" sx={whiteTextFieldSx} />
                <TextField name="passwordVerify" type="password" label="Confirm Password" variant="outlined" sx={whiteTextFieldSx} />
                <Toolbar>
                    <Button variant="contained" type="submit">Confirm</Button>
                    <Button variant="contained" onClick={handleCancel}>Cancel</Button>
                </Toolbar>
                <Button variant="contained" onClick={handleGetLoggedIn}>getLoggedIn</Button>
            </Stack>
            <MUIErrorModal />
        </>
    )
}
export default EditAccountScreen;