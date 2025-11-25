import {
    Grid,
    Stack,
    Divider,
    TextField,
    Typography,
    Toolbar,
    Button,
    MenuItem,
    Select,
    Box
} from '@mui/material'
import { whiteSelectSx, whiteTextFieldSx } from '../styles';

function PlaylistsScreen() {
    return (
        <>
            <Grid container >
                <Grid item xs={12} md={6}
                    sx={{
                        flexGrow: 1
                    }}>
                    <Stack sx={{ width: "100%" }} alignItems="flex-start" spacing={1.5} >
                        <Typography color="textLight" variant="h2"> Playlists </Typography>
                        <TextField label="by PlaylistName" variant="outlined" sx={whiteTextFieldSx} />
                        <TextField label="by Username" variant="outlined" sx={whiteTextFieldSx} />
                        <TextField label="by Song Title" variant="outlined" sx={whiteTextFieldSx} />
                        <TextField label="by Song Artist" variant="outlined" sx={whiteTextFieldSx} />           
                        <TextField label="by Song Year" variant="outlined" sx={whiteTextFieldSx} />
                        <Toolbar>
                            <Button variant="contained"> Confirm</Button>
                            <Button variant="contained"> Cancel</Button> 
                        </Toolbar>
                    </Stack>
                </Grid>
                <Divider orientation='vertical' flexItem sx={{
                    borderColor: 'white'
                }} />
                <Grid item xs={12} md={6} sx={{
                            flexGrow: 1,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "flex-start",
                }}>
                    <Box display="flex" flexDirection="row">
                        <Toolbar sx={{ gap: 1}} alignItems="flex-start">
                            <Typography color="textLight" sx={{ p: 2}}>Sort: </Typography>
                            <Select displayEmpty sx={whiteSelectSx}>
                                <MenuItem>Listener Count</MenuItem>
                                <MenuItem>Playlist Name</MenuItem>
                                <MenuItem>Username</MenuItem>
                            </Select>
                            <Select displayEmpty sx={whiteSelectSx}>
                                <MenuItem>Ascending</MenuItem>
                                <MenuItem>Descending</MenuItem>
                            </Select>
                        </Toolbar>
                        <Typography color="white" alignItems="flex-end" variant="h5" >2 Playlists</Typography>
                    </Box>
                </Grid>
            </Grid>
        </>
    )
}
export default PlaylistsScreen;