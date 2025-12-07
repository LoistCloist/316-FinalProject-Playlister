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
import SongCard from '../SongCard'
import SongStoreContext from '../../stores/song_store'
import AuthContext from '../../auth'
import EditSongModal from '../Modals/EditSongModal'

function SongCatalogScreen() {
    const { songStore } = useContext(SongStoreContext);
    const { auth } = useContext(AuthContext);  
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    
    // Re-sort whenever sortBy or sortOrder changes
    useEffect(() => {
        if (songStore?.songs?.length > 0 && songStore?.sortSongs) {
            songStore.sortSongs(sortBy, sortOrder);
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
        // Load user songs when component mounts or when auth state changes
        if (songStore && songStore.loadUserSongs && auth.loggedIn && auth.user?.userId) {
            songStore.loadUserSongs();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.loggedIn, auth.user?.userId]);
    
    // Re-sort when songs array changes (e.g., after update or delete)
    useEffect(() => {
        if (songStore?.songs && songStore?.sortSongs) {
            if (songStore.songs.length > 0) {
                songStore.sortSongs(sortBy, sortOrder);
            }
            // Even if empty, the component should re-render to show "No songs found"
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [songStore?.songs?.length, songStore?.songs]);
    
    const songCount = songStore?.songs?.length || 0;
    
    const handleAddSong = () => {
        // TODO: Implement add song functionality
    }
    
    return (
        <>
            <Box sx={{ px: 4, py: 3 }}>
                <Grid container spacing={4} display="flex" flexDirection="row">
                    <Grid item xs={6} md={6} display="flex" flexDirection="row" sx={{ pr: 2 }}>
                        <Stack sx={{ width: "100%" }} alignItems="flex-start" spacing={1.5}>
                            <Typography color="textLight" variant="h2">
                                Search Songs
                            </Typography>
                            <TextField 
                                label="by Title" 
                                variant="outlined" 
                                fullWidth
                                sx={whiteTextFieldSx} 
                            />
                            <TextField 
                                label="by Artist" 
                                variant="outlined" 
                                fullWidth
                                sx={whiteTextFieldSx} 
                            />
                            <TextField 
                                label="by Year" 
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
                                    My Songs
                                </Typography>
                                <Typography color="textLight" sx={{ p: 2}}>Sort: </Typography>
                                <Select 
                                    displayEmpty 
                                    sx={whiteSelectSx} 
                                    value={sortBy} 
                                    onChange={handleSortByChange}
                                >
                                    <MenuItem value="title">Title</MenuItem>
                                    <MenuItem value="artist">Artist</MenuItem>
                                    <MenuItem value="year">Year</MenuItem>
                                    <MenuItem value="listens">Listens</MenuItem>
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
                                {songCount} {songCount === 1 ? 'Song' : 'Songs'}
                            </Typography>
                            <List id="song-cards" sx={{overflow: 'scroll'}}>
                                {songStore?.songs && songStore.songs.length > 0 ? (
                                    songStore.songs.map((song) => (
                                        <SongCard key={song.songId} song={song} />
                                    ))
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography color="textLight" variant="body1">
                                            No songs found
                                        </Typography>
                                    </Box>
                                )}
                            </List>
                        </Box>
                        <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddSong}>
                            Add Song
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <EditSongModal />
        </>
    )
}

export default SongCatalogScreen;
