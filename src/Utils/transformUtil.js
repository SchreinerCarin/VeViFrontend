import {VictoryLine, VictoryBar} from 'victory';
import React from "react";
import {parseRestTimeToJsDate} from "./timeUtil";

export function getChartByTypeAndData (chartType, data) {
    let chartData = {
        data: data.trafficData,
        key: data.trafficData[0].intersectionName,
        y: "count"
    }

    switch (chartType) {
        case "balkendiagramm": return <VictoryBar
            labels={(data) => data.count}
            style={{ data: { fill: data.color }}}
            x={data => parseRestTimeToJsDate(data.date)}
            {...chartData}/>
        case "liniendiagramm":
        default: return <VictoryLine
            labels={(data) => data.count}
            style={{ data: { stroke: data.color }}}
            x={data => parseRestTimeToJsDate(data.date)}
            {...chartData}/>
    }
}

export function transformChatBotJsonData(json){
    return json.nodeDataArray.reduce((obj, node) => {
        let arrows = json.linkDataArray.reduce((array, link) => {
            if (link.from === node.key) {
                array.push(link.to);
            }
            return array
            }, []);
        return { ...obj,
            [node.key]:  {text: node.text, category: node.category, to: arrows}};
    }, {});
}

export function generateRandomColor(){
    return "#" + Math.floor(Math.random()*16777215).toString(16);
}
