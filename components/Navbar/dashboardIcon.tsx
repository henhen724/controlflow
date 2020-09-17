import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import { Dashboard as DashboardIcon } from '@material-ui/icons';
import Link from 'next/link';

const DashIcon = () => {

    return (
        <Link href="/dashboard">
            <Tooltip title="Toggle Light and Dark Mode">
                <IconButton color="inherit">
                    <DashboardIcon />
                </IconButton>
            </Tooltip>
        </Link >);
}

export default DashIcon;