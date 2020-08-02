import React from 'react';
import Link from 'next/link';
import { AppBar, Badge, Toolbar, Typography, IconButton, MenuItem, Menu, Button, Tabs, Tab } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { AccountCircle, Notifications as NotificationsIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        svgRoot: {
            height: theme.spacing(10),
            width: theme.spacing(6),
            paddingRight: theme.spacing(1),
        },
        grow: {
            flexGrow: 1,
        },
        menuButton: {
            marginRight: theme.spacing(2),

        },
        title: {
            display: 'none',
            [theme.breakpoints.up('sm')]: {
                display: 'block',
            },
        },
        inputRoot: {
            color: 'inherit',
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '20ch',
            },
        },
        sectionDesktop: {
            display: 'none',
            [theme.breakpoints.up('md')]: {
                display: 'flex',
            },
        },
    }),
);

const a11yProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


interface NavbarProps {
    email: string,
    currTab: number,
    changeTab: (newTab: number) => void,
}

export default function navbar(props: NavbarProps) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const isMenuOpen = Boolean(anchorEl);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const menuId = 'primary-search-account-menu';
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
            <MenuItem>Your signed in as {props.email}</MenuItem>
            <MenuItem onClick={handleMenuClose}>My account</MenuItem>
            <Link href={'/signout'}>
                <MenuItem onClick={handleMenuClose} button={true}>Sign Out</MenuItem>
            </Link>
        </Menu>
    );

    return (
        <div className={classes.grow}>
            <AppBar position="static">
                <Toolbar>
                    <img src="images/SecondDraft.svg" className={classes.svgRoot} />
                    <Typography className={classes.title} variant="h5" noWrap>
                        Wi-DAQ
                    </Typography>
                    <div className={classes.grow} />
                    <Tabs value={props.currTab} onChange={(e, val) => props.changeTab(val)} aria-label="simple tabs example">
                        <Tab label="Dashboard" {...a11yProps(0)} />
                        <Tab label="Data Buffers" {...a11yProps(1)} />
                    </Tabs>
                    <div className={classes.grow} />
                    <div className={classes.sectionDesktop}>
                        <IconButton aria-label="show 17 new notifications" color="inherit">
                            <Badge badgeContent={0} color="secondary">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
            {renderMenu}
        </div>
    );
}