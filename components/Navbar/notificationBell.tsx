import { useState, MouseEvent } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks';
import Link from 'next/link';
import { IconButton, MenuItem, Menu, Badge, Typography, Card, CardContent } from '@material-ui/core';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import { getErrorMessage } from '../../lib/errorFormating';
import { Notifications as NotificationsIcon } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';

const NotificationsQuery = gql`
query NotificationQuery{
    notifications{
        id
        name
        message
        viewed
    }
}
`

const ViewNotification = gql`
mutation ViewNotification($id:String!){
    viewNotification(id:$id){
        success
    }
}
`
const NotificationSubscription = gql`
subscription NotificationSubscription{
    notificationChange {
        notification {
            id
            name
            message
            viewed
        }
        type
    }
} 
`


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        unviewedNotification: {
            backgroundColor: theme.palette.secondary.main
        }
    }),
);

interface notification {
    id: string,
    name?: string,
    message?: string,
    viewed?: Boolean,
}

interface NotoData {
    notifications: notification[]
}

export default function notificationBell() {
    const [notifications, setNotifications] = useState<notification[]>([]);
    // console.log(notifications);
    const { loading, error } = useQuery<NotoData>(NotificationsQuery,
        {
            onCompleted: (data) => setNotifications(data.notifications)
        });
    useSubscription<{ notificationChange: { notification: notification, type: string } }>(NotificationSubscription, {
        onSubscriptionData: ({ subscriptionData: data }) => {
            console.log("Got Notification");
            console.log(data);
            if (data.data) {
                console.log(data.data);
                if (data.data.notificationChange.type === 'insert') {
                    notifications.push(data.data.notificationChange.notification)
                    setNotifications(notifications);
                } else {
                    const newNotifications = notifications.filter(noto => noto.id !== data.data?.notificationChange.notification.id);
                    setNotifications(newNotifications);
                }
            } else if (data.error) {
                console.error(data.error);
            }
        }
    })
    const [viewNoto] = useMutation(ViewNotification, {
        onError: console.error
    });

    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);
    const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const menuId = 'notification-menu';
    const numberUnread = notifications.reduce((prev, curr) => curr.viewed ? prev : prev + 1, 0);
    const menuItems = notifications.map(noto => {
        if (!noto.name) {
            return (<div />)
        }
        return (<Link
            href={`/notifications/${noto.id}`}
            key={noto.id}
        >
            <MenuItem onClick={() => viewNoto({ variables: { id: noto.id } })}>
                <Card className={noto.viewed ? "" : classes.unviewedNotification} >
                    <CardContent>
                        <Typography variant="h5" component="h2">
                            {noto.name}
                        </Typography>
                        <Typography variant="body2" component="p">
                            {noto.message}
                        </Typography>
                    </CardContent>
                </Card>
            </MenuItem>
        </Link>)
    });
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            {menuItems}
        </Menu>
    );
    return (<>
        <IconButton
            aria-label="Notifications"
            color="inherit"
            edge="end"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleMenuOpen}
        >
            <Badge badgeContent={numberUnread} color="secondary">
                <NotificationsIcon />
            </Badge>
        </IconButton>
        {renderMenu}</>)
}