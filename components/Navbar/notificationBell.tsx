import { useState, MouseEvent } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks';
import Link from 'next/link';
import { IconButton, MenuItem, Menu, Badge, Typography, Card, CardContent } from '@material-ui/core';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import { getErrorMessage } from '../errorFormating';
import { Notifications as NotificationsIcon } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';

const NotificationsQuery = gql`
query NotificationQuery{
    notifications{
        _id
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
      __typename
      ... on NotoInsert {
        fullDocument {
            _id
            name
            message
            viewed
        }
      }
      ... on NotoDelete {
        documentKey {
            _id
        }
      }
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
    _id: string,
    name?: string,
    message?: string,
    viewed?: Boolean,
}

interface NotoQData {
    notifications: notification[]
}

interface NotoInsert {
    __typename: "NotoInsert",
    fullDocument: notification
}

interface NotoDelete {
    __typename: "NotoDelete",
    documentKey: {
        _id: string,
    }
}

interface NotoSData {
    notificationChange: NotoInsert | NotoDelete
}

export default function notificationBell() {
    const [notifications, setNotifications] = useState<notification[]>([]);
    // console.log(notifications);
    useSubscription<NotoSData>(NotificationSubscription, {
        onSubscriptionData: ({ subscriptionData: data }) => {
            console.log("Got Notification");
            console.log(data);
            if (data.data) {
                const notificationChange = data.data.notificationChange;
                console.log(data.data);
                switch (notificationChange.__typename) {
                    case "NotoInsert":
                        notifications.push(notificationChange.fullDocument)
                        setNotifications(notifications);
                        break;
                    case "NotoDelete":
                        const newNotifications = notifications.filter(noto => noto._id !== notificationChange.documentKey._id);
                        setNotifications(newNotifications);
                        break;
                }
            } else if (data.error) {
                console.error(data.error);
            }
        }
    });
    useQuery<NotoQData>(NotificationsQuery,
        {
            onCompleted: (data) => {
                setNotifications(data.notifications.filter(noto => noto.name && noto.message));
            }
        });
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
    const menuItems = notifications.map(noto => (<Link
        href={`/notifications/${noto._id}`}
        key={noto._id}
    >
        <MenuItem onClick={() => viewNoto({ variables: { id: noto._id } })}>
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
    </Link>));
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