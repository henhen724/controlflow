import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { getErrorMessage } from '../errorFormating';
import { CircularProgress } from '@material-ui/core';

import BrightnessIcon from './brightnessIcon';
import NotificationBell from './notificationBell';
import UserAvatar from './userAvatar';

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

    if (loading) {
        return (<>
            <BrightnessIcon />
            <CircularProgress />
        </>)
    } else if (error) {
        console.error(error);
        return (<h1>PROFILE ERROR:{getErrorMessage(error)}</h1>);
    } else if (!viewerData.viewer) {
        return (<>
            <BrightnessIcon />
            <UserAvatar />
        </>);
    } else {
        return (<>
            <BrightnessIcon />
            <NotificationBell />
            <UserAvatar email={viewerData.viewer.email} />
        </>);
    }
}