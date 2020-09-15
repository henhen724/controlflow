import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import { Dashboard as DashboardIcon } from '@material-ui/icons';
import Link from 'next/link';

export default () => {

    return (<Tooltip title="Toggle Light and Dark Mode">
        <Link href="/dashboard">
            <IconButton color="inherit">
                <DashboardIcon />
            </IconButton>
        </Link>
    </Tooltip>)
}