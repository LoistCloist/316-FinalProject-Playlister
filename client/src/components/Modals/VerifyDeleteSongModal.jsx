import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from '@mui/material';
import SongStoreContext from '../../stores/song_store';
import { useContext } from 'react';

export default function VerifyDeleteSongModal() {
    const { songStore } = useContext(SongStoreContext);
    
    const isOpen = songStore?.currentModal === "VERIFY_REMOVE_SONG_MODAL";
    const currentSong = songStore?.currentSong || songStore?.songMarkedForDeletion;
    
    const handleCancel = () => {
        if (songStore && songStore.hideModals) {
            songStore.hideModals();
        }
    }
    
    const handleConfirm = async () => {
        if (currentSong && songStore && songStore.deleteSong) {
            await songStore.deleteSong(currentSong);
        }
    }

    return (
        <Dialog 
            open={isOpen} 
            onClose={handleCancel}
            PaperProps={{
                sx: {
                    backgroundColor: '#1a1a1a', // Dark background to match app
                    color: 'white',
                }
            }}
        >
            <DialogTitle sx={{ 
                backgroundColor: '#285238', // Primary green from theme
                color: 'white',
            }}>
                Delete Song
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: '#1a1a1a', color: 'white', mt: 2 }}>
                <Typography sx={{ color: 'white' }}>
                    {currentSong ? (
                        <>
                            Are you sure you want to delete the song "{currentSong.title || 'Unknown Title'}" by {currentSong.artist || 'Unknown Artist'}? 
                            This action cannot be undone.
                        </>
                    ) : (
                        "Are you sure you want to delete this song? This action cannot be undone."
                    )}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ backgroundColor: '#1a1a1a', color: 'white', p: 2 }}>
                <Button 
                    variant="contained" 
                    color="error" 
                    onClick={handleConfirm}
                    sx={{
                        backgroundColor: '#d32f2f',
                        '&:hover': {
                            backgroundColor: '#c62828',
                        },
                    }}
                >
                    Confirm
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={handleCancel}
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
    )
}