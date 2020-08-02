import { Container, Button } from '@material-ui/core';
import Link from 'next/link';

const IntroPage = () => {
    return (<Container>
        <img src="/favicon.svg" />
        <h1>Welcome to Wi-DAQ</h1>
        <h2>Add description</h2>
        <Link href="/dashboard">
            <Button>Go to my dashboard</Button>
        </Link>
    </Container>)

}

export default IntroPage;