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
import { useContext, useState } from 'react';

export default function SongCard({ song, onPlay }) {
    const { songStore } = useContext(SongStoreContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    
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
        setAnchorEl(null);
    }
    
    const handleEdit = () => {
        handleMenuClose();
        if (songStore && songStore.editSong) {
            songStore.editSong(song);
        }
    }
    
    const handleDelete = () => {
        handleMenuClose();
        // TODO: Implement delete song functionality
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
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
            </Menu>
        </Paper>
    );
}

