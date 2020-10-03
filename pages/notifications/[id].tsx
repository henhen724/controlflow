import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { gql } from '@apollo/client';
import { Container, CircularProgress, Paper, Grid, IconButton, Typography } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Delete as DeleteIcon, LocalConvenienceStoreOutlined } from '@material-ui/icons';
import Navbar from '../../components/Navbar';
import { getErrorMessage } from '../../components/errorFormating';
import moment from 'moment-timezone';

const SingleNotificationQuery = gql`
query SingleNotificationQuery($id:String!){
    notificationById(id:$id){
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

const DeleteNotification = gql`
mutation DeleteNotification($id:String!) {
    deleteNotification(id:$id) {
        success
    }
}
`

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        contentRoot: {
            display: "inline",
        },
        halfRow: {
            width: "50%"
        }
    }),
);


const aNotification = () => {
    const router = useRouter();
    const classes = useStyles();
    const { id } = router.query;

    const { data, loading, error } = useQuery(SingleNotificationQuery, {
        variables: {
            id
        }
    });
    const [deleteNoto] = useMutation(DeleteNotification, {
        variables: {
            id
        }
    });

    const handleDeleteClick = () => {
        deleteNoto();
        router.push("/dashboard");
    }

    if (loading) {
        return (<Container maxWidth="sm"><h1>Loading Notification</h1><CircularProgress /></ Container>);
    } else if (error) {
        return (<Container maxWidth="sm"><h1>An error has occured</h1>{getErrorMessage(error)}</ Container>);
    } else if (data) {
        if (data.notificationById) {
            const { name, topic, message, mqttMessage, received } = data.notificationById;
            return (<>
                <Navbar />
                <Paper>
                    <Grid>
                        <Typography variant="subtitle1" color="textSecondary">Name</Typography>
                        <Typography component="h4" variant="h4">{name}</Typography>
                        <Typography variant="subtitle1" color="textSecondary">Topic</Typography>
                        <Typography component="h4" variant="h4">{topic}</Typography>
                        <Typography variant="subtitle2" color="textSecondary">Message</Typography>
                        <Typography component="h5" variant="h5">{message}</Typography>
                        <Typography variant="subtitle2" color="textSecondary">MQTT Message</Typography>
                        <Typography component="h5" variant="h5">{mqttMessage}</Typography>
                        <Typography variant="subtitle2" color="textSecondary">Time Received</Typography>
                        <Typography component="h5" variant="h5">{moment.tz(received, moment.tz.guess()).format("h:mm:ss a z on MM/DD/YYYY")}</Typography>
                        <IconButton onClick={handleDeleteClick}>
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                </Paper>
            </>);
        } else {
            return (<Container maxWidth="sm"><h2>Sorry, but that notification id isn't valid</h2>Error 404</Container>);
        }
    } else {
        return <div />;
    }
}

export default aNotification;