import { useState, useCallback } from 'react';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import MaterialTable, { Column, MTableToolbar } from 'material-table';
import { Button, CircularProgress, Container, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@material-ui/core';
import { Replay as ReplayIcon } from '@material-ui/icons';

import { getErrorMessage } from '../lib/errorFormating';
import { ITopic } from '../models/TopicBufferInfo';

const BufferQuery = gql`
query BuffersQuery {
    runningBuffers {
        topic
        expires
        experationTime
        sizeLimited
        maxSize
        currSize
    }
}
`
const RecordTopic = gql`
mutation RecordTopic($input: RecordTopicInput!) {
  recordTopic(input: $input) {
    success
  }
}
`
const DeleteTopic = gql`
mutation DeleteTopicBuffer($topic:String!) {
    deleteTopicBuffer(topic:$topic) {
        success
    }
}
`

interface BufferQuery {
    runningBuffers: ITopic[]
}

interface TableState {
    columns: Array<Column<ITopic>>,
    data: ITopic[],
}

interface BufferPacket {
    topic: string,
    experationTime?: number,
    maxSize?: number,
}

interface SuccessBoolean {
    success: Boolean
}

const Buffers = () => {
    // Queries
    const { loading: bufferLoading, error: bufferError, refetch: _refetch } = useQuery<BufferQuery>(BufferQuery, {
        onCompleted: (queryData: BufferQuery) => {
            const buffers = queryData.runningBuffers ? queryData.runningBuffers : [];
            setState({ columns: state.columns, data: buffers });
        }
    });
    const refetch = useCallback(() => {
        setTimeout(() => _refetch({
            onCompleted: (queryData: BufferQuery) => {
                const buffers = queryData.runningBuffers ? queryData.runningBuffers : [];
                setState({ columns: state.columns, data: buffers });
            },
        }), 0)
    }, [_refetch]); //This avoids an error where nextJS unmounts the component and refetch becomes undefined.

    // Mutations
    const [sendTopic] = useMutation<SuccessBoolean, { input: BufferPacket }>(RecordTopic);
    const [deleteTopic] = useMutation<SuccessBoolean, { topic: string }>(DeleteTopic);

    // Page state
    const [state, setState] = useState<TableState>({
        columns: [
            { title: 'Topic Name', field: 'topic', type: 'string', editable: 'onAdd' },
            { title: 'Current Size', field: 'currSize', type: 'numeric', editable: 'never' },
            { title: 'Packets Expire (T/F)', field: 'expires', type: 'boolean', editable: 'always' },
            { title: 'Experation Time (ms)', field: 'experationTime', type: 'numeric', editable: 'always' },
            { title: 'Is Memory Limited (T/F)', field: 'sizeLimited', type: 'boolean', editable: 'always' },
            { title: 'Memory Limit (bytes)', field: 'maxSize', type: 'numeric', editable: 'always' },
        ],
        data: [],
    })
    const [isModalOpen, setModelOpen] = useState<boolean>(false);
    const [topicToDelete, setTopicToDelete] = useState<string | null>(null);

    const onModalFinish = (accepted: boolean) => {
        setModelOpen(false);
        console.log(`Accepted: ${accepted}\nTopic to Delete: ${topicToDelete}`);
        if (accepted && topicToDelete) {
            setState((prevState) => {
                const data = prevState.data.filter((topicObj: ITopic) => topicObj.topic !== topicToDelete);
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
        return (<h1>Buffer Query Error: {bufferError}</h1>)
    } else {
        return (
            <div>
                <Container>
                    <MaterialTable title="Data Buffers" columns={state.columns} data={state.data}
                        components={{
                            Toolbar: props => (<div>
                                <MTableToolbar {...props} />
                                <IconButton onClick={refetch}><ReplayIcon /></IconButton>
                            </div>),
                        }}
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
                                    variables: {
                                        input
                                    }
                                }).then(success => resolve(success)).catch(err => console.error(err));
                            }),
                            onRowUpdate: (newData, oldData) => new Promise((resolve) => {
                                setState((prevState) => {
                                    const index = prevState.data.findIndex((topicObj: ITopic) => topicObj.topic === newData.topic);
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
                                    variables: {
                                        input
                                    }
                                }).then(success => resolve(success));
                            }),
                            onRowDelete: (oldData) => new Promise((resolve) => {
                                setTopicToDelete(oldData.topic);
                                setModelOpen(true);
                                resolve();
                            })
                        }} />
                    <Dialog
                        open={isModalOpen}
                        keepMounted
                        onClose={() => onModalFinish(false)}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle id="alert-dialog-slide-title">{`WARNING: Deleting ${topicToDelete} Data Buffer`}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-slide-description">
                                All data currently in this buffer will be lost and unrecoverable. Are sure you want to do this?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => onModalFinish(false)} color="primary">
                                Disagree
                            </Button>
                            <Button onClick={() => onModalFinish(true)} color="primary">
                                Agree
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </div>
        )
    }
}

export default Buffers;