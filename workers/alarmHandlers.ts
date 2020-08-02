import dbConnect from "../lib/dbConnect";
import Alarm, { IAlarm } from "../models/Alarm";
import DataPacket, { IData } from "../models/DataPacket";
// import { fork } from "child_process";

// const evaluationHandler = fork(`${__dirname}/alarmEvaluatorProcess.ts`); TODO: Add process seperation

let alarmList = null as null | IAlarm[];
let topicsList = null as null | string[];
let relaventBuffers = {} as { [key: string]: IData[] };

const loadAlarmList = async () => {
    dbConnect();

    alarmList = await Alarm.find({}).exec();
    topicsList = alarmList.reduce((prev: string[], curr: IAlarm) => {
        for (var i = 0; i < curr.topics.length; i++) {
            if (!prev.find(str => str === curr.topics[i].topic)) {
                prev.push(curr.topics[i].topic);
            }
        }
        return prev;
    }, []);
}

const evaluateTriggers = async () => {
    dbConnect();

    if (alarmList && topicsList) {
        for (var i = 0; i < topicsList.length; i++) {
            relaventBuffers[topicsList[i]] = await DataPacket.find({ topic: topicsList[i] });
        }
        for (var i = 0; i < alarmList.length; i++) {
            const triggerFunction = eval(alarmList[i].triggerFunction);
            const rslt = triggerFunction(relaventBuffers);
            if (rslt) {
                const actionFunction = eval(alarmList[i].actionFunction);
                actionFunction(relaventBuffers);
            }
        }
    }
}

const handleAlarms = async () => {
    setInterval(loadAlarmList, 1000);
    setInterval(evaluateTriggers, 1000);
}

export default handleAlarms;