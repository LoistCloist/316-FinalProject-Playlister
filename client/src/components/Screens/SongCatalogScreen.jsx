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
    Toolbar,
    CardMedia
} from '@mui/material'
import { whiteSelectSx, whiteTextFieldSx } from '../styles';
import SongCard from '../SongCard'
import SongStoreContext from '../../stores/song_store'
import AuthContext from '../../auth'
import EditSongModal from '../Modals/EditSongModal'
import songRequestSender from '../../stores/requests/songRequestSender'

function SongCatalogScreen() {
    const { songStore } = useContext(SongStoreContext);
    const { auth } = useContext(AuthContext);  
    const [sortBy, setSortBy] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPlayingSong, setCurrentPlayingSong] = useState(null);
    const [searchTitle, setSearchTitle] = useState('');
    const [searchArtist, setSearchArtist] = useState('');
    const [searchYear, setSearchYear] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
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
    
    // Re-sort when songs array length changes (e.g., after update or delete)
    // Only watch length to avoid infinite loops from array reference changes
    useEffect(() => {
        if (!isSearching && songStore?.songs && songStore?.sortSongs) {
            if (songStore.songs.length > 0) {
                songStore.sortSongs(sortBy, sortOrder);
            }
            // Even if empty, the component should re-render to show "No songs found"
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [songStore?.songs?.length, isSearching]);
    
    // Sort search results when sort changes
    useEffect(() => {
        if (isSearching && searchResults && searchResults.length > 0) {
            const sorted = [...searchResults].sort((a, b) => {
                let aValue = a[sortBy];
                let bValue = b[sortBy];
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }
                let comparison = 0;
                if (aValue > bValue) {
                    comparison = 1;
                } else if (aValue < bValue) {
                    comparison = -1;
                }
                return sortOrder === 'asc' ? comparison : -comparison;
            });
            setSearchResults(sorted);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, sortOrder, isSearching]);
    
    // Determine which songs to display
    const displaySongs = isSearching ? (searchResults || []) : (songStore?.songs || []);
    const songCount = displaySongs.length;
    
    const handleAddSong = () => {
        // TODO: Implement add song functionality
    }
    
    const handlePlaySong = (song) => {
        setCurrentPlayingSong(song);
    }
    
    const getYouTubeUrl = (song) => {
        if (!song) return 'https://www.youtube.com/embed/OTg5Bs7AXNU';
        const youtubeId = song.youtubeId || 'OTg5Bs7AXNU';
        return `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
    }

    const handleSearch = async (event) => {
        event.preventDefault();
        
        // Get values from state (they're already controlled inputs)
        const title = searchTitle.trim();
        const artist = searchArtist.trim();
        const year = searchYear.trim();
        
        // If all fields are empty, show user's songs
        if (!title && !artist && !year) {
            setIsSearching(false);
            setSearchResults(null);
            // Reload user songs
            if (songStore && songStore.loadUserSongs && auth.loggedIn && auth.user?.userId) {
                songStore.loadUserSongs();
            }
            return;
        }
        
        // Perform search
        setIsSearching(true);
        try {
            const response = await songRequestSender.getTargetSongs(
                title || undefined, 
                artist || undefined, 
                year || undefined
            );
            if (response.status === 200 && response.data.success) {
                setSearchResults(response.data.songs || []);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            if (error.response?.status === 404) {
                setSearchResults([]);
            } else {
                alert('Error searching songs');
                setSearchResults(null);
                setIsSearching(false);
            }
        }
    }
    
    const handleClearSearch = () => {
        setCurrentPlayingSong(null);
        setSearchTitle('');
        setSearchArtist('');
        setSearchYear('');
        setIsSearching(false);
        setSearchResults(null);
        // Reload user songs
        if (songStore && songStore.loadUserSongs && auth.loggedIn && auth.user?.userId) {
            songStore.loadUserSongs();
        }
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
                            <Stack component="form" noValidate onSubmit={handleSearch} sx={{ width: "100%" }} alignItems="flex-start" spacing={1.5}>
                                <TextField 
                                    label="by Title" 
                                    variant="outlined" 
                                    fullWidth
                                    sx={whiteTextFieldSx} 
                                    name="title"
                                    value={searchTitle}
                                    onChange={(e) => setSearchTitle(e.target.value)}
                                />
                                <TextField 
                                    label="by Artist" 
                                    variant="outlined" 
                                    fullWidth
                                    sx={whiteTextFieldSx} 
                                    name="artist"
                                    value={searchArtist}
                                    onChange={(e) => setSearchArtist(e.target.value)}
                                />
                                <TextField 
                                    label="by Year" 
                                    variant="outlined" 
                                    fullWidth
                                    sx={whiteTextFieldSx} 
                                    name="year"
                                    value={searchYear}
                                    onChange={(e) => setSearchYear(e.target.value)}
                                />
                                <Toolbar>
                                    <Button variant="contained" type="submit">Confirm</Button>
                                    <Button variant="contained" type="button" onClick={handleClearSearch}>Clear</Button> 
                                </Toolbar>
                            </Stack>
                            {currentPlayingSong && (
                                <Box sx={{ width: '100%', mt: 2 }}>
                                    <Typography color="textLight" variant="h6" sx={{ mb: 1 }}>
                                        Now Playing
                                    </Typography>
                                    <CardMedia 
                                        component="iframe" 
                                        sx={{ 
                                            width: '100%', 
                                            height: '300px', 
                                            border: 'none',
                                            borderRadius: 1
                                        }}
                                        src={getYouTubeUrl(currentPlayingSong)}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                    <Typography color="textLight" variant="body2" sx={{ mt: 1 }}>
                                        {currentPlayingSong.title} by {currentPlayingSong.artist}
                                    </Typography>
                                </Box>
                            )}
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
                            <Box 
                                id="song-cards-container"
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
                                <List id="song-cards" sx={{ p: 0 }}>
                                    {displaySongs && displaySongs.length > 0 ? (
                                        displaySongs.map((song) => (
                                            <SongCard 
                                                key={song.songId} 
                                                song={song} 
                                                onPlay={handlePlaySong}
                                            />
                                        ))
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography color="textLight" variant="body1">
                                                {isSearching ? 'No songs found matching your search' : 'No songs found'}
                                            </Typography>
                                        </Box>
                                    )}
                                </List>
                            </Box>
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
