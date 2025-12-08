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
import PlayPlaylistModal from '../Modals/PlayPlaylistModal'

function PlaylistsScreen() {
    const { playlistStore } = useContext(PlaylistStoreContext);
    const { auth } = useContext(AuthContext);  
    const [sortBy, setSortBy] = useState('listenerCount');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchPlaylistName, setSearchPlaylistName] = useState('');
    const [searchUserName, setSearchUserName] = useState('');
    const [searchSongTitle, setSearchSongTitle] = useState('');
    const [searchSongArtist, setSearchSongArtist] = useState('');
    const [searchSongYear, setSearchSongYear] = useState('');
    
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
        // Load playlists when component mounts or when auth state changes
        // For logged in users: load their playlists
        // For guests: leave empty until they search
        // Note: playlistStore intentionally excluded from dependencies to prevent reload on sort
        if (playlistStore && playlistStore.loadUserPlaylists) {
            playlistStore.loadUserPlaylists();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.loggedIn, auth.user?.userId]);
    
    // Re-sort when playlists array length changes or when refresh trigger changes (e.g., after update or delete)
    // The refresh trigger ensures we re-render even when only playlist content changes, not length
    useEffect(() => {
        if (playlistStore?.playlists && playlistStore?.sortPlaylists) {
            if (playlistStore.playlists.length > 0) {
                playlistStore.sortPlaylists(sortBy, sortOrder);
            }
            // Even if empty, the component should re-render to show "No playlists found"
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playlistStore?.playlists?.length, playlistStore?.playlistsRefreshTrigger]);
    
    const playlistCount = playlistStore?.playlists?.length || 0;
    
    const handleSearch = async (event) => {
        event.preventDefault();
        
        // Get values from state (they're already controlled inputs)
        const playlistName = searchPlaylistName.trim();
        const userName = searchUserName.trim();
        const title = searchSongTitle.trim();
        const artist = searchSongArtist.trim();
        const year = searchSongYear.trim();
        
        // Perform search through store
        if (playlistStore && playlistStore.searchPlaylists) {
            await playlistStore.searchPlaylists(
                playlistName || undefined,
                userName || undefined,
                title || undefined,
                artist || undefined,
                year || undefined
            );
        }
    }
    
    const handleClearSearch = () => {
        setSearchPlaylistName('');
        setSearchUserName('');
        setSearchSongTitle('');
        setSearchSongArtist('');
        setSearchSongYear('');
        // Reload user playlists through store
        if (playlistStore && playlistStore.loadUserPlaylists && auth.loggedIn && auth.user?.userId) {
            playlistStore.loadUserPlaylists();
        }
    }
    const handleAddPlaylist = () => {
        if (playlistStore && playlistStore.createNewList) {
            playlistStore.createNewList();
        }
    }
    return (
        <>
            <Box sx={{ px: 4, py: 3 }}>
                <Grid container spacing={4} display="flex" flexDirection="row">
                    <Grid item xs={6} md={6} display="flex" flexDirection="row" sx={{ pr: 2 }}>
                        <Stack sx={{ width: "100%" }} alignItems="flex-start" spacing={1.5}>
                            <Typography color="textLight" variant="h2">
                                Search Playlists
                            </Typography>
                            <Stack component="form" noValidate onSubmit={handleSearch} sx={{ width: "100%" }} alignItems="flex-start" spacing={1.5}>
                                <TextField 
                                    label="by Playlist Name" 
                                    variant="outlined" 
                                    fullWidth
                                    sx={whiteTextFieldSx}
                                    name="playlistName"
                                    value={searchPlaylistName}
                                    onChange={(e) => setSearchPlaylistName(e.target.value)}
                                />
                                <TextField 
                                    label="by Username" 
                                    variant="outlined" 
                                    fullWidth
                                    sx={whiteTextFieldSx}
                                    name="userName"
                                    value={searchUserName}
                                    onChange={(e) => setSearchUserName(e.target.value)}
                                />
                                <TextField 
                                    label="by Song Title" 
                                    variant="outlined" 
                                    fullWidth
                                    sx={whiteTextFieldSx}
                                    name="songTitle"
                                    value={searchSongTitle}
                                    onChange={(e) => setSearchSongTitle(e.target.value)}
                                />
                                <TextField 
                                    label="by Song Artist" 
                                    variant="outlined" 
                                    fullWidth
                                    sx={whiteTextFieldSx}
                                    name="songArtist"
                                    value={searchSongArtist}
                                    onChange={(e) => setSearchSongArtist(e.target.value)}
                                />           
                                <TextField 
                                    label="by Song Year" 
                                    variant="outlined" 
                                    fullWidth
                                    sx={whiteTextFieldSx}
                                    name="songYear"
                                    value={searchSongYear}
                                    onChange={(e) => setSearchSongYear(e.target.value)}
                                />
                                <Toolbar>
                                    <Button variant="contained" type="submit">Confirm</Button>
                                    <Button variant="contained" type="button" onClick={handleClearSearch}>Clear</Button> 
                                </Toolbar>
                            </Stack>
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
                            <Box 
                                id="playlist-cards-container"
                                sx={{
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    maxHeight: 'calc(100vh - 300px)',
                                    backgroundColor: 'transparent',
                                    borderRadius: 1,
                                    pr: 1,
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        backgroundColor: 'transparent',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                        borderRadius: '4px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                        },
                                    },
                                }}
                            >
                                <List id="playlist-cards" sx={{ p: 0 }}>
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
                        </Box>
                        {auth.loggedIn && (
                            <Button variant="contained" sx={{ mt: 2 }} onClick={handleAddPlaylist}>Add Playlist</Button>
                        )}
                    </Grid>
                </Grid>
            </Box>
            <EditPlaylistModal />
            <DeletePlaylistModal />
            <PlayPlaylistModal />
        </>
    )
}

export default PlaylistsScreen;