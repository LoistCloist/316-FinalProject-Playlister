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
import AuthContext from '../auth';
import { useContext, useState, useEffect } from 'react';

export default function PlaylistCard({ playlist }) {
    const { playlistStore } = useContext(PlaylistStoreContext);
    const { auth } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(false);
    
    // Check if user is logged in and owns this playlist
    const isOwner = auth.loggedIn && auth.user && playlist.userId === auth.user.userId;
    const canEdit = auth.loggedIn && isOwner;
    
    // Force re-render when playlist prop changes
    useEffect(() => {
        // This ensures the card updates when playlist data changes
    }, [playlist.playlistId, playlist.playlistName, playlist.songs, playlist.listeners]);
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
        playlistStore.duplicatePlaylist(playlist);
    }    
    const handlePlay = (event) => {
        event.stopPropagation();
        if (playlistStore && playlistStore.playPlaylist) {
            playlistStore.playPlaylist(playlist);
        }
    }    

  return (
    <div>
      <Accordion
        expanded={expanded}
        onChange={(event, isExpanded) => setExpanded(isExpanded)}
        sx={{
          backgroundColor: '#2a2a2a', 
          border: '1px solid #285238',
          color: 'white',
          mb: 1,
          '&:hover': {
            backgroundColor: '#333333',
            borderColor: '#3c896d', 
          },
          '&:before': {
            display: 'none', 
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
                <Typography component="span" sx={{ color: '#b3b3b3', fontSize: '0.75rem', mt: 0.5 }}>
                  {playlist.listeners ? `${playlist.listeners.length} listener${playlist.listeners.length !== 1 ? 's' : ''}` : '0 listeners'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {canEdit && (
                <>
                  <Button 
                    component="div"
                    onClick={handleDelete}
                    size="small"
                    sx={{ color: '#f44336', '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }, cursor: 'pointer' }}
                  >
                    Delete
                  </Button>
                  <Button 
                    component="div"
                    onClick={handleEdit}
                    size="small"
                    sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, cursor: 'pointer' }}
                  >
                    Edit
                  </Button>
                  <Button 
                    component="div"
                    onClick={handleCopy}
                    size="small"
                    sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, cursor: 'pointer' }}
                  >
                    Copy
                  </Button>
                </>
              )}
              <Button 
                component="div"
                onClick={handlePlay}
                size="small"
                sx={{ 
                  color: '#285238', 
                  backgroundColor: 'rgba(40, 82, 56, 0.2)',
                  cursor: 'pointer',
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
