import { 
    AppBar, 
    Avatar, 
    Menu,
    MenuItem,
    IconButton,
    Toolbar,
    Box,
    Typography
} from "@mui/material";
import React, { useContext } from 'react'
import CottageIcon from '@mui/icons-material/Cottage';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import TabSlider from '../TabSlider';
import AuthContext from '../../auth';


function AppBanner() {
    const { auth } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isWelcomeScreen = location.pathname === '/' || location.pathname === '';
    
    // Derive view directly from location
    const view = location.pathname === '/songs' ? 'songs' : 
                 location.pathname === '/playlists' ? 'playlists' : 'playlists';
    
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
        // makes currentTarget the element that other components will attach to.
    }
    const handleMenuClose = () => {
        setAnchorEl(null);
    }
    const handleViewChange = (newView) => {
        // Navigate to the new route - view will update automatically from location
        navigate(`/${newView}`);
    }
    return (
        <AppBar>
            {/* toolbar for horizontal proper spacing and layout. */}
            <Toolbar sx={{ display: 'flex' }}>
                <IconButton id="HomeButton" size="large" edge="start" href="/">
                    <CottageIcon fontSize="large" sx={{color: 'white' }} />
                </IconButton>
                {auth.loggedIn && !isWelcomeScreen && (
                    <TabSlider 
                        value={view} 
                        onChange={handleViewChange} 
                        options={[
                            { label: 'Playlists', value: 'playlists' },
                            { label: 'Songs', value: 'songs' },
                        ]} 
                    />
                )}
                <Typography component="h2" sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    Playlister
                </Typography>
                <Box id="ProfileMenu" sx={{ marginLeft: 'auto' }}> 
                    <IconButton id="avatar-button" size="small" onClick={handleMenuOpen}>
                        <Avatar alt={auth.user?.userName || "User"} src={auth.user?.avatar || "../../assets/react.svg"} />
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
                            {auth.loggedIn ? (
                                [
                                    <MenuItem key="edit" component={Link} to="/editAccount"> Edit Account </MenuItem>,
                                    <MenuItem key="logout" onClick={() => {
                                        auth.logoutUser();
                                        handleMenuClose();
                                    }}> Logout </MenuItem>
                                ]
                            ) : (
                                [
                                    <MenuItem key="login" component={Link} to='/login' onClick={handleMenuClose}> Login </MenuItem>,
                                    <MenuItem key="register" component={Link} to="/register" onClick={handleMenuClose}> Create Account </MenuItem>
                                ]
                            )}
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    )
}
export default AppBanner