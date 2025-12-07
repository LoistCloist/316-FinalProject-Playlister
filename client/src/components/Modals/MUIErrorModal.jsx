import React, { useContext } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AuthContext from '../../auth';


export default function MUIErrorModal() {
    const { auth } = useContext(AuthContext)

    function handleClose() {
        auth.clearErrorMessage();
    }

    return (
        <Dialog 
            open={auth.errorMessage !== null}
            onClose={handleClose}
            aria-labelledby="error-dialog-title"
            aria-describedby="error-dialog-description"
        >
            <DialogTitle id="error-dialog-title">
                Error
            </DialogTitle>
            <DialogContent>
                <Alert severity="error" sx={{ mt: 1 }}>
                    {auth.errorMessage}
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="contained" color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}