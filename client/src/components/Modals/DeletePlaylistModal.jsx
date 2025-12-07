import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from '@mui/material';
import PlaylistStoreContext from '../../stores/playlist_store';
import { useContext } from 'react';

export default function DeletePlaylistModal() {
    const { playlistStore } = useContext(PlaylistStoreContext);
    
    // Use the string directly to match the store's CurrentModal.DELETE_PLAYLIST_MODAL
    const isOpen = playlistStore?.currentModal === "DELETE_PLAYLIST_MODAL";
    const currentPlaylist = playlistStore?.currentList || playlistStore?.listMarkedForDeletion;
    
    const handleCancel = () => {
        playlistStore.hideModals();
    }
    
    const handleConfirm = async () => {
        if (currentPlaylist) {
            await playlistStore.deletePlaylist(currentPlaylist);
        }
    }

    return (
        <Dialog open={isOpen} onClose={handleCancel}>
            <DialogTitle>Delete Playlist</DialogTitle>
            <DialogContent>
                <Typography>
                    {currentPlaylist ? (
                        <>
                            Are you sure you want to delete the playlist "{currentPlaylist.playlistName}"? 
                            This action cannot be undone.
                        </>
                    ) : (
                        "Are you sure you want to delete this playlist? This action cannot be undone."
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