import { useState, useCallback } from 'react';
import MaterialTable, { Column } from 'material-table';
import { Button, CircularProgress, Container, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@material-ui/core';
import { Replay as ReplayIcon, GetApp as GetAppIcon } from '@material-ui/icons';

import { getErrorMessage } from './errorFormating';
import { TopicArchive } from '../server/models/TopicArchive';

import { ArchiveInfoRslt, ArchiveQuery, ArchiveTopic, DeleteTopicArchive } from "./apollo/Archives";
import { fullArchiveDownload } from './apollo/Archives';
import CsvDownloadModal from './csvDownloadModal';

interface TableState {
    columns: Array<Column<TopicArchive>>,
    data: TopicArchive[],
}

const Archives = () => {
    // Page state
    const [state, setState] = useState<TableState>({
        columns: [
            { title: 'Topic Name', field: 'topic', type: 'string', editable: 'onAdd' },
        ],
        data: [],
    })

    const [topicToDelete, setTopicToDelete] = useState<string | null>(null);

    const [topicToDownload, setTopicToDownload] = useState<string | null>(null);

    const [getArchiveData, clearDownloadData, { data: downloadData, loading: downloadLoading, error: downloadError }] = fullArchiveDownload({
        variables: { topic: topicToDownload! }
    })
    // let csvData;
    // if (downloadData) {
    //     console.log(downloadData)
    //     csvData = downloadData.archiveData.edges.map(edge => edge.node.data);
    // }

    const { loading, error, refetch: _refetch } = ArchiveQuery({
        onCompleted: (queryData) => {
            const buffers = queryData.runningArchives ? queryData.runningArchives.map(buf => Object.assign({}, buf)) : [];
            setState({ columns: state.columns, data: buffers });
        }
    });
    const refetch = useCallback(() => {
        setTimeout(() => _refetch({
            onCompleted: (queryData: ArchiveInfoRslt) => {
                const buffers = queryData.runningArchives ? queryData.runningArchives.map(buf => Object.assign({}, buf)) : [];
                setState({ columns: state.columns, data: buffers });
            },
        }), 0)
    }, [_refetch]); //This avoids an error where nextJS unmounts the component and refetch becomes undefined.
    const [sendTopic] = ArchiveTopic();
    const [deleteTopic] = DeleteTopicArchive();


    const onDeleteModalFinish = (accepted: boolean) => {
        setTopicToDelete(null);
        console.log(`Accepted: ${accepted}\nTopic to Delete: ${topicToDelete}`);
        if (accepted && topicToDelete) {
            setState((prevState) => {
                const data = prevState.data.filter((topicObj: TopicArchive) => topicObj.topic !== topicToDelete);
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
    if (loading) {
        return (<Container maxWidth="sm"><h1>Archive Info Loading</h1><CircularProgress /></ Container>)
    } else if (error) {
        return (<h1>Archive Query Error: {getErrorMessage(error)}</h1>)
    } else {
        return (
            <div>
                <Container>
                    <MaterialTable title="Topic Archives" columns={state.columns} data={state.data}
                        actions={[
                            {
                                icon: () => <GetAppIcon />,
                                tooltip: 'Download Data',
                                onClick: (event, rowData) => {
                                    if (!Array.isArray(rowData)) {
                                        setTopicToDownload(rowData.topic);
                                        getArchiveData({ variables: { topic: rowData.topic } });
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
                                const input = {
                                    topic: newData.topic
                                };
                                console.log(`Sending topic record with`, input);
                                sendTopic({
                                    variables: input
                                }).then(success => resolve(success)).catch(err => console.error(err));
                            }),
                            onRowUpdate: (newData, oldData) => new Promise((resolve) => {
                                setState((prevState) => {
                                    const index = prevState.data.findIndex((topicObj) => topicObj.topic === newData.topic);
                                    const data = [...prevState.data]
                                    data[index] = newData;
                                    return { ...prevState, data };
                                });
                                var input = {
                                    topic: newData.topic
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
                        <DialogTitle id="delete-modal-title">{`WARNING: Deleting ${topicToDelete} Data Archive`}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="delete-modal-description">
                                All data currently in this Archive will be lost and unrecoverable. Are sure you want to do this?
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
                        <CsvDownloadModal data={downloadData} error={downloadError} loading={downloadLoading} topic={topicToDownload} setTopic={setTopicToDownload} clearDownloadData={clearDownloadData} />
                    </Dialog>
                </Container>
            </div>
        )
    }
}

export default Archives;