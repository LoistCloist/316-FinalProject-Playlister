import { 
  Accordion, 
  AccordionActions, 
  AccordionSummary, 
  AccordionDetails, 
  Typography, 
  Button, 
  Avatar,
  List,
  ListItem,
  ListItemText,
  Box
} from '@mui/material';
import PlaylistStoreContext from '../stores/playlist_store';
import { useContext, useState } from 'react';

export default function PlaylistCard({ playlist }) {
    const { playlistStore } = useContext(PlaylistStoreContext);
    const [expanded, setExpanded] = useState(false);
    const handleDelete = (event) => {
        event.stopPropagation();
        playlistStore.markListForDeletion(playlist);
    }
    const handleEdit = (event) => {
        event.stopPropagation();
        playlistStore.editPlaylist(playlist);
    }    
    const handleCopy = (event) => {
        event.stopPropagation();
    }    
    const handlePlay = (event) => {
        event.stopPropagation();
    }    

  return (
    <div>
      <Accordion
        expanded={expanded}
        onChange={(event, isExpanded) => setExpanded(isExpanded)}
        sx={{
          backgroundColor: '#2a2a2a', // Dark gray to match app theme
          border: '1px solid #285238', // Primary green border
          color: 'white',
          mb: 1,
          '&:hover': {
            backgroundColor: '#333333',
            borderColor: '#3c896d', // Lighter green on hover
          },
          '&:before': {
            display: 'none', // Remove default border
          }
        }}
      >
        <AccordionSummary
          expandIcon={null}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
            '& .MuiAccordionSummary-content': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              mr: 0
            }
          }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Avatar src={playlist.userAvatar} sx={{ mr: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography component="span" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {playlist.playlistName}
                </Typography>
                <Typography component="span" sx={{ color: '#b3b3b3', fontSize: '0.875rem' }}>
                  {playlist.userName}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                onClick={handleDelete}
                size="small"
                sx={{ color: '#f44336', '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' } }}
              >
                Delete
              </Button>
              <Button 
                onClick={handleEdit}
                size="small"
                sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Edit
              </Button>
              <Button 
                onClick={handleCopy}
                size="small"
                sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Copy
              </Button>
              <Button 
                onClick={handlePlay}
                size="small"
                sx={{ 
                  color: '#285238', 
                  backgroundColor: 'rgba(40, 82, 56, 0.2)',
                  '&:hover': { 
                    backgroundColor: 'rgba(40, 82, 56, 0.3)',
                    color: '#3c896d'
                  } 
                }}
              >
                Play
              </Button>
            </Box>
          </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: '#1a1a1a', pt: 1 }}>
          <List sx={{ py: 0, display: 'flex', flexDirection: 'column' }}>
            {playlist.songs && playlist.songs.length > 0 ? (
              playlist.songs.map((song, index) => {
                // Handle both song objects and songId strings
                const songId = typeof song === 'string' ? song : (song.songId || song);
                // Use index in key to ensure uniqueness even if same song appears multiple times
                return (
                <ListItem key={`${songId}-${index}`} sx={{ py: 0.5, width: '100%', display: 'block' }}>
                  <ListItemText 
                    primary={
                      <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
                        {index + 1}. {song.title || 'Unknown Title'} by {song.artist || 'Unknown Artist'} {song.year ? `(${song.year})` : ''}
                      </Typography>
                    }
                  />
                </ListItem>
                );
              })
            ) : (
              <ListItem sx={{ py: 0, width: '100%', display: 'block' }}>
                <ListItemText 
                  primary={
                    <Typography sx={{ color: '#b3b3b3', fontStyle: 'italic' }}>
                      No songs in this playlist
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
