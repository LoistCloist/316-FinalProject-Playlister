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
import { jsTPS, jsTPS_Transaction, TRANSACTION_STACK_EXCEPTION } from 'jstps';
import PlaylistStoreContext from '../../stores/playlist_store';
import songRequestSender from '../../stores/requests/songRequestSender';

const CurrentModal = {
    NONE: "NONE",
    EDIT_PLAYLIST_MODAL: "EDIT_PLAYLIST_MODAL",
};

class DuplicateSongTransaction extends jsTPS_Transaction {
    constructor(initSongs, initNewSong, initSetSongs, initGetSongs) {
        super();
        this.songs = initSongs;
        this.newSong = initNewSong;
        this.setSongs = initSetSongs;
        this.getSongs = initGetSongs;
    }

    executeDo() {
        const currentSongs = this.getSongs();
        this.setSongs([...currentSongs, this.newSong]);
    }

    executeUndo() {
        const currentSongs = this.getSongs();
        this.setSongs(currentSongs.filter(song => song.songId !== this.newSong.songId));
    }
}

class RemoveSongTransaction extends jsTPS_Transaction {
    constructor(initSongs, initSongToRemove, initSetSongs, initGetSongs) {
        super();
        this.songs = initSongs;
        this.songToRemove = initSongToRemove;
        this.setSongs = initSetSongs;
        this.getSongs = initGetSongs;
    }

    executeDo() {
        const currentSongs = this.getSongs();
        this.setSongs(currentSongs.filter(song => song.songId !== this.songToRemove.songId));
    }

    executeUndo() {
        const currentSongs = this.getSongs();
        const songExists = currentSongs.some(song => song.songId === this.songToRemove.songId);
        if (!songExists) {
            // Find the original position to insert at (or append if not found)
            const originalIndex = this.songs.findIndex(song => song.songId === this.songToRemove.songId);
            if (originalIndex >= 0 && originalIndex < currentSongs.length) {
                const newSongs = [...currentSongs];
                newSongs.splice(originalIndex, 0, this.songToRemove);
                this.setSongs(newSongs);
            } else {
                this.setSongs([...currentSongs, this.songToRemove]);
            }
        }
    }
}


export default function EditPlaylistModal() {
    const { playlistStore } = useContext(PlaylistStoreContext);
    const navigate = useNavigate();
    
    const [playlistName, setPlaylistName] = useState('');
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const lastPlaylistIdRef = useRef(null);
    const isLoadingRef = useRef(false);
    
    const songsRef = useRef([]);
    
    // Update ref whenever songs change
    useEffect(() => {
        songsRef.current = songs;
    }, [songs]);
    
    const tpsRef = useRef(new jsTPS());
    
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
                const initialName = currentPlaylist.playlistName || '';
                setPlaylistName(initialName);
                loadPlaylistSongs().finally(() => {
                    // Reset transaction stack when loading new playlist
                    tpsRef.current = new jsTPS();
                    isLoadingRef.current = false;
                });
            }
        } else if (!isOpen) {
            // Reset refs when modal closes
            lastPlaylistIdRef.current = null;
            isLoadingRef.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const loadPlaylistSongs = async () => {
        if (!currentPlaylist || !currentPlaylist.playlistId) {
            setSongs([]);
            return [];
        }

        try {
            const response = await songRequestSender.getAllSongsInPlaylist(currentPlaylist.playlistId);
            if (response.status === 200 && response.data.success) {
                const playlistSongs = response.data.songs || [];
                
                // Check if songs are already objects or just IDs
                if (playlistSongs.length > 0) {
                    const firstSong = playlistSongs[0];
                    if (firstSong && typeof firstSong === 'object' && firstSong.songId && firstSong.title) {
                        setSongs(playlistSongs);
                        return playlistSongs;
                    } else {
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
                        const validSongs = loadedSongs.filter(song => song !== null);
                        setSongs(validSongs);
                        return validSongs;
                    }
                } else {
                    setSongs([]);
                    return [];
                }
            } else {
                setSongs([]);
                return [];
            }
        } catch (error) {
            console.error('Error loading playlist songs:', error);
            setSongs([]);
            return [];
        }
    };

    const handleCancel = async () => {
        if (playlistStore?.hideModals) {
            playlistStore.hideModals();
        }
        setPlaylistName('');
        setSongs([]);
        tpsRef.current = new jsTPS();
        await playlistStore.loadUserPlaylists();
    };

    const handleConfirm = async () => {
        if (!currentPlaylist) return;
        
        setLoading(true);
        try {
            if (playlistStore?.savePlaylistChanges) {
                await playlistStore.savePlaylistChanges(playlistName, songs);
                handleCancel();
            } else {
                alert('Save playlist functionality not available');
            }
        } catch (error) {
            console.error('Error updating playlist:', error);
            alert(error.message || 'Error updating playlist');
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

    const handleDuplicateSong = (song) => {
        const baseTitle = song.title || 'Untitled';
        const existingDuplicates = songs.filter(s => 
            s.title && s.title.startsWith(baseTitle) && s.title !== baseTitle
        );
        const duplicateNumber = existingDuplicates.length + 1;
        const newTitle = `${baseTitle} ${duplicateNumber}`;
        
        const duplicatedSong = {
            ...song,
            title: newTitle,
            songId: `temp-${Date.now()}-${Math.random()}`
        };
        
        const transaction = new DuplicateSongTransaction(songs, duplicatedSong, setSongs, () => songsRef.current);
        tpsRef.current.processTransaction(transaction);
    };

    const handleRemoveSong = (songId) => {
        const songToRemove = songs.find(song => song.songId === songId);
        if (!songToRemove) {
            console.error('Song not found for removal:', songId);
            return;
        }
        
        const transaction = new RemoveSongTransaction(songs, songToRemove, setSongs, () => songsRef.current);
        tpsRef.current.processTransaction(transaction);
    };

    const handleUndo = () => {
        try {
            if (tpsRef.current.hasTransactionToUndo()) {
                tpsRef.current.undoTransaction();
            }
        } catch (error) {
            if (error === TRANSACTION_STACK_EXCEPTION) {
                console.warn('[EDIT PLAYLIST MODAL] No transactions to undo');
            } else {
                console.error('[EDIT PLAYLIST MODAL] Error undoing transaction:', error);
            }
        }
    };

    const handleRedo = () => {
        try {
            if (tpsRef.current.hasTransactionToDo()) {
                tpsRef.current.doTransaction();
            }
        } catch (error) {
            if (error === TRANSACTION_STACK_EXCEPTION) {
                console.warn('[EDIT PLAYLIST MODAL] No transactions to redo');
            } else {
                console.error('[EDIT PLAYLIST MODAL] Error redoing transaction:', error);
            }
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
                                                backgroundColor: '#2a2a2a',
                                                border: '1px solid #285238',
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
                            disabled={!tpsRef.current.hasTransactionToUndo()}
                            sx={{
                                backgroundColor: '#285238',
                                '&:hover': {
                                    backgroundColor: '#4fb286',
                                },
                                '&:disabled': {
                                    backgroundColor: '#1a1a1a',
                                    color: 'rgba(255, 255, 255, 0.3)',
                                },
                            }}
                        >
                            Undo
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<RedoIcon />}
                            onClick={handleRedo}
                            disabled={!tpsRef.current.hasTransactionToDo()}
                            sx={{ 
                                ml: 1,
                                backgroundColor: '#285238',
                                '&:hover': {
                                    backgroundColor: '#4fb286',
                                },
                                '&:disabled': {
                                    backgroundColor: '#1a1a1a',
                                    color: 'rgba(255, 255, 255, 0.3)',
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
