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
    
    // Use the string directly to match the store's CurrentModal.DELETE_PLAYLIST_MODAL
    const isOpen = songStore?.currentModal === "VERIFY_REMOVE_SONG_MODAL";
    const currentSong = songStore?.currentSong || songStore?.songMarkedForDeletion;
    
    const handleCancel = () => {
        songStore.hideModals();
    }
    
    const handleConfirm = async () => {
        if (currentSong) {
            await songStore.deleteSong(currentSong);
        }
    }

    return (
        <Dialog open={isOpen} onClose={handleCancel}>
            <DialogTitle>Delete Playlist</DialogTitle>
            <DialogContent>
                <Typography>
                    {currentSong ? (
                        <>
                            Are you sure you want to delete the song "{currentSong.songName}"? 
                            This action cannot be undone.
                        </>
                    ) : (
                        "Are you sure you want to delete this song? This action cannot be undone."
                    )}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="error" onClick={handleConfirm}>
                    Confirm
                </Button>
                <Button variant="outlined" onClick={handleCancel}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}