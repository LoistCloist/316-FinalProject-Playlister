import { useContext, useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    Button,
    Avatar,
    List,
    ListItem,
    ListItemText,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PlaylistStoreContext from '../../stores/playlist_store';
import songRequestSender from '../../stores/requests/songRequestSender';
import playlistRequestSender from '../../stores/requests/playlistRequestSender';

const CurrentModal = {
    NONE: "NONE",
    PLAY_PLAYLIST_MODAL: "PLAY_PLAYLIST_MODAL",
};

export default function PlayPlaylistModal() {
    const { playlistStore } = useContext(PlaylistStoreContext);
    const [songs, setSongs] = useState([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef(null);
    const youtubePlayerRef = useRef(null);
    const songsRef = useRef([]);
    const currentSongIndexRef = useRef(0);
    
    const isOpen = playlistStore.currentModal === CurrentModal.PLAY_PLAYLIST_MODAL;
    const currentPlaylist = playlistStore.currentList;

    // Load YouTube IFrame API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                // API is ready
            };
        }
    }, []);

    // Keep refs in sync with state
    useEffect(() => {
        songsRef.current = songs;
    }, [songs]);

    useEffect(() => {
        currentSongIndexRef.current = currentSongIndex;
    }, [currentSongIndex]);

    // Load playlist songs when modal opens and record listener
    useEffect(() => {
        if (isOpen && currentPlaylist) {
            loadPlaylistSongs();
            // Record that this user/guest is listening to the playlist (but don't update UI yet)
            if (currentPlaylist.playlistId) {
                playlistRequestSender.addListener(currentPlaylist.playlistId)
                    .catch(error => {
                        console.error("Error adding listener:", error);
                    });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentPlaylist]);

    // Initialize YouTube player when modal opens and songs are loaded
    useEffect(() => {
        if (isOpen && window.YT && playerRef.current && songs.length > 0 && !youtubePlayerRef.current) {
            const currentSong = songs[currentSongIndex] || null;
            if (currentSong && currentSong.youtubeId) {
                youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
                    height: '400',
                    width: '100%',
                    playerVars: {
                        autoplay: isPlaying ? 1 : 0,
                        controls: 1,
                        rel: 0,
                        modestbranding: 1,
                        playsinline: 1
                    },
                    events: {
                        onReady: (event) => {
                            event.target.loadVideoById(currentSong.youtubeId);
                            if (isPlaying) {
                                event.target.playVideo();
                            }
                        },
                        onStateChange: (event) => {
                            // YT.PlayerState.ENDED = 0
                            if (event.data === window.YT.PlayerState.ENDED) {
                                // Automatically go to next song when video ends
                                const currentIndex = currentSongIndexRef.current;
                                const currentSongs = songsRef.current;
                                if (currentIndex < currentSongs.length - 1) {
                                    setCurrentSongIndex(currentIndex + 1);
                                    setIsPlaying(true);
                                } else {
                                    setIsPlaying(false);
                                }
                            } else if (event.data === window.YT.PlayerState.PLAYING) {
                                setIsPlaying(true);
                            } else if (event.data === window.YT.PlayerState.PAUSED) {
                                setIsPlaying(false);
                            }
                        },
                        onError: (event) => {
                            console.error('YouTube player error:', event.data);
                            // Skip to next song on error
                            const currentIndex = currentSongIndexRef.current;
                            const currentSongs = songsRef.current;
                            if (currentIndex < currentSongs.length - 1) {
                                setCurrentSongIndex(currentIndex + 1);
                                setIsPlaying(true);
                            }
                        }
                    }
                });
            }
        }

        return () => {
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.destroy();
                youtubePlayerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, songs.length]);

    // Load new video when song changes (without recreating player)
    useEffect(() => {
        if (youtubePlayerRef.current && songs.length > 0) {
            const currentSong = songs[currentSongIndex] || null;
            if (currentSong && currentSong.youtubeId) {
                youtubePlayerRef.current.loadVideoById(currentSong.youtubeId);
                if (isPlaying) {
                    setTimeout(() => {
                        if (youtubePlayerRef.current) {
                            youtubePlayerRef.current.playVideo();
                        }
                    }, 100);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSongIndex]);

    // Increment listens whenever a song is selected/clicked
    useEffect(() => {
        if (isOpen && songs.length > 0 && currentSongIndex >= 0) {
            const currentSong = songs[currentSongIndex];
            if (currentSong && currentSong.songId) {
                songRequestSender.incrementListen(currentSong.songId)
                    .catch(error => {
                        console.error("Error incrementing listen count:", error);
                    });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSongIndex, isOpen]);

    // Load full song details for the playlist
    const loadPlaylistSongs = async () => {
        if (!currentPlaylist || !currentPlaylist.playlistId) {
            setSongs([]);
            return;
        }

        try {
            const response = await songRequestSender.getAllSongsInPlaylist(currentPlaylist.playlistId);
            if (response.status === 200 && response.data.success) {
                const playlistSongs = response.data.songs || [];
                setSongs(playlistSongs);
                if (playlistSongs.length > 0) {
                    setCurrentSongIndex(0);
                }
            } else {
                setSongs([]);
            }
        } catch (error) {
            console.error('Error loading playlist songs:', error);
            setSongs([]);
        }
    };

    const handleClose = async () => {
        // Close the modal first
        if (youtubePlayerRef.current) {
            youtubePlayerRef.current.destroy();
            youtubePlayerRef.current = null;
        }
        const playlistIdToUpdate = currentPlaylist?.playlistId;
        
        playlistStore.hideModals();
        setIsPlaying(false);
        setCurrentSongIndex(0);
        
        // After closing, update the playlist with the latest listener count
        if (playlistIdToUpdate) {
            try {
                const playlistResponse = await playlistRequestSender.getPlaylistById(playlistIdToUpdate);
                if (playlistResponse.status === 200 && playlistResponse.data.success) {
                    const updatedPlaylist = playlistResponse.data.playlist;
                    // Update the playlist in the list with the new listeners count
                    if (playlistStore?.updatePlaylistInList) {
                        playlistStore.updatePlaylistInList(updatedPlaylist);
                    }
                }
            } catch (error) {
                console.error("Error fetching updated playlist:", error);
            }
        }
    };

    const handlePrevious = () => {
        if (currentSongIndex > 0) {
            setCurrentSongIndex(currentSongIndex - 1);
            setIsPlaying(true);
        }
    };

    const handleNext = () => {
        if (currentSongIndex < songs.length - 1) {
            setCurrentSongIndex(currentSongIndex + 1);
            setIsPlaying(true);
        }
    };

    const handlePlayPause = () => {
        if (youtubePlayerRef.current) {
            if (isPlaying) {
                youtubePlayerRef.current.pauseVideo();
            } else {
                youtubePlayerRef.current.playVideo();
            }
        }
        setIsPlaying(!isPlaying);
    };

    const handleSongClick = (index) => {
        setCurrentSongIndex(index);
        setIsPlaying(true);
    };

    const currentSong = songs[currentSongIndex] || null;

    if (!isOpen || !currentPlaylist) {
        return null;
    }

    return (
        <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    minHeight: '600px'
                }
            }}
        >
            <DialogTitle
                sx={{
                    backgroundColor: '#285238',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5
                }}
            >
                <Typography variant="h6">Play Playlist</Typography>
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={handleClose}
                    aria-label="close"
                    sx={{ color: 'white' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, backgroundColor: '#1a1a1a' }}>
                <Box sx={{ display: 'flex', height: '600px' }}>
                    {/* Left Panel - Playlist Info and Songs */}
                    <Box
                        sx={{
                            width: '40%',
                            backgroundColor: '#2a2a2a',
                            borderRight: '1px solid #285238',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Playlist Header */}
                        <Box sx={{ p: 2, borderBottom: '1px solid #285238' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                    src={currentPlaylist.userAvatar}
                                    sx={{ width: 56, height: 56, mr: 2 }}
                                />
                                <Box>
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                        {currentPlaylist.playlistName}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                                        {currentPlaylist.userName}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Song List */}
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                            <List sx={{ p: 0 }}>
                                {songs.length > 0 ? (
                                    songs.map((song, index) => (
                                        <ListItem
                                            key={song.songId || index}
                                            onClick={() => handleSongClick(index)}
                                            sx={{
                                                py: 1,
                                                px: 2,
                                                mb: 0.5,
                                                cursor: 'pointer',
                                                backgroundColor: index === currentSongIndex ? '#285238' : 'transparent',
                                                borderRadius: 1,
                                                '&:hover': {
                                                    backgroundColor: index === currentSongIndex ? '#3c896d' : 'rgba(255, 255, 255, 0.05)',
                                                }
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        sx={{
                                                            color: index === currentSongIndex ? 'white' : 'white',
                                                            fontWeight: index === currentSongIndex ? 'bold' : 'normal',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {index + 1}. {song.title || 'Unknown Title'} by {song.artist || 'Unknown Artist'} {song.year ? `(${song.year})` : ''}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Typography sx={{ color: '#b3b3b3', fontStyle: 'italic' }}>
                                                    No songs in this playlist
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Box>
                    </Box>

                    {/* Right Panel - Video Player */}
                    <Box
                        sx={{
                            width: '60%',
                            backgroundColor: '#1a1a1a',
                            display: 'flex',
                            flexDirection: 'column',
                            p: 2
                        }}
                    >
                        {currentSong ? (
                            <>
                                {/* Video Title and Info */}
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                                            {currentSong.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                                            {currentSong.artist} {currentSong.year ? `(${currentSong.year})` : ''}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* YouTube Video Player */}
                                <Box sx={{ mb: 2, flexGrow: 1, minHeight: '400px' }}>
                                    <div
                                        ref={playerRef}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            minHeight: '400px'
                                        }}
                                    />
                                </Box>

                                {/* Navigation Controls */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: 2,
                                        py: 2,
                                        backgroundColor: '#2a2a2a',
                                        borderRadius: 1,
                                        border: '1px solid #285238'
                                    }}
                                >
                                    <IconButton
                                        onClick={handlePrevious}
                                        disabled={currentSongIndex === 0}
                                        sx={{
                                            color: 'white',
                                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                                            '&.Mui-disabled': { color: '#666' }
                                        }}
                                    >
                                        <SkipPreviousIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={handlePlayPause}
                                        sx={{
                                            color: '#285238',
                                            backgroundColor: 'rgba(40, 82, 56, 0.2)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(40, 82, 56, 0.3)',
                                                color: '#3c896d'
                                            },
                                            width: 56,
                                            height: 56
                                        }}
                                    >
                                        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                                    </IconButton>
                                    <IconButton
                                        onClick={handleNext}
                                        disabled={currentSongIndex === songs.length - 1}
                                        sx={{
                                            color: 'white',
                                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                                            '&.Mui-disabled': { color: '#666' }
                                        }}
                                    >
                                        <SkipNextIcon />
                                    </IconButton>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography sx={{ color: '#b3b3b3' }}>No song selected</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Close Button */}
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #285238' }}>
                    <Button
                        variant="contained"
                        onClick={handleClose}
                        sx={{
                            backgroundColor: '#285238',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#3c896d',
                            }
                        }}
                    >
                        Close
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

