import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import gql from 'graphql-tag';
import { Container, CircularProgress, Card, CardContent, CardActionArea, CardActions, IconButton, Typography } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Delete as DeleteIcon } from '@material-ui/icons';
import { INotification } from '../../models/Notification';
import Navbar from '../../components/Navbar';

const SingleNotificationQuery = gql`
query SingleNotificationQuery($id:String){
    notificationById(id:$id){
        id,
        name,
        topic,
        message,
        mqttMessage,
        recieved,
        viewed,
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
    })
    if (loading) {
        return (<Container maxWidth="sm"><h1>Loading Notification</h1><CircularProgress /></ Container>);
    }
    else if (data) {
        if (data.notificationById) {
            console.log(data.notificationById);
            const { name, topic, message, mqttMessage, recieved } = data.notificationById;
            console.log(typeof recieved);
            return (<>
                <Navbar />
                <Card>
                    <CardContent>
                        <Typography variant="subtitle1" color="textSecondary" className={classes.halfRow}>Name</Typography>
                        <Typography component="h4" variant="h4" className={classes.halfRow}>{name}</Typography>
                        <Typography variant="subtitle1" color="textSecondary" className={classes.halfRow}>Topic</Typography>
                        <Typography component="h4" variant="h4" className={classes.halfRow}>{topic}</Typography>
                        <Typography variant="subtitle2" color="textSecondary" className={classes.halfRow}>Message</Typography>
                        <Typography component="h5" variant="h5" className={classes.halfRow}>{message}</Typography>
                        <Typography variant="subtitle2" color="textSecondary" className={classes.halfRow}>MQTT Message</Typography>
                        <Typography component="h5" variant="h5">{mqttMessage}</Typography>
                        <Typography variant="subtitle2" color="textSecondary">Time Recieved</Typography>
                        <Typography component="h5" variant="h5">{recieved}</Typography>
                    </CardContent>
                    <CardActions disableSpacing>
                        <IconButton>
                            <DeleteIcon />
                        </IconButton>
                    </CardActions>
                </Card>
            </>);
        } else {
            return (<Container maxWidth="sm"><h2>Sorry, but that notification id isn't valid</h2>Error 404</Container>);
        }
    } else {
        return (<Container maxWidth="sm"><h1>An error has occured</h1>{getErrorMessage(error)}</ Container>);
    }
}

export default aNotification;