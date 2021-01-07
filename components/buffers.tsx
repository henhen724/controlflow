import { useState, useCallback } from 'react';
import MaterialTable, { Column } from 'material-table';
import { ApolloError } from '@apollo/client';
import { Button, CircularProgress, Container, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@material-ui/core';
import { Replay as ReplayIcon, GetApp as GetAppIcon } from '@material-ui/icons';

import { getErrorMessage } from './errorFormating';
import { LazyDataQuery } from './apollo/Data';
import CsvDownloadModal from './csvDownloadModal';
import { formatByteSize } from './lib/formatByteSize';

import { BufferQuery, BufferQueryRslt, BufferPacket, RecordTopic, DeleteTopic, BufferInfo } from "./apollo/Buffers";

interface TableState {
    columns: Array<Column<BufferInfo>>,
    data: BufferInfo[],
}

const Buffers = () => {
    // Page state
    const [state, setState] = useState<TableState>({
        columns: [
            { title: 'Topic Name', field: 'topic', type: 'string', editable: 'onAdd' },
            { title: 'Current Size', field: 'currSize', render: rowData => formatByteSize(rowData.currSize) },
            { title: 'Packets Expire (T/F)', field: 'expires', type: 'boolean', editable: 'always' },
            { title: 'Experation Time (ms)', field: 'experationTime', type: 'numeric', editable: 'always' },
            { title: 'Is Memory Limited (T/F)', field: 'sizeLimited', type: 'boolean', editable: 'always' },
            { title: 'Memory Limit', field: 'maxSize', type: 'numeric', editable: 'always', render: rowData => formatByteSize(rowData.maxSize) },
        ],
        data: [],
    })

    const [topicToDelete, setTopicToDelete] = useState<string | null>(null);
    const [topicToDownload, setTopicToDownload] = useState<string | null>(null);

    const { loading: bufferLoading, error: bufferError, refetch: _refetch } = BufferQuery({
        onCompleted: (queryData) => {
            const buffers = queryData.runningBuffers ? queryData.runningBuffers.map(buf => Object.assign({}, buf)) : [];
            setState({ columns: state.columns, data: buffers });
        }
    });
    const refetch = useCallback(() => {
        setTimeout(() => _refetch({
            onCompleted: (queryData: BufferQueryRslt) => {
                const buffers = queryData.runningBuffers ? queryData.runningBuffers.map(buf => Object.assign({}, buf)) : [];
                setState({ columns: state.columns, data: buffers });
            },
        }), 0)
    }, [_refetch]); //This avoids an error where nextJS unmounts the component and refetch becomes undefined.
    const [sendTopic] = RecordTopic();
    const [deleteTopic] = DeleteTopic();

    const [getBufferData, { data: downloadData, error: downloadError, loading: downloadLoading }] = LazyDataQuery({
        variables: {
            topic: topicToDownload!
        }
    });
    const csvData = downloadData?.topicBuffer.map(packet => packet.data);


    const onDeleteModalFinish = (accepted: boolean) => {
        setTopicToDelete(null);
        console.log(`Accepted: ${accepted}\nTopic to Delete: ${topicToDelete}`);
        if (accepted && topicToDelete) {
            setState((prevState) => {
                const data = prevState.data.filter((topicObj: BufferInfo) => topicObj.topic !== topicToDelete);
                return { ...prevState, data };
            });
            deleteTopic({
                variables: {
                    topic: topicToDelete
                }
            }).then(success => {
                setTopicToDelete(null);
            }).catch(err => getErrorMessage(err))
        } else {
            setTopicToDelete(null);
        }
    }

    // Render Table
    if (bufferLoading) {
        return (<Container maxWidth="sm"><h1>Buffer Info Loading</h1><CircularProgress /></ Container>)
    } else if (bufferError) {
        return (<h1>Buffer Query Error: {getErrorMessage(bufferError)}</h1>)
    } else {
        return (
            <div>
                <Container>
                    <MaterialTable title="Rolling Buffers" columns={state.columns} data={state.data}
                        actions={[
                            {
                                icon: () => <GetAppIcon />,
                                tooltip: 'Download Data',
                                onClick: (event, rowData) => {
                                    if (!Array.isArray(rowData)) {
                                        setTopicToDownload(rowData.topic);
                                        getBufferData();
                                    }
                                }
                            },
                            {
                                icon: () => <ReplayIcon />,
                                tooltip: 'Refresh Table',
                                onClick: refetch,
                                isFreeAction: true
                            }
                        ]}
                        editable={{
                            onRowAdd: (newData) => new Promise((resolve) => {
                                setState((prevState) => {
                                    const data = [...prevState.data];
                                    data.push(newData);
                                    return { ...prevState, data };
                                });
                                var input = {
                                    topic: newData.topic
                                } as BufferPacket;
                                newData.expires = !!newData.expires;
                                newData.sizeLimited = !!newData.sizeLimited;
                                if (newData.expires) {
                                    input.experationTime = newData.experationTime;
                                }
                                if (newData.sizeLimited) {
                                    input.maxSize = newData.maxSize;
                                }
                                console.log(`Sending topic record with`, input);
                                sendTopic({
                                    variables: input
                                }).then(success => resolve(success)).catch(err => console.error(err));
                            }),
                            onRowUpdate: (newData, oldData) => new Promise((resolve) => {
                                setState((prevState) => {
                                    const index = prevState.data.findIndex((topicObj: BufferInfo) => topicObj.topic === newData.topic);
                                    const data = [...prevState.data]
                                    data[index] = newData;
                                    return { ...prevState, data };
                                });
                                var input = {
                                    topic: newData.topic
                                } as BufferPacket;
                                if (newData.expires) {
                                    input.experationTime = newData.experationTime;
                                }
                                if (newData.sizeLimited) {
                                    input.maxSize = newData.maxSize;
                                }
                                sendTopic({
                                    variables: input
                                }).then(success => resolve(success));
                            }),
                            onRowDelete: (oldData) => new Promise((resolve) => {
                                setTopicToDelete(oldData.topic);
                                resolve(true);
                            })
                        }} />
                    <Dialog
                        open={!!topicToDelete}
                        keepMounted
                        onClose={() => onDeleteModalFinish(false)}
                        aria-labelledby="delete-modal-title"
                        aria-describedby="delete-modal-description"
                    >
                        <DialogTitle id="delete-modal-title">{`WARNING: Deleting ${topicToDelete} Data Buffer`}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="delete-modal-description">
                                All data currently in this buffer will be lost and unrecoverable. Are sure you want to do this?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => onDeleteModalFinish(false)} color="primary">
                                Disagree
                            </Button>
                            <Button onClick={() => onDeleteModalFinish(true)} color="primary">
                                Agree
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        open={!!topicToDownload}
                        keepMounted
                        onClose={() => setTopicToDownload(null)}
                        aria-labelledby="download-modal-title"
                        aria-describedby="download-modal-description"
                    >
                        <CsvDownloadModal topic={topicToDownload} data={csvData} error={downloadError} loading={downloadLoading} setTopic={setTopicToDownload} />
                    </Dialog>
                </Container>
            </div>
        )
    }
}

export default Buffers;