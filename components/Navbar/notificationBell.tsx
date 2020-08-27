import { useState, MouseEvent } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Link from 'next/link';
import { IconButton, MenuItem, Menu, Badge, Typography, Card, CardContent } from '@material-ui/core';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import { getErrorMessage } from '../../lib/form';
import { Notifications as NotificationsIcon } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';

const NotificationsQuery = gql`
query NotificationQuery{
    notifications{
        id,
        name,
        message,
        viewed,
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

interface NotoData {
    notifications: [{
        id: string,
        name: string,
        message: string,
        viewed: Boolean,
    }]
}

export default function notificationBell() {
    const { data: notoData, loading, error } = useQuery<NotoData>(NotificationsQuery);
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

    if (loading) {
        return (<CircularProgress />)
    } else if (error) {
        console.error(error);
        return (<h1>NOTIFICATIONS ERROR:{getErrorMessage(error)}</h1>);
    } else if (notoData) {
        const numberUnread = notoData.notifications.reduce((prev, curr) => curr.viewed ? prev : prev + 1, 0);
        const menuItems = notoData.notifications.reverse().map(noto => (<Link href={`/notifications/${noto.id}`} key={noto.id}>
            <MenuItem>
                <Card className={noto.viewed ? "" : classes.unviewedNotification}>
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
    } else {
        return (<h1>NOTIFICATIONS ERROR: Notification data return undefined</h1>);
    }
}