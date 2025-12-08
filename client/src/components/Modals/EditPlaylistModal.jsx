import { useContext, useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Toolbar,
    Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import PlaylistStoreContext from '../../stores/playlist_store';
import AuthContext from '../../auth';
import playlistRequestSender from '../../stores/requests/playlistRequestSender';
import songRequestSender from '../../stores/requests/songRequestSender';

const CurrentModal = {
    NONE: "NONE",
    EDIT_PLAYLIST_MODAL: "EDIT_PLAYLIST_MODAL",
};

export default function EditPlaylistModal() {
    const { playlistStore } = useContext(PlaylistStoreContext);
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [playlistName, setPlaylistName] = useState('');
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const lastPlaylistIdRef = useRef(null);
    const isLoadingRef = useRef(false);
    const duplicateCountRef = useRef(new Map()); // Track duplicate count per song title
    
    const isOpen = playlistStore?.currentModal === CurrentModal.EDIT_PLAYLIST_MODAL;
    const currentPlaylist = playlistStore?.currentList;

    // Load playlist data when modal opens
    useEffect(() => {
        if (isOpen && currentPlaylist) {
            const playlistId = currentPlaylist.playlistId;
            // Only load if this is a different playlist or modal just opened, and not already loading
            if (playlistId !== lastPlaylistIdRef.current && !isLoadingRef.current) {
                lastPlaylistIdRef.current = playlistId;
                isLoadingRef.current = true;
                setPlaylistName(currentPlaylist.playlistName || '');
                loadPlaylistSongs().finally(() => {
                    isLoadingRef.current = false;
                });
            }
        } else if (!isOpen) {
            // Reset refs when modal closes
            lastPlaylistIdRef.current = null;
            isLoadingRef.current = false;
            duplicateCountRef.current.clear(); // Reset duplicate counts when modal closes
        }
        // Only depend on isOpen to prevent double-triggering when currentPlaylist reference changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

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
                
                // Check if songs are already objects or just IDs
                if (playlistSongs.length > 0) {
                    const firstSong = playlistSongs[0];
                    if (firstSong && typeof firstSong === 'object' && firstSong.songId && firstSong.title) {
                        // Songs are already full objects
                        setSongs(playlistSongs);
                    } else {
                        // Songs are IDs, need to fetch full details
                        const songPromises = playlistSongs.map(async (songId) => {
                            try {
                                const songResponse = await songRequestSender.getSongById(songId);
                                if (songResponse.status === 200 && songResponse.data.success) {
                                    return songResponse.data.song;
                                }
                            } catch (error) {
                                console.error(`Error loading song ${songId}:`, error);
                            }
                            return null;
                        });
                        
                        const loadedSongs = await Promise.all(songPromises);
                        setSongs(loadedSongs.filter(song => song !== null));
                    }
                } else {
                    setSongs([]);
                }
            } else {
                setSongs([]);
            }
        } catch (error) {
            console.error('Error loading playlist songs:', error);
            setSongs([]);
        }
    };

    const handleCancel = () => {
        if (playlistStore?.hideModals) {
            playlistStore.hideModals();
        }
        setPlaylistName('');
        setSongs([]);
    };

    const handleConfirm = async () => {
        if (!currentPlaylist) return;
        
        setLoading(true);
        try {
            const songIds = songs.map(song => song.songId);
            const response = await playlistRequestSender.updatePlaylist(
                currentPlaylist.playlistId,
                playlistName,
                currentPlaylist.userName,
                currentPlaylist.email || auth.user?.email,
                songIds
            );

            if (response.status === 200 && response.data.success) {
                // Optimistically update the playlist in the local array (immediate UI feedback)
                const updatedPlaylist = {
                    ...currentPlaylist,
                    playlistName: playlistName,
                    songs: songs // Update with the current songs array
                };
                if (playlistStore?.updatePlaylistInList) {
                    playlistStore.updatePlaylistInList(updatedPlaylist);
                }
                
                // Close modal first
                handleCancel();
                
                // Reload playlists to sync with server (after modal is closed)
                if (playlistStore?.loadUserPlaylists) {
                    await playlistStore.loadUserPlaylists(true);
                }
            } else {
                console.error('Failed to update playlist:', response.data);
                alert('Failed to update playlist');
            }
        } catch (error) {
            console.error('Error updating playlist:', error);
            alert('Error updating playlist');
        } finally {
            setLoading(false);
        }
    };

    const handleClearName = () => {
        setPlaylistName('');
    };

    const handleAddSong = () => {
        navigate('/songs');
    };

    const handleDuplicateSong = async (song) => {
        if (!auth.loggedIn || !auth.user) {
            alert('You must be logged in to duplicate songs');
            return;
        }

        setLoading(true);
        try {
            // Get or increment duplicate count for this song title
            const baseTitle = song.title || 'Untitled';
            const currentCount = duplicateCountRef.current.get(baseTitle) || 0;
            const newCount = currentCount + 1;
            duplicateCountRef.current.set(baseTitle, newCount);
            
            // Create new title with duplicate number appended
            const newTitle = `${baseTitle} ${newCount}`;
            
            // Deep clone the song and create a new song entry in the database
            const response = await songRequestSender.createSong(
                newTitle,
                song.artist || '',
                song.year || '',
                song.youtubeId || '',
                auth.user.email
            );
            
            if (response.status === 200 && response.data.success && response.data.song) {
                // Get the newly created song from the response
                const newSong = response.data.song;
                // Add the new song to the playlist
                setSongs([...songs, newSong]);
            } else {
                alert('Failed to create duplicate song');
            }
        } catch (error) {
            console.error('Error duplicating song:', error);
            alert('Error duplicating song');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSong = (songId) => {
        setSongs(songs.filter(song => song.songId !== songId));
    };

    const handleUndo = () => {
        if (playlistStore.undo) {
            playlistStore.undo();
            // Reload songs after undo
            setTimeout(() => {
                loadPlaylistSongs();
            }, 100);
        }
    };

    const handleRedo = () => {
        if (playlistStore.redo) {
            playlistStore.redo();
            // Reload songs after redo
            setTimeout(() => {
                loadPlaylistSongs();
            }, 100);
        }
    };

    if (!isOpen || !currentPlaylist) {
        return null;
    }

    return (
        <>
            <Dialog 
                open={isOpen} 
                onClose={handleCancel}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: '#1a1a1a', // Dark background
                        color: 'white',
                        minHeight: '500px'
                    }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        backgroundColor: '#285238', // Primary green
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    Edit Playlist
                    <IconButton 
                        onClick={handleCancel}
                        sx={{ color: 'white' }}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent sx={{ backgroundColor: '#1a1a1a', color: 'white', mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Playlist Name Field */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                label="Playlist Name"
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                                variant="outlined"
                                fullWidth
                                sx={{
                                    flexGrow: 1,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#285238',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                    },
                                }}
                            />
                            <IconButton 
                                onClick={handleClearName}
                                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            >
                                <CloseIcon />
                            </IconButton>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddSong}
                                sx={{ 
                                    minWidth: '120px',
                                    backgroundColor: '#285238',
                                    '&:hover': {
                                        backgroundColor: '#4fb286',
                                    },
                                }}
                            >
                                <MusicNoteIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                                Add Song
                            </Button>
                        </Box>

                        {/* Songs List */}
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>
                                Songs ({songs.length})
                            </Typography>
                            {songs.length === 0 ? (
                                <Typography sx={{ py: 2, textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
                                    No songs in this playlist
                                </Typography>
                            ) : (
                                <List>
                                    {songs.map((song, index) => (
                                        <Paper 
                                            key={song.songId || index}
                                            elevation={1}
                                            sx={{ 
                                                mb: 1, 
                                                p: 1,
                                                backgroundColor: '#2a2a2a', // Dark gray
                                                border: '1px solid #285238', // Primary green border
                                                color: 'white'
                                            }}
                                        >
                                            <ListItem
                                                sx={{ py: 0.5 }}
                                                secondaryAction={
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <IconButton
                                                            edge="end"
                                                            onClick={() => handleDuplicateSong(song)}
                                                            size="small"
                                                            title="Duplicate"
                                                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                                        >
                                                            <ContentCopyIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            edge="end"
                                                            onClick={() => handleRemoveSong(song.songId)}
                                                            size="small"
                                                            title="Remove"
                                                            sx={{ color: '#f44336' }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                }
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body1" sx={{ color: 'white' }}>
                                                            {song.title || 'Unknown Title'} by {song.artist || 'Unknown Artist'} 
                                                            {song.year ? ` (${song.year})` : ''}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                        </Paper>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ backgroundColor: '#1a1a1a', color: 'white', p: 2, justifyContent: 'space-between' }}>
                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<UndoIcon />}
                            onClick={handleUndo}
                            sx={{
                                backgroundColor: '#285238',
                                '&:hover': {
                                    backgroundColor: '#4fb286',
                                },
                            }}
                        >
                            Undo
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<RedoIcon />}
                            onClick={handleRedo}
                            sx={{ 
                                ml: 1,
                                backgroundColor: '#285238',
                                '&:hover': {
                                    backgroundColor: '#4fb286',
                                },
                            }}
                        >
                            Redo
                        </Button>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={handleConfirm}
                        disabled={loading || !playlistName.trim()}
                        sx={{
                            backgroundColor: '#285238',
                            '&:hover': {
                                backgroundColor: '#4fb286',
                            },
                        }}
                    >
                        {loading ? 'Saving...' : 'Confirm'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleCancel}
                        disabled={loading}
                        sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
