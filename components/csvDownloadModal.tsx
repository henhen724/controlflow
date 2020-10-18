import { DataQuery } from './apollo/Data';
import { Button, CircularProgress, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { getErrorMessage } from './errorFormating';
import download from 'downloadjs';
import { Parser } from 'json2csv';

interface csvDownloadProps {
    topic: string | null;
    setTopic: (topic: string | null) => void;
}

const csvDownloadModal = (props: csvDownloadProps) => {
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
        const rowData = data?.topicBuffer.map(packet => packet.data)!;
        const onDownloadModalFinish = (accepted: boolean) => {
            if (accepted && props.topic) {
                const parser = new Parser();
                download(parser.parse(rowData), `${props.topic}.csv`);
            }
            props.setTopic(null);
        }
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
                                    {rowData.map(data => {
                                        return (
                                            <TableRow>
                                                {colomnHeaders.map(key => <TableCell>{data[key]}</TableCell>)}
                                            </TableRow>);
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onDownloadModalFinish(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => onDownloadModalFinish(true)} color="primary">
                        Save CSV
                    </Button>
                </DialogActions>
            </>)
        }
    }
}

export default csvDownloadModal;