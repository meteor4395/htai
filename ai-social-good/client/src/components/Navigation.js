import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  makeStyles,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@material-ui/core';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    marginLeft: theme.spacing(2),
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: theme.palette.secondary.main,
    cursor: 'pointer',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const Navigation = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
    handleClose();
  };

  // Don't show navigation on login/signup pages
  if (['/login', '/signup'].includes(location.pathname)) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          AI for Social Good
        </Typography>
        {user ? (
          <>
            <Button color="inherit" component={RouterLink} to="/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" component={RouterLink} to="/upload">
              Upload
            </Button>
            <NotificationCenter />
            <div className={classes.userInfo}>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar className={classes.avatar}>
                  {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  {user.displayName || user.email}
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          </>
        ) : (
          <>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/signup">
              Sign Up
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 