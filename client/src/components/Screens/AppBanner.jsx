import { 
    AppBar, 
    Avatar, 
    Menu,
    MenuItem,
    IconButton,
    Toolbar,
    Box
} from "@mui/material";
import * as React from 'react'
import CottageIcon from '@mui/icons-material/Cottage';
import { SegmentedControl, Typography } from '@mantine/core';
import {useState} from 'react'

function AppBanner() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [view, setView] = useState('playlists');
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
        // makes currentTarget the element that other components will attach to.
    }
    const handleMenuClose = () => {
        setAnchorEl(null);
    }
    const handleViewChange = (view) => {
        setView(view);
    }
    return (
        <AppBar>
            {/* toolbar for horizontal proper spacing and layout. */}
            <Toolbar sx={{ display: 'flex' }}>
                <IconButton id="HomeButton" size="large" edge="start">
                    <CottageIcon fontSize="large" sx={{color: 'white' }} />
                </IconButton>
                <SegmentedControl value={view} onChange={handleViewChange} data={[
                    { label: 'Playlists', value: 'playlists' },
                    { label: 'Songs', value: 'songs' },
                ]} />
                <Typography component="h1" sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    Playlister
                </Typography>
                <Box id="ProfileMenu" sx={{ marginLeft: 'auto' }}> 
                    <IconButton id="avatar-button" size="small" onClick={handleMenuOpen}>
                        <Avatar alt="Whatever" src="../../assets/react.svg" />
                    </IconButton>
                    <Menu id="menu-appbar" onClose={handleMenuClose}
                            anchorEl={anchorEl}
                            anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}>
                            <MenuItem> Login </MenuItem>
                            <MenuItem> Create Account </MenuItem>
                            <MenuItem> Edit Account </MenuItem>
                            <MenuItem> Logout </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>

        </AppBar>
    )
}
export default AppBanner