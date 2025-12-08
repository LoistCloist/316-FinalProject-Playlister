import { 
  Typography, 
  Box,
  Paper,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SongStoreContext from '../stores/song_store';
import PlaylistStoreContext from '../stores/playlist_store';
import AuthContext from '../auth';
import { useContext, useState, useEffect, useRef } from 'react';
import playlistRequestSender from '../stores/requests/playlistRequestSender';
import songRequestSender from '../stores/requests/songRequestSender';

export default function SongCard({ song, onPlay }) {
    const { songStore } = useContext(SongStoreContext);
    const { playlistStore } = useContext(PlaylistStoreContext);
    const { auth } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [playlistMenuAnchor, setPlaylistMenuAnchor] = useState(null);
    const open = Boolean(anchorEl);
    const playlistMenuOpen = Boolean(playlistMenuAnchor);
    // Allows mouse to move to nested menu without closing the menu
    const closeTimeoutRef = useRef(null);
    
    // Check if song belongs to the current user
    const isOwner = auth.loggedIn && auth.user && song.addedById === auth.user.userId;
    
    // Get user's playlists (filtered by userId)
    const userPlaylists = playlistStore?.playlists?.filter(
        playlist => auth.loggedIn && auth.user && playlist.userId === auth.user.userId
    ) || [];
    
    // Load user playlists when component mounts or auth changes
    useEffect(() => {
        if (auth.loggedIn && auth.user?.userId && playlistStore?.loadUserPlaylists) {
            playlistStore.loadUserPlaylists();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.loggedIn, auth.user?.userId]);
    
    const handleClick = (event) => {
        event.stopPropagation();
        if (onPlay) {
            onPlay(song);
        }
    }
    
    const handleMenuClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    }
    
    const handleMenuClose = () => {
        // Clear any pending close timeout
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setAnchorEl(null);
        setPlaylistMenuAnchor(null);
    }
    
    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);
    
    const handlePlaylistMenuOpen = (event) => {
        event.stopPropagation();
        // Clear any pending close timeout
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setPlaylistMenuAnchor(event.currentTarget);
    }
    
    const handlePlaylistMenuClose = () => {
        // Clear any pending close timeout
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }
        setPlaylistMenuAnchor(null);
    }
    
    const handlePlaylistMenuItemLeave = () => {
        // Add a small delay before closing to allow mouse to move to nested menu
        closeTimeoutRef.current = setTimeout(() => {
            handlePlaylistMenuClose();
        }, 150);
    }
    
    const handleNestedMenuEnter = () => {
        // Clear close timeout when entering nested menu
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    }
    
    const handleAddToPlaylist = async (playlist, event) => {
        if (event) {
            event.stopPropagation();
        }
        handlePlaylistMenuClose();
        handleMenuClose();
        
        try {
            // Use the new addSongToPlaylist endpoint (no ownership check required)
            const response = await playlistRequestSender.addSongToPlaylist(
                playlist.playlistId,
                song.songId
            );
            
            if (response.status === 200 && response.data.success) {
                // Fetch the updated song to get the latest inPlaylists count
                try {
                    const songResponse = await songRequestSender.getSongById(song.songId);
                    if (songResponse.status === 200 && songResponse.data.success) {
                        const updatedSong = songResponse.data.song;
                        // Update the song in the list with the new inPlaylists count
                        if (songStore?.updateSongInList) {
                            songStore.updateSongInList(updatedSong);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching updated song:", error);
                }
                
                // Reload playlists to reflect the change
                if (playlistStore?.loadUserPlaylists) {
                    await playlistStore.loadUserPlaylists();
                }
            } else {
                const errorMessage = response.data?.errorMessage || response.data?.message || 'Failed to add song to playlist';
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error adding song to playlist:', error);
            const errorMessage = error.response?.data?.errorMessage || error.response?.data?.message || 'Error adding song to playlist';
            alert(errorMessage);
        }
    }
    
    const handleEdit = (event) => {
        event.stopPropagation();
        handleMenuClose();
        if (songStore && songStore.openEditSongModal) {
            songStore.openEditSongModal(song);
        }
    }
    
    const handleDelete = (event) => {
        event.stopPropagation();
        handleMenuClose();
        if (songStore && songStore.markSongForDeletion) {
            songStore.markSongForDeletion(song);
        }
    }

    const playlistCount = song.inPlaylists ? song.inPlaylists.length : 0;
    const listensCount = song.listens || 0;

    return (
        <Paper
            elevation={1}
            sx={{
                p: 2,
                mb: 1,
                backgroundColor: '#2a2a2a', // Dark gray to match app theme
                border: '1px solid #285238', // Primary green border
                cursor: 'pointer',
                color: 'white',
                '&:hover': {
                    backgroundColor: '#333333',
                    borderColor: '#3c896d', // Lighter green on hover
                }
            }}
            onClick={handleClick}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                        {song.title || 'Unknown Title'} by {song.artist || 'Unknown Artist'} {song.year ? `(${song.year})` : ''}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                            Listens: {listensCount.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
                            Playlists: {playlistCount}
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    size="small"
                    onClick={handleMenuClick}
                    sx={{ ml: 1, color: 'white' }}
                >
                    <MoreVertIcon />
                </IconButton>
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={(event) => {
                    event?.stopPropagation();
                    handleMenuClose();
                }}
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                {isOwner && <MenuItem onClick={handleEdit}>Edit</MenuItem>}
                {isOwner && <MenuItem onClick={handleDelete}>Delete</MenuItem>}
                {auth.loggedIn && userPlaylists.length > 0 && (
                    <MenuItem 
                        onMouseEnter={handlePlaylistMenuOpen}
                        onMouseLeave={handlePlaylistMenuItemLeave}
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        Add to Playlist
                    </MenuItem>
                )}
            </Menu>
            {auth.loggedIn && userPlaylists.length > 0 && (
                <Menu
                    anchorEl={playlistMenuAnchor}
                    open={playlistMenuOpen}
                    onClose={(event) => {
                        event?.stopPropagation();
                        handlePlaylistMenuClose();
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                    MenuListProps={{
                        onMouseEnter: handleNestedMenuEnter,
                        onMouseLeave: handlePlaylistMenuClose
                    }}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    {userPlaylists.map((playlist) => (
                        <MenuItem 
                            key={playlist.playlistId}
                            onClick={(event) => handleAddToPlaylist(playlist, event)}
                        >
                            {playlist.playlistName}
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </Paper>
    );
}

