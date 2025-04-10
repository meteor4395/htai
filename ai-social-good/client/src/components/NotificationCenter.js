import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Typography,
  Button,
  makeStyles,
  Divider,
} from '@material-ui/core';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@material-ui/icons';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const useStyles = makeStyles((theme) => ({
  menuPaper: {
    width: 320,
    maxHeight: 400,
  },
  header: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  list: {
    padding: 0,
  },
  listItem: {
    padding: theme.spacing(2),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  unread: {
    backgroundColor: theme.palette.action.selected,
  },
  notificationTitle: {
    fontWeight: 600,
  },
  timestamp: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  noNotifications: {
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

const NotificationCenter = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (notificationId) => {
    await deleteNotification(notificationId);
  };

  const renderNotification = (notification) => {
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt.toDate()), {
      addSuffix: true,
    });

    return (
      <ListItem
        key={notification.id}
        className={`${classes.listItem} ${!notification.read ? classes.unread : ''}`}
      >
        <ListItemText
          primary={
            <Typography className={classes.notificationTitle}>
              {notification.title}
            </Typography>
          }
          secondary={
            <>
              <Typography component="span" variant="body2">
                {notification.message}
              </Typography>
              <Typography className={classes.timestamp}>
                {timeAgo}
              </Typography>
            </>
          }
        />
        <div>
          {!notification.read && (
            <IconButton
              size="small"
              onClick={() => handleMarkAsRead(notification.id)}
              title="Mark as read"
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => handleDelete(notification.id)}
            title="Delete"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </ListItem>
    );
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} new notifications`}
      >
        <Badge badgeContent={unreadCount} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          className: classes.menuPaper,
        }}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <div className={classes.header}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button color="primary" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        {notifications.length > 0 ? (
          <>
            <List className={classes.list}>
              {notifications.map(renderNotification)}
            </List>
            <Divider />
            <div className={classes.actions}>
              <Typography variant="body2">
                {unreadCount} unread notifications
              </Typography>
            </div>
          </>
        ) : (
          <div className={classes.noNotifications}>
            <Typography variant="body1">No notifications</Typography>
          </div>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter; 