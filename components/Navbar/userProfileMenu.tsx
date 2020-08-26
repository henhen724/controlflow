import { useState, MouseEvent } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Link from 'next/link';
import { IconButton, MenuItem, Menu } from '@material-ui/core';
import { getErrorMessage } from '../../lib/form';
import { AccountCircle } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';

const NavViewerQuery = gql`
  query NavViewerQuery {
    viewer {
        id
        email
    }
  }
`

export default function userProfileMenu() {
    const { data: viewerData, loading, error } = useQuery(NavViewerQuery);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const isMenuOpen = Boolean(anchorEl);

    const handleProfileMenuOpen = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const menuId = 'primary-search-account-menu';

    if (loading) {
        return (<CircularProgress />)
    } else if (error) {
        console.error(error);
        return (<h1>PROFILE ERROR:{getErrorMessage(error)}</h1>);
    } else if (!viewerData.viewer) {
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
                <MenuItem>You are not signed in.</MenuItem>
                <Link href={'/signin'}>
                    <MenuItem onClick={handleMenuClose} button={true}>Sign In</MenuItem>
                </Link>
            </Menu>
        );
        return (<>
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
            {renderMenu}</>);
    } else {
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
                <MenuItem>Your signed in as {viewerData.viewer.email}</MenuItem>
                <MenuItem onClick={handleMenuClose}>My account</MenuItem>
                <Link href={'/signout'}>
                    <MenuItem onClick={handleMenuClose} button={true}>Sign Out</MenuItem>
                </Link>
            </Menu>
        );
        return (<>
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
            {renderMenu}</>)
    }
}