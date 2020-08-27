import React from 'react';
import { AppBar, Badge, Toolbar, Typography, IconButton, Tooltip } from '@material-ui/core';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import { Notifications as NotificationsIcon, Brightness2TwoTone, Brightness7TwoTone } from '@material-ui/icons';
import { useChangeTheme } from '../theme';

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
    const theme = useTheme();

    const changeTheme = useChangeTheme();
    const handleTogglePaletteType = () => {
        const paletteType = theme.palette.type === 'light' ? 'dark' : 'light';

        changeTheme({ paletteType });
    };

    return (
        <div className={classes.grow}>
            <AppBar position="static">
                <Toolbar>
                    <img src="/images/SecondDraft.svg" className={classes.svgRoot} />
                    <Typography className={classes.title} variant="h5" noWrap>
                        Wi-DAQ
                    </Typography>
                    <div className={classes.grow} />
                    <Tooltip title="Toggle Light and Dark Mode" className={classes.sectionDesktop}>
                        <IconButton
                            color="inherit"
                            onClick={handleTogglePaletteType}
                            aria-label="toggleTheme"
                            data-ga-event-category="header"
                            data-ga-event-action="dark"
                        >
                            {theme.palette.type === 'light' ? <Brightness2TwoTone /> : <Brightness7TwoTone />}
                        </IconButton>
                    </Tooltip>
                    <UserProfileMenu wraperClass={classes.sectionDesktop} />
                </Toolbar>
            </AppBar>
        </div>
    );
}