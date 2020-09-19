import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { gql } from '@apollo/client';
import { CircularProgress, Container, List, ListItem, ListItemText } from '@material-ui/core';
import { Notification } from '../../server/models/Notification';
import Navbar from '../../components/Navbar';

const NotificationsQuery = gql`
query NotificationQuery{
    notifications{
        _id,
        name,
        topic,
        message,
        mqttMessage,
        received,
        viewed,
    }
}
`
interface notoQueryRslt {
    notifications: Notification[]
}


const notficationList = () => {
    const { data, loading, error } = useQuery<notoQueryRslt>(NotificationsQuery);
    if (loading) {
        return (<Container maxWidth="sm"><h1>Loading Notifications</h1><CircularProgress /></ Container>);
    }
    else if (data) {
        const notficationList = data.notifications.reverse().map(notofication => {
            return (<Link href={`/notifications/${notofication._id}`}><ListItem>
                <ListItemText primary={notofication.name} secondary={notofication.message} />
            </ListItem></Link>)
        });
        return (<>
            <Navbar />
            <Container maxWidth="sm">
                <List>
                    {notficationList}
                </List>
            </Container>
        </>);
    } else {
        return (<Container maxWidth="sm"><h1>An error has occured</h1>{error}</ Container>);
    }
}

export default notficationList;