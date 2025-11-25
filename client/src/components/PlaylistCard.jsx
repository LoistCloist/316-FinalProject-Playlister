import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';

export default function AccordionUsage() {
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
          <Typography component="span">Accordion 1</Typography>
          <Button onClick={handleDelete}>Delete</Button>
          <Button onClick={handleEdit}>Edit</Button>
          <Button onClick={handleCopy}>Copy</Button>
          <Button onClick={handlePlay}>Play</Button>

        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
    </div>
  );
}