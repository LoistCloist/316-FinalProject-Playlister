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
    Toolbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SongStoreContext from '../../stores/song_store';

const CurrentModal = {
    NONE: "NONE",
    EDIT_SONG_MODAL: "EDIT_SONG_MODAL",
};

export default function EditSongModal() {
    const { songStore } = useContext(SongStoreContext);
    
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [year, setYear] = useState('');
    const [youtubeId, setYoutubeId] = useState('');
    const [loading, setLoading] = useState(false);
    
    const isOpen = songStore.currentModal === CurrentModal.EDIT_SONG_MODAL;
    const currentSong = songStore.currentSong;

    // Load song data when modal opens
    useEffect(() => {
        if (isOpen && currentSong) {
            setTitle(currentSong.title || '');
            setArtist(currentSong.artist || '');
            setYear(currentSong.year !== undefined && currentSong.year !== null ? String(currentSong.year) : '');
            setYoutubeId(currentSong.youtubeId || '');
        }
    }, [isOpen, currentSong]);

    const handleConfirm = async () => {
        if (!currentSong || !currentSong.songId) {
            alert('No song selected');
            return;
        }

        // Validate required fields
        if (!title.trim() || !artist.trim() || !youtubeId.trim()) {
            alert('Title, Artist, and YouTube ID are required');
            return;
        }

        // Validate year is a number
        const yearNumber = parseInt(year.trim(), 10);
        if (!year.trim() || isNaN(yearNumber) || yearNumber < 0 || yearNumber > 9999) {
            alert('Year must be a valid number between 0 and 9999');
            return;
        }

        setLoading(true);
        try {
            if (songStore && songStore.editSong) {
                const success = await songStore.editSong(
                    currentSong.songId,
                    title,
                    artist,
                    yearNumber,
                    youtubeId
                );
                if (success) {
                    // Reload all user songs

                    handleCancel();
                }
            } else {
                alert('Error: Song store not available');
            }
            if (songStore && songStore.loadUserSongs) {
                await songStore.loadUserSongs();
            }
        } catch (error) {
            console.error('Error updating song:', error);
            alert('Error updating song');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (songStore && songStore.hideModals) {
            songStore.hideModals();
        }
        // Reset form
        setTitle('');
        setArtist('');
        setYear('');
        setYoutubeId('');
    };

    const handleClearTitle = () => {
        setTitle('');
    };

    const handleClearArtist = () => {
        setArtist('');
    };

    const handleClearYear = () => {
        setYear('');
    };

    const handleClearYoutubeId = () => {
        setYoutubeId('');
    };

    return (
        <Dialog 
            open={isOpen} 
            onClose={handleCancel}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: '#1a1a1a', // Dark background
                    color: 'white',
                }
            }}
        >
            <DialogTitle sx={{ 
                backgroundColor: '#285238', // Primary green
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6">Edit Song</Typography>
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={handleCancel}
                    aria-label="close"
                    sx={{ color: 'white' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: '#1a1a1a', color: 'white', mt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        label="Title"
                        variant="outlined"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{
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
                        InputProps={{
                            endAdornment: title && (
                                <IconButton
                                    size="small"
                                    onClick={handleClearTitle}
                                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            ),
                        }}
                    />
                    <TextField
                        label="Artist"
                        variant="outlined"
                        fullWidth
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        sx={{
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
                        InputProps={{
                            endAdornment: artist && (
                                <IconButton
                                    size="small"
                                    onClick={handleClearArtist}
                                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            ),
                        }}
                    />
                    <TextField
                        label="Year"
                        type="number"
                        inputProps={{ min: 0, max: 9999, step: 1 }}
                        variant="outlined"
                        fullWidth
                        value={year}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (!isNaN(value) && parseInt(value, 10) >= 0 && parseInt(value, 10) <= 9999)) {
                                setYear(value);
                            }
                        }}
                        sx={{
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
                        InputProps={{
                            endAdornment: year && (
                                <IconButton
                                    size="small"
                                    onClick={handleClearYear}
                                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            ),
                        }}
                    />
                    <TextField
                        label="YouTube ID"
                        variant="outlined"
                        fullWidth
                        value={youtubeId}
                        onChange={(e) => setYoutubeId(e.target.value)}
                        sx={{
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
                        InputProps={{
                            endAdornment: youtubeId && (
                                <IconButton
                                    size="small"
                                    onClick={handleClearYoutubeId}
                                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            ),
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ backgroundColor: '#1a1a1a', color: 'white', p: 2 }}>
                <Toolbar sx={{ width: '100%', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                        variant="contained"
                        onClick={handleConfirm}
                        disabled={loading}
                        sx={{
                            backgroundColor: '#285238',
                            '&:hover': {
                                backgroundColor: '#4fb286',
                            },
                        }}
                    >
                        Confirm
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
                </Toolbar>
            </DialogActions>
        </Dialog>
    );
}
