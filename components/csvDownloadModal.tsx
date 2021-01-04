import { Button, CircularProgress, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { getErrorMessage } from './errorFormating';
import download from 'downloadjs';
import { Parser } from 'json2csv';
import { ApolloError } from '@apollo/client';

interface csvDownloadProps {
    topic: string | null;
    setTopic: (topic: string | null) => void;
    clearDownloadData: () => void;
    data: Object[] | undefined;
    loading: boolean;
    error?: ApolloError;
    progress?: number;
}

const flattenObject = (ob: any) => {
    var toReturn: any = {};

    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if ((typeof ob[i]) == 'object' && ob[i] !== null) {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

const csvDownloadModal = (props: csvDownloadProps) => {
    console.log(props);
    if (!props.topic) {
        return <div>
            Internal Error: CSV Download recieved no topic.
        </div>
    }
    if (props.loading) {
        return <CircularProgress />
    } else if (props.error) {
        return <div>{getErrorMessage(props.error)}</div>
    } else {
        const rowData = props.data!.map(packet => flattenObject(packet));
        const onDownloadModalFinish = (accepted: boolean) => {
            if (accepted && props.topic) {
                const parser = new Parser();
                download(parser.parse(rowData), `${props.topic}.csv`);
            }
            props.setTopic(null);
            props.clearDownloadData();
        }
        if (rowData.length === 0) {
            return <div>The ${props.topic} buffer is empty.</div>
        } else {
            const colomnHeaders = Object.keys(rowData[0]);
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
                                                {colomnHeaders.map(key => {
                                                    if (typeof data[key] !== 'object')
                                                        return <TableCell>{data[key]}</TableCell>
                                                })}
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