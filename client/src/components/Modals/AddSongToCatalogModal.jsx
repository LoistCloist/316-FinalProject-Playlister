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
import AuthContext from '../../auth';
import songRequestSender from '../../stores/requests/songRequestSender';

const CurrentModal = {
    NONE: "NONE",
    ADD_SONG_TO_CATALOG_MODAL: "ADD_SONG_TO_CATALOG_MODAL",
};

export default function AddSongToCatalogModal() {
    const { songStore } = useContext(SongStoreContext);
    const { auth } = useContext(AuthContext);
    
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [year, setYear] = useState('');
    const [youtubeId, setYoutubeId] = useState('');
    const [loading, setLoading] = useState(false);
    
    const isOpen = songStore.currentModal === CurrentModal.ADD_SONG_TO_CATALOG_MODAL;

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setArtist('');
            setYear('');
            setYoutubeId('');
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        // Validate required fields
        if (!title.trim() || !artist.trim() || !year.trim() || !youtubeId.trim()) {
            alert('All fields are required');
            return;
        }

        // Validate user is logged in
        if (!auth.loggedIn || !auth.user || !auth.user.email) {
            alert('You must be logged in to add songs');
            return;
        }

        setLoading(true);
        try {
            const response = await songRequestSender.createSong(
                title.trim(),
                artist.trim(),
                year.trim(),
                youtubeId.trim(),
                auth.user.email
            );
            
            if (response.status === 200 && response.data.success) {
                // Reload user songs to reflect changes
                if (songStore && songStore.loadUserSongs && auth.loggedIn && auth.user?.userId) {
                    await songStore.loadUserSongs();
                }
                // Small delay to ensure store updates before closing
                await new Promise(resolve => setTimeout(resolve, 100));
                handleCancel();
            } else {
                console.error('Failed to create song:', response.data);
                alert('Failed to create song');
            }
        } catch (error) {
            console.error('Error creating song:', error);
            if (error.response?.status === 400) {
                alert(error.response?.data?.errorMessage || 'Failed to create song');
            } else {
                alert('Error creating song');
            }
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
                <Typography variant="h6">Add Song</Typography>
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
                        variant="outlined"
                        fullWidth
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
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
