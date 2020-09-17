import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Brightness2TwoTone, Brightness7TwoTone } from '@material-ui/icons';
import { useChangeTheme } from '../theme';

const brightnessIcon = () => {
    const theme = useTheme();
    const changeTheme = useChangeTheme();
    const handleTogglePaletteType = () => {
        const paletteType = theme.palette.type === 'light' ? 'dark' : 'light';

        changeTheme({ paletteType });
    };

    return (<Tooltip title="Toggle Light and Dark Mode">
        <IconButton
            color="inherit"
            onClick={handleTogglePaletteType}
            aria-label="toggleTheme"
            data-ga-event-category="header"
            data-ga-event-action="dark"
        >
            {theme.palette.type === 'light' ? <Brightness2TwoTone /> : <Brightness7TwoTone />}
        </IconButton>
    </Tooltip>)
}

export default brightnessIcon;