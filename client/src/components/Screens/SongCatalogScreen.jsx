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
    Box,
    CardMedia
} from '@mui/material'
import { whiteSelectSx, whiteTextFieldSx } from '../styles';
import PlaylistCard from '../PlaylistCard.jsx'
import EditSongModal from '../Modals/EditSongModal.jsx'

function SongCatalogScreen() {
    const handleAddSong = () => {
        
    }
    return (
        <>
            <Grid container >
                <Grid item xs={4} md={4}
                    sx={{
                        // flexGrow: 0
                    }}>
                    <Stack sx={{ width: "100%" }} alignItems="flex-start" spacing={1.5} >
                        <Typography color="textLight" variant="h2"> Songs Catalog </Typography>
                        <TextField label="by Title" variant="outlined" sx={whiteTextFieldSx} />
                        <TextField label="by Artist" variant="outlined" sx={whiteTextFieldSx} />
                        <TextField label="by Year" variant="outlined" sx={whiteTextFieldSx} />
                        <Toolbar>
                            <Button variant="contained"> Confirm</Button>
                            <Button variant="contained"> Cancel</Button> 
                        </Toolbar>
                        <CardMedia component="iframe" sx={{ width: '400px', height: '200px' }}
                            src="https://www.youtube.com/embed/OTg5Bs7AXNU" />
        
                    </Stack>
                </Grid>
                {/* <Divider orientation='vertical' flexItem sx={{
                    borderColor: 'white'
                }} /> */}
                <Grid item xs={4} md={4} sx={{
                            flexGrow: 0.5,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "flex-start",
                }}>
                    <EditSongModal />
                    <Box display="flex" flexDirection="column">
                        <Toolbar sx={{ justifyContent: "space-between"}}>
                            <Toolbar sx={{ gap: 1}} >
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
                                <Typography color="white" alignItems="flex-end" variant="h5" >2 Playlists</Typography>
                            </Toolbar>
                        </Toolbar>
                        <Button fullWidth={false} onClick={handleAddSong} variant="contained">Add Song</Button>
                    </Box>
                </Grid>
            </Grid>
        </>
    )
}
export default SongCatalogScreen;