import { useRouter } from 'next/router';
import { TopicInfo } from '../../components/apollo/Topics';

interface TopicState {
    topicInfo: TopicInfo,

}

const topicPage = () => {
    const router = useRouter();
    const { topic } = router.query;

    return <div>{topic}</div>
}

export default topicPage;