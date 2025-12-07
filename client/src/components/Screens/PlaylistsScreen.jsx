import { useContext, useEffect } from 'react'
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
    List
} from '@mui/material'
import { whiteSelectSx, whiteTextFieldSx } from '../styles';
import PlaylistCard from '../PlaylistCard'
import PlaylistStoreContext from '../../stores/playlist_store'
import AuthContext from '../../auth'

function PlaylistsScreen() {
    const { playlistStore } = useContext(PlaylistStoreContext);
    const { auth } = useContext(AuthContext);
    
    useEffect(() => {
        // Load user playlists when component mounts or when auth state changes
        if (playlistStore && playlistStore.loadUserPlaylists && auth.loggedIn && auth.user?.userId) {
            playlistStore.loadUserPlaylists();
        }
    }, [playlistStore, auth.loggedIn, auth.user?.userId]);
    return (
        <>
            <Grid container display="flex" flexDirection="row">
                <Grid item xs={6} md={6} display="Flex" flexDirection="row">
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
                <Grid item xs={6} md={6} sx={{
                            display: "flex",
                            flexDirection: "column"
                }}>
                    <Box flexDirection="column" sx={{ display: "flex"}}>
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
                        <List id="playlist-cards" sx={{overflow: 'scroll'}}>
                            {
                                playlistStore?.playlists?.map((playlist) => (
                                    <PlaylistCard key={playlist.playlistId} playlist={playlist} />
                                ))
                            }
                        </List>
                    </Box>
                    <Button variant="contained">Add Playlist</Button>
                </Grid>
            </Grid>
        </>
    )
}
export default PlaylistsScreen;