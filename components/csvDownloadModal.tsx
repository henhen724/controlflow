import { DataQuery } from './apollo/Data';
import { Button, CircularProgress, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { getErrorMessage } from './errorFormating';

interface csvDownloadProps {
    topic: string | null;
    setTopic: (topic: string | null) => void;
}

const csvDownloadModal = (props: csvDownloadProps) => {

    const onDownloadModalFinish = (accepted: boolean) => {
        props.setTopic(null);
        if (accepted && props.topic) {

        } else {
            props.setTopic(null);
        }
    }

    if (!props.topic) {
        return <div>
            Internal Error: CSV Download recieved no topic.
        </div>
    }
    const { data, loading, error } = DataQuery({ variables: { topic: props.topic } });
    if (loading) {
        return <CircularProgress />
    } else if (error) {
        return <div>{getErrorMessage(error)}</div>
    } else {
        if (data?.topicBuffer.length === 0) {
            return <div>The ${props.topic} buffer is empty.</div>
        } else {
            console.log(data?.topicBuffer)
            const colomnHeaders = Object.keys(data?.topicBuffer[0].data!);
            return (<>
                <DialogTitle id="download-modal-title">Downloading {props.topic}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="download-modal-description">
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {colomnHeaders.map(key => <TableCell>{key}</TableCell>)}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data?.topicBuffer.map(packet => {
                                        return (
                                            <TableRow>
                                                {colomnHeaders.map(key => <TableCell>{packet.data[key]}</TableCell>)}
                                            </TableRow>);
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onDownloadModalFinish(false)} color="primary">
                        Disagree
                    </Button>
                    <Button onClick={() => onDownloadModalFinish(true)} color="primary">
                        Agree
                    </Button>
                </DialogActions>
            </>)
        }
    }
}

export default csvDownloadModal;