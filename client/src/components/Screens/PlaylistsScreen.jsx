import { useContext, useEffect, useState } from 'react'
import {
    Grid,
    Stack,
    Divider,
    TextField,
    Typography,
    Button,
    MenuItem,
    Select,
    Box,
    List,
    Toolbar
} from '@mui/material'
import { whiteSelectSx, whiteTextFieldSx } from '../styles';
import PlaylistCard from '../PlaylistCard'
import PlaylistStoreContext from '../../stores/playlist_store'
import AuthContext from '../../auth'
import EditPlaylistModal from '../Modals/EditPlaylistModal'
import DeletePlaylistModal from '../Modals/DeletePlaylistModal'

function PlaylistsScreen() {
    const { playlistStore } = useContext(PlaylistStoreContext);
    const { auth } = useContext(AuthContext);  
    const [sortBy, setSortBy] = useState('listenerCount');
    const [sortOrder, setSortOrder] = useState('asc');
    
    // Re-sort whenever sortBy or sortOrder changes
    useEffect(() => {
        if (playlistStore?.playlists?.length > 0 && playlistStore?.sortPlaylists) {
            playlistStore.sortPlaylists(sortBy, sortOrder);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, sortOrder]);
    
    const handleSortByChange = (event) => {
        setSortBy(event.target.value);
    }
    
    const handleSortOrderChange = (event) => {
        setSortOrder(event.target.value);
    }
    
    useEffect(() => {
        // Load user playlists when component mounts or when auth state changes
        // Note: playlistStore intentionally excluded from dependencies to prevent reload on sort
        if (playlistStore && playlistStore.loadUserPlaylists && auth.loggedIn && auth.user?.userId) {
            playlistStore.loadUserPlaylists();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.loggedIn, auth.user?.userId]);
    
    // Re-sort when playlists array length changes (e.g., after update or delete)
    // Only watch length to avoid infinite loops from array reference changes
    useEffect(() => {
        if (playlistStore?.playlists && playlistStore?.sortPlaylists) {
            if (playlistStore.playlists.length > 0) {
                playlistStore.sortPlaylists(sortBy, sortOrder);
            }
            // Even if empty, the component should re-render to show "No playlists found"
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playlistStore?.playlists?.length]);
    
    const playlistCount = playlistStore?.playlists?.length || 0;
    
    return (
        <>
            <Box sx={{ px: 4, py: 3 }}>
                <Grid container spacing={4} display="flex" flexDirection="row">
                    <Grid item xs={6} md={6} display="flex" flexDirection="row" sx={{ pr: 2 }}>
                        <Stack sx={{ width: "100%" }} alignItems="flex-start" spacing={1.5}>
                            <Typography color="textLight" variant="h2">
                                Search Playlists
                            </Typography>
                            <TextField 
                                label="by Playlist Name" 
                                variant="outlined" 
                                fullWidth
                                sx={whiteTextFieldSx} 
                            />
                            <TextField 
                                label="by Username" 
                                variant="outlined" 
                                fullWidth
                                sx={whiteTextFieldSx} 
                            />
                            <TextField 
                                label="by Song Title" 
                                variant="outlined" 
                                fullWidth
                                sx={whiteTextFieldSx} 
                            />
                            <TextField 
                                label="by Song Artist" 
                                variant="outlined" 
                                fullWidth
                                sx={whiteTextFieldSx} 
                            />           
                            <TextField 
                                label="by Song Year" 
                                variant="outlined" 
                                fullWidth
                                sx={whiteTextFieldSx} 
                            />
                            <Toolbar>
                                <Button variant="contained">Confirm</Button>
                                <Button variant="contained">Cancel</Button> 
                            </Toolbar>
                        </Stack>
                    </Grid>
                    <Divider orientation='vertical' flexItem sx={{
                        borderColor: 'white',
                        mx: 2
                    }} />
                    <Grid item xs={6} md={6} sx={{
                        display: "flex",
                        flexDirection: "column",
                        pl: 2
                    }}>
                        <Box flexDirection="column" sx={{ display: "flex"}}>
                            <Toolbar sx={{ gap: 1 }} alignItems="flex-start">
                                <Typography color="textLight" variant="h2" sx={{ mr: 2 }}>
                                    My Playlists
                                </Typography>
                                <Typography color="textLight" sx={{ p: 2}}>Sort: </Typography>
                                <Select 
                                    displayEmpty 
                                    sx={whiteSelectSx} 
                                    value={sortBy} 
                                    onChange={handleSortByChange}
                                >
                                    <MenuItem value="listenerCount">Listener Count</MenuItem>
                                    <MenuItem value="playlistName">Playlist Name</MenuItem>
                                    <MenuItem value="userName">Username</MenuItem>
                                </Select>
                                <Select 
                                    displayEmpty 
                                    sx={whiteSelectSx} 
                                    value={sortOrder} 
                                    onChange={handleSortOrderChange}
                                >
                                    <MenuItem value="asc">Ascending</MenuItem>
                                    <MenuItem value="desc">Descending</MenuItem>
                                </Select>
                            </Toolbar>
                            <Typography color="textLight" variant="h5" sx={{ ml: 2, mb: 1 }}>
                                {playlistCount} {playlistCount === 1 ? 'Playlist' : 'Playlists'}
                            </Typography>
                            <List id="playlist-cards" sx={{overflow: 'scroll'}}>
                                {playlistStore?.playlists && playlistStore.playlists.length > 0 ? (
                                    playlistStore.playlists.map((playlist) => (
                                        <PlaylistCard key={playlist.playlistId} playlist={playlist} />
                                    ))
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography color="textLight" variant="body1">
                                            No playlists found
                                        </Typography>
                                    </Box>
                                )}
                            </List>
                        </Box>
                        <Button variant="contained" sx={{ mt: 2 }}>Add Playlist</Button>
                    </Grid>
                </Grid>
            </Box>
            <EditPlaylistModal />
            <DeletePlaylistModal />
        </>
    )
}

export default PlaylistsScreen;