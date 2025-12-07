import { 
  Accordion, 
  AccordionActions, 
  AccordionSummary, 
  AccordionDetails, 
  Typography, 
  Button, 
  Avatar 
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
          <Typography component="span">{playlist.playlistName}</Typography>
          <Typography component="span">{playlist.userName}</Typography>
          <Avatar src={playlist.userAvatar} />
          <AccordionActions>
            <Button onClick={handleDelete}>Delete</Button>
            <Button onClick={handleEdit}>Edit</Button>
            <Button onClick={handleCopy}>Copy</Button>
            <Button onClick={handlePlay}>Play</Button>
          </AccordionActions>
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
