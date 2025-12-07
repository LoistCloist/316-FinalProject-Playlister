import {  useState } from 'react'
import * as React from 'react'
import { 
    Box, 
        Button, 
        Dialog, 
        Typography, 
        TextField, 
        Toolbar,
        DialogTitle,
        DialogContent,
        DialogActions
} from '@mui/material'

export default function EditSongModal() {
    //const { songStore, setSongStore } = useContext(SongStoreContext);
    //const { playlistStore, setPlaylistStore } = useContext(PlaylistStoreContext);
    const [open, setOpen] = useState(false);
    const handleConfirm = () => {
        setOpen(false);
    }
    const handleCancel = () => {
        setOpen(false);
    }   
    const handleOpen = () => {
        setOpen(true);
    }
    return (
        <>
            <Dialog open={open} onClose={handleCancel} >
                <DialogTitle>Edit Song</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                        <TextField label="Title" variant="outlined" fullWidth />
                        <TextField label="Artist" variant="outlined" fullWidth />
                        <TextField label="Year" variant="outlined" fullWidth />
                        <TextField label="YouTube ID" variant="outlined" fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleConfirm}>Confirm</Button>
                    <Button variant="contained" onClick={handleCancel}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <Button variant="contained" onClick={handleOpen}>Open Dialog</Button>
        </>
    )
}
