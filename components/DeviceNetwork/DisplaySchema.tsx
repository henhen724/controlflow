import { Card, CardContent, Grid, Paper, Typography } from '@material-ui/core';
import { JSONSchema7Definition, JSONSchema7 } from 'json-schema';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        title: {
            float: "left"
        },
        type: {
            float: "right"
        }
    }),
);

interface displaySchemaProps {
    name: string;
    schema: JSONSchema7Definition;
}

const DisplayTypeSchema = (props: displaySchemaProps) => {
    const classes = useStyles();
    if (typeof props.schema === 'boolean') {
        return (<p>props.schema</p>)
    } else {
        console.log(props.schema.description);
        return (
            <Card>
                <CardContent>
                    <Typography color="secondary" variant="h5" component="h2" className={classes.title}>{props.name}</Typography>
                    <Typography color="textSecondary" variant="h6" component="h3" className={classes.type}>
                        {props.schema.type}
                    </Typography>
                </CardContent>
                <CardContent>
                    <Typography color="textPrimary" variant="body2" component="p" gutterBottom align="left">
                        {props.schema.description ? props.schema.description : "No description."}
                    </Typography>
                </CardContent>
            </Card>);
    }
}

export const DisplayJSONSchema = (props: displaySchemaProps) => {
    if (typeof props.schema === "boolean") {
        return (<p>props.schema</p>);
    } else if (props.schema.type) {
        return <DisplayTypeSchema name={props.name} schema={props.schema} />
    } else {
        var displayedProperties = [];
        for (const key in props.schema.properties) {
            displayedProperties.push(<DisplayJSONSchema name={key} schema={props.schema.properties[key]} />)
        }
        return (
            <Card key={props.name}>
                <CardContent>
                    <Typography variant="h5" component="h2">{props.name}</Typography>
                    <Typography color="textSecondary" gutterBottom>
                        {props.schema.title}
                    </Typography>
                    {props.schema.description ? props.schema.description : "No description."}
                </CardContent>
                {displayedProperties}
            </Card>);
    }
}

interface displayDeviceSchema {
    schema: {
        in: {
            [k: string]: JSONSchema7
        }
        out: {
            [k: string]: JSONSchema7
        }
    }
}

const DisplayDeviceSchema = (props: displayDeviceSchema) => {
    var inTopicsDis = [];
    for (const key in props.schema.in) {
        inTopicsDis.push(<DisplayJSONSchema name={key} schema={props.schema.in[key]} />)
    }
    var outTopicsDis = [];
    for (const key in props.schema.out) {
        outTopicsDis.push(<DisplayJSONSchema name={key} schema={props.schema.out[key]} />)
    }
    return (
        <Grid container>
            <Grid item xs={6} spacing={4}>
                <Typography variant="h5" component="h1"> In Topics </Typography>
                <Paper>
                    {inTopicsDis}
                </Paper>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="h5" component="h1"> Out Topics</Typography>
                <Paper>
                    {outTopicsDis}
                </Paper>
            </Grid>
        </Grid>)
}

export default DisplayDeviceSchema;