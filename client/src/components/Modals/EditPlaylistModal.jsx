import { useContext, useState, useEffect } from 'react';
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
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import PlaylistStoreContext from '../../stores/playlist_store';
import SongStoreContext from '../../stores/song_store';
import AuthContext from '../../auth';
import playlistRequestSender from '../../stores/requests/playlistRequestSender';
import songRequestSender from '../../stores/requests/songRequestSender';
import EditSongModal from './EditSongModal';

const CurrentModal = {
    NONE: "NONE",
    EDIT_PLAYLIST_MODAL: "EDIT_PLAYLIST_MODAL",
};

export default function EditPlaylistModal() {
    const { playlistStore } = useContext(PlaylistStoreContext);
    const { songStore } = useContext(SongStoreContext);
    const { auth } = useContext(AuthContext);
    
    const [playlistName, setPlaylistName] = useState('');
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSongSelector, setShowSongSelector] = useState(false);
    const [availableSongs, setAvailableSongs] = useState([]);
    
    const isOpen = playlistStore.currentModal === CurrentModal.EDIT_PLAYLIST_MODAL;
    const currentPlaylist = playlistStore.currentList;

    // Load playlist data when modal opens
    useEffect(() => {
        if (isOpen && currentPlaylist) {
            setPlaylistName(currentPlaylist.playlistName || '');
            loadPlaylistSongs();
            loadAvailableSongs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentPlaylist]);

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

    // Load available songs from user's catalog
    const loadAvailableSongs = async () => {
        if (auth.loggedIn && auth.user?.userId) {
            try {
                const response = await songRequestSender.getUserSongs(auth.user.userId);
                if (response.status === 200 && response.data.success) {
                    setAvailableSongs(response.data.songs || []);
                }
            } catch (error) {
                console.error('Error loading available songs:', error);
            }
        }
    };

    const handleCancel = () => {
        playlistStore.hideModals();
        setPlaylistName('');
        setSongs([]);
        setShowSongSelector(false);
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
                // Reload playlists to get updated data
                await playlistStore.loadUserPlaylists();
                // Small delay to ensure store updates before closing
                await new Promise(resolve => setTimeout(resolve, 100));
                handleCancel();
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
        setShowSongSelector(true);
    };

    const handleSelectSong = (song) => {
        // Check if song is already in playlist
        if (songs.some(s => s.songId === song.songId)) {
            alert('Song is already in the playlist');
            return;
        }
        setSongs([...songs, song]);
        setShowSongSelector(false);
    };

    const handleEditSong = (song) => {
        // Open EditSongModal by dispatching EDIT_SONG action
        // Note: This requires the songStore to have an editSong method
        // For now, we'll trigger it via the songStore reducer pattern
        if (songStore && songStore.currentModal !== undefined) {
            // We'll need to add an editSong method to songStore or handle this differently
            // For now, just log - the EditSongModal integration can be added later
            console.log('Edit song:', song);
            // TODO: Integrate with EditSongModal properly
        }
    };

    const handleDuplicateSong = (song) => {
        // Add a copy of the song to the playlist
        setSongs([...songs, { ...song }]);
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
                        backgroundColor: '#e8f5e9', // Light green background
                        minHeight: '500px'
                    }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        backgroundColor: '#2e7d32', // Dark green
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
                
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Playlist Name Field */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                label="Playlist Name"
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                                variant="outlined"
                                fullWidth
                                sx={{ flexGrow: 1 }}
                            />
                            <IconButton 
                                onClick={handleClearName}
                                sx={{ color: 'text.secondary' }}
                            >
                                <CloseIcon />
                            </IconButton>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<AddIcon />}
                                onClick={handleAddSong}
                                sx={{ minWidth: '120px' }}
                            >
                                <MusicNoteIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                                Add Song
                            </Button>
                        </Box>

                        {/* Songs List */}
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Songs ({songs.length})
                            </Typography>
                            {songs.length === 0 ? (
                                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
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
                                                backgroundColor: '#fff9c4' // Light yellow
                                            }}
                                        >
                                            <ListItem
                                                sx={{ py: 0.5 }}
                                                secondaryAction={
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <IconButton
                                                            edge="end"
                                                            onClick={() => handleEditSong(song)}
                                                            size="small"
                                                            title="Edit"
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            edge="end"
                                                            onClick={() => handleDuplicateSong(song)}
                                                            size="small"
                                                            title="Duplicate"
                                                        >
                                                            <ContentCopyIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            edge="end"
                                                            onClick={() => handleRemoveSong(song.songId)}
                                                            size="small"
                                                            title="Remove"
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                }
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body1">
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

                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Box>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<UndoIcon />}
                            onClick={handleUndo}
                        >
                            Undo
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<RedoIcon />}
                            onClick={handleRedo}
                            sx={{ ml: 1 }}
                        >
                            Redo
                        </Button>
                    </Box>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleConfirm}
                        disabled={loading || !playlistName.trim()}
                    >
                        {loading ? 'Saving...' : 'Confirm'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="success"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Song Selector Dialog */}
            <Dialog
                open={showSongSelector}
                onClose={() => setShowSongSelector(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Select a Song to Add</DialogTitle>
                <DialogContent>
                    <List>
                        {availableSongs.length === 0 ? (
                            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                No songs available. Create songs in the Song Catalog first.
                            </Typography>
                        ) : (
                            availableSongs
                                .filter(song => !songs.some(s => s.songId === song.songId))
                                .map((song) => (
                                    <ListItem
                                        key={song.songId}
                                        button
                                        onClick={() => handleSelectSong(song)}
                                    >
                                        <ListItemText
                                            primary={`${song.title || 'Unknown Title'} by ${song.artist || 'Unknown Artist'}`}
                                            secondary={song.year ? `Year: ${song.year}` : ''}
                                        />
                                    </ListItem>
                                ))
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSongSelector(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <EditSongModal />
        </>
    );
}

