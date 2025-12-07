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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export default function PlaylistCard({ playlist }) {
    const handleDelete = (event) => {
        event.stopPropagation();
    }
    const handleEdit = (event) => {
        event.stopPropagation();
    }    
    const handleCopy = (event) => {
        event.stopPropagation();
    }    
    const handlePlay = (event) => {
        event.stopPropagation();
    }    

  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Avatar src={playlist.userAvatar} sx={{ mr: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography component="span">{playlist.playlistName}</Typography>
            <Typography component="span">{playlist.userName}</Typography>
          </Box>
          <AccordionActions>
            <Button onClick={handleDelete}>Delete</Button>
            <Button onClick={handleEdit}>Edit</Button>
            <Button onClick={handleCopy}>Copy</Button>
            <Button onClick={handlePlay}>Play</Button>
          </AccordionActions>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ py: 0, display: 'flex', flexDirection: 'column' }}>
            {playlist.songs && playlist.songs.length > 0 ? (
              playlist.songs.map((song, index) => (
                <ListItem key={song.songId || song} sx={{ py: 0, width: '100%', display: 'block' }}>
                  <ListItemText 
                    primary={
                      <Typography sx={{ color: 'black' }}>
                        {index + 1}. {song.title || 'Unknown Title'} by {song.artist || 'Unknown Artist'} {song.year ? `(${song.year})` : ''}
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <ListItem sx={{ py: 0, width: '100%', display: 'block' }}>
                <ListItemText 
                  primary={
                    <Typography sx={{ color: 'black' }}>
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
