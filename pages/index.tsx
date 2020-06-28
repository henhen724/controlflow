import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import EGraph from '../components/EChartsGraph';

const ViewerQuery = gql`
  query ViewerQuery {
    viewer {
      id
      email
    }
  }
`
// const DataSubscription = gql`
//   subscription getData($topicList: [String]!) {
//     mqttTopics(topics: $topicList) {
//     }
//   }
// `
const Index = () => {
  const router = useRouter()
  const { data, loading, error } = useQuery(ViewerQuery)
  const viewer = data?.viewer
  const shouldRedirect = !(loading || error || viewer)

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/signin')
    }
  }, [shouldRedirect])

  if (error) {
    return <p>{error.message}</p>
  }

  if (viewer) {
    return (
      <div>
        <div className="row">
          <div className="col md-10">
            <EGraph />
          </div>
          <div className="col md-2">
            <button className="btn btn-light">Light</button>
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
