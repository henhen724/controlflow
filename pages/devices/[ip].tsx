import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { gql } from '@apollo/client';
import { Container, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Navbar from '../../components/Navbar';
import { getErrorMessage } from '../../components/errorFormating';

import DisplaySchema from '../../components/DeviceNetwork/DisplaySchema';

const SingleDeviceQuery = gql`
query GetDevice($ip:String!) {
  deviceByIp(ip:$ip){
    uri
    deviceSchema
    name
    osName
    platform
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


const aDevice = () => {
    const router = useRouter();
    const classes = useStyles();
    console.log(router.query);
    const { ip } = router.query;

    console.log(ip);

    const { data, loading, error } = useQuery(SingleDeviceQuery, {
        variables: {
            ip
        }
    });

    if (loading) {
        return (<Container maxWidth="sm"><h1>Loading Device Info</h1><CircularProgress /></ Container>);
    } else if (error) {
        console.error(error);
        return (<Container maxWidth="sm"><h1>An error has occured</h1>{getErrorMessage(error)}</ Container>);
    } else if (data) {
        if (data.deviceByIp) {
            const { deviceSchema, name, osName } = data.deviceByIp;
            return (<>
                <Navbar />
                <Container>
                    <Typography component="h1" variant="h3">{name}</Typography>
                    <Typography component="h3" variant="caption" gutterBottom>Operating System: {osName}</Typography>
                    <DisplaySchema schema={deviceSchema} />
                </Container>
            </>);
        } else {
            return (<Container maxWidth="sm"><h2>Sorry, but no know device has that IP.</h2>Error 404</Container>);
        }
    } else {
        return <div />;
    }
}

export default aDevice;