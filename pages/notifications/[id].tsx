import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import gql from 'graphql-tag';
import { CircularProgress, Container, Grid, Paper } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
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
        root: {
            flexGrow: 1,
        },
        headingPaper: {
            padding: theme.spacing(0),
            textAlign: 'center',
            color: theme.palette.text.secondary,
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: 'center',
            color: theme.palette.text.secondary,
        },
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
                <Paper className={classes.paper}><Grid container>
                    <Grid item xs={6}>{name}</Grid><Grid item xs={6}>Topic: {topic}</Grid>
                    <Grid item xs={12}>{message}</Grid>
                    <Grid item xs={12}>{mqttMessage}</Grid>
                    <Grid item xs={12}>{recieved} </Grid>
                </Grid></Paper >
            </>);
        } else {
            return (<Container maxWidth="sm"><h2>Sorry, but that notification id isn't valid</h2>Error 404</Container>);
        }
    } else {
        return (<Container maxWidth="sm"><h1>An error has occured</h1>{error}</ Container>);
    }
}

export default aNotification;