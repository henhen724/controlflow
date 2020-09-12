import { Container, Button } from '@material-ui/core';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const IntroPage = () => {
    return (<div>
        <Navbar />
        <Container>
            <h1>Welcome to Wi-DAQ</h1>
            <h2>Add description</h2>
            <Link href="/dashboard">
                <Button>Go to my dashboard</Button>
            </Link>
        </Container>
    </div>);

}

export default IntroPage;