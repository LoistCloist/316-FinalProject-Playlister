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
import { styled } from '@mui/material/styles';
import { whiteTextFieldSx } from '../styles';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

function CreateAccountScreen() {
    return (
        <>
            <Box id="create-account-header" >
                <LockOutlineIcon size="large"/>
                <Typography variant="h3">
                    Create Account
                </Typography>
            </Box>
            <Stack>
                <TextField label="Username" variant="outlined" sx={whiteTextFieldSx} />
                <TextField label="Email" variant="outlined" sx={whiteTextFieldSx} />
                <TextField label="Password" variant="outlined" sx={whiteTextFieldSx} />
                <TextField label="Confirm Password" variant="outlined" sx={whiteTextFieldSx} />
                <Button>Create Account</Button>
            </Stack>
            <Box id="avatar-select">
                <IconButton 
                    component="label"
                    variant="contained"
                    role={undefined}
                    tabIndex={-1}
                    >
                    <Avatar alt="P" src="../../assets/react.svg" />
                    <VisuallyHiddenInput 
                        type="file" 
                        onChange={(event) => console.log(event.target.files)} 
                        multiple
                    />
                    <Typography>SELECT</Typography>
                </IconButton>
                
            </Box>
        </>
    )
}
export default CreateAccountScreen;