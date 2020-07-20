import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import Navabar from '../components/navbar';
import MaterialTable, { Column } from 'material-table';
import { makeStyles } from '@material-ui/core/styles';

const ViewerQuery = gql`
  query ViewerQuery {
    viewer {
      id
      email
    }
  }
`
const BufferQuery = gql`
query BuffersQuery {
    runningBuffers {
        topic
        experationTime
    }
}
`
const RecordTopic = gql`
mutation RecordTopic($topic:String, $experationTime:Int) {
    recordTopic(topic:$topic, experationTime:$experationTime){
        success
    }
}
`
interface bufferInfo {
    topic: string,
    experationTime: number,
}

interface BufferQuery {
    runningBuffers: bufferInfo[]
}

interface TableState {
    columns: Array<Column<bufferInfo>>,
    data: bufferInfo[],
}

const BufferPage = () => {
    const router = useRouter()
    const { data: viewerData, loading, error } = useQuery(ViewerQuery);
    const { data: bufferData, loading: bufferLoading, error: bufferError } = useQuery<BufferQuery>(BufferQuery);
    const viewer = viewerData?.viewer;
    const buffers = bufferData?.runningBuffers ? bufferData?.runningBuffers : [];
    const shouldRedirect = !(loading || error || viewer);

    const [state, setState] = useState<TableState>({
        columns: [
            { title: 'Topic Name', field: 'topic', type: 'string' },
            { title: 'Experation Time', field: 'experationTime', type: 'numeric' },
            { title: 'TEST', field: 'test', type: "string" }
        ],
        data: buffers,
    })

    useEffect(() => {
        if (shouldRedirect) {
            router.push('/signin')
        }
    }, [shouldRedirect])

    if (error) {
        return <p>{error.message}</p>
    }

    if (viewer && !loading) {
        return (
            <div>
                <Navabar email={viewer.email} />
                <MaterialTable title="Data Buffers" columns={state.columns} data={state.data} editable={{
                    onRowAdd: (newData) => new Promise((resolve) => {

                    })
                }} />
            </div>
        )
    }

    return <p>Loading...</p>
}

export default BufferPage;