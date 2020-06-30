import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import gql from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import Graph from '../components/RechartsGraph';

const ViewerQuery = gql`
  query ViewerQuery {
    viewer {
      id
      email
    }
  }
`
const DataSubscription = gql`
  subscription getData($topicList: [String]!) {
    mqttTopics(topics: $topicList) {
      topic
    }
  }
`
const Index = () => {
  const router = useRouter()
  const [lightOn, setLight] = useState<boolean>(true);
  const [graphData, setGraphData] = useState<number[]>([]);
  const { data: viewerData, loading, error } = useQuery(ViewerQuery);
  const { data: pmtData, loading: pmtLoading, error: pmtError } = useSubscription(DataSubscription);
  const viewer = viewerData?.viewer;
  const shouldRedirect = !(loading || error || viewer);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/signin')
    } else {

    }
  }, [shouldRedirect])

  if (error) {
    return <p>{error.message}</p>
  }

  if (viewer) {
    return (
      <div>
        <div className="row">
          <div className="col md-9">
            <Graph data={[{ name: "A", pv: 1 }, { name: "B", pv: 2 }]} xProperty="name" yProperty="pv" />
          </div>
          <div className="col md-2">
            <div className="checkbox">
              <label>
                <input type="checkbox" data-toggle="toggle" checked={lightOn} onClick={() => setLight(!lightOn)} />
              Light Switch
              </label>
            </div>
          </div>
        </div>
        <footer>
          You're signed in as {viewer.email}. {' '}
          <Link href="/signout">
            <a className="btn btn-info mt-2 mb-2">Sign Out</a>
          </Link>
        </footer>
      </div>
    )
  }

  return <p>Loading...</p>
}

export default Index
