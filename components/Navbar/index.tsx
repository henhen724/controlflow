import React from 'react';
import { AppBar, Badge, Toolbar, Typography, IconButton } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Notifications as NotificationsIcon } from '@material-ui/icons';

import UserProfileMenu from './userProfileMenu';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        svgRoot: {
            height: theme.spacing(12),
            width: theme.spacing(7),
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




export default function navbar() {
    const classes = useStyles();


    return (
        <div className={classes.grow}>
            <AppBar position="static">
                <Toolbar>
                    <img src="/images/SecondDraft.svg" className={classes.svgRoot} />
                    <Typography className={classes.title} variant="h5" noWrap>
                        Wi-DAQ
                    </Typography>
                    <div className={classes.grow} />
                    <div className={classes.sectionDesktop}>
                        <IconButton aria-label="show 17 new notifications" color="inherit">
                            <Badge badgeContent={0} color="secondary">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <UserProfileMenu />
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
}