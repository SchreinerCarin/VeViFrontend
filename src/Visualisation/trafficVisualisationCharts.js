import React from "react";
import {VictoryAxis, VictoryBrushContainer, VictoryChart, VictoryZoomContainer, VictoryLabel} from 'victory';
import {requestTrafficData} from "../Utils/restcalls";
import {dateIsBetweenDates, formatDateToRestTime} from "../Utils/timeUtil";
import {generateRandomColor, getChartByTypeAndData} from "../Utils/transformUtil";
import "./trafficVisualisationCharts.scss"
let _ = require('lodash');

const twoYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() -2));

export default class TrafficVisualisationCharts extends React.Component {

    state = {
        startDate: twoYearAgo,
        endDate: new Date(),
        zoomDomain: {x: [twoYearAgo, new Date()], y: [0, 1]},
        upperGraphData: [],
        lowerGraphData: [],
        entireData: [],
        width: window.innerWidth,
        height: window.innerHeight,
        entireDomain: {x: [twoYearAgo, new Date()], y: [0, 1]},
    }

    timer;

    async componentDidUpdate(prevProps) {
        if(this.props.selectedIntersections !== prevProps.selectedIntersections){
            await this.handleChangedIntersectionData(prevProps);
        }
    }

    async handleChangedIntersectionData(prevProps) {
        let startDateString = formatDateToRestTime(this.state.startDate);
        let endDateString = formatDateToRestTime(this.state.endDate);
        let newUpperGraphData = [];
        let newLowerGraphData = [];
        let newEntireData = [];
        let oldSelectedIntersections = prevProps.selectedIntersections;
        for (const intersection of this.props.selectedIntersections) {
            let possibleIndexInOldSelectedIntersection = oldSelectedIntersections
                .findIndex(oldIntersection => oldIntersection.intersectionName === intersection.intersectionName);
            if (possibleIndexInOldSelectedIntersection >= 0) {
                oldSelectedIntersections.splice(possibleIndexInOldSelectedIntersection, 1);
            } else {
                let response = await requestTrafficData(intersection.dataProvider, intersection.intersectionName, startDateString, endDateString)
                let trafficData = {trafficData: response.data.trafficDataDTOS, color: generateRandomColor()};
                let newFilteredData = this.getData(this.state.zoomDomain, trafficData, true);
                newEntireData.push(trafficData);
                newUpperGraphData.push(newFilteredData.upperGraphData);
                newLowerGraphData.push(newFilteredData.lowerGraphData);
            }
        }

        let oldEntireData = this.state.entireData;
        let oldUpperGraphData = this.state.upperGraphData;
        let oldLowerGraphData = this.state.lowerGraphData;
        for (let i = 0; i < oldEntireData.length; i++) {
            let possibleIndex = oldSelectedIntersections.findIndex(oldSelectedIntersection => oldSelectedIntersection.intersectionName === oldEntireData[i].trafficData[0].intersectionName);
            if (possibleIndex >= 0) {
                oldSelectedIntersections.splice(possibleIndex, 1);
                oldEntireData.splice(i, 1);
                oldUpperGraphData.splice(i, 1);
                oldLowerGraphData.splice(i, 1);
                i--;
                if (oldSelectedIntersections.length === 0) {
                    break;
                }
            }
        }
        newEntireData = newEntireData.concat(oldEntireData);
        newUpperGraphData = newUpperGraphData.concat(oldUpperGraphData);
        newLowerGraphData = newLowerGraphData.concat(oldLowerGraphData);
        let fullDomain = this.getEntireDomain(newEntireData);
        this.setState({entireData: newEntireData,
            upperGraphData: newUpperGraphData,
            lowerGraphData: newLowerGraphData,
            zoomDomain: fullDomain,
            entireDomain: fullDomain});
    }

    handleZoom = (domain) => {
        if(this.timer) {
            window.clearTimeout(this.timer);
        }

        this.timer = window.setTimeout(() => {
            let newGraphData = this.state.entireData.map(intersectionData => this.getData(domain, intersectionData));
            this.setState({zoomDomain: domain, upperGraphData: newGraphData.map(intersectionData => intersectionData.upperGraphData)});
        }, 500);
    }

    getEntireDomain = (data) => {
        return {
            y: [_.min(data.map(intersection => _.minBy(intersection.trafficData, 'count').count)),
                _.max(data.map(intersection => _.maxBy(intersection.trafficData, 'count').count))],
            x: [this.state.startDate , this.state.endDate]
        };
    }

    getData = (domain, data, shouldUpdateLowerGraph = false) => {
        let filteredGraphData = {upperGraphData: [], lowerGraphData: []}
        let upperGraphData = data.trafficData.filter((d) => (dateIsBetweenDates(d.date, domain.x[0], domain.x[1]) && d.count > 0));
        if (upperGraphData.length > 50) {
            const k = Math.ceil(upperGraphData.length / 50);
            upperGraphData = upperGraphData.filter(
                (d, i) => ((i % k) === 0)
            );
        }
        filteredGraphData.upperGraphData = {trafficData: upperGraphData, color: data.color};
        let lowerGraphData = data.trafficData;
        if (shouldUpdateLowerGraph && lowerGraphData.length > 80) {
            const k = Math.ceil(lowerGraphData.length / 80);
            lowerGraphData = lowerGraphData.filter(
                (d, i) => ((i % k) === 0)
            );
        }
        filteredGraphData.lowerGraphData = {trafficData: lowerGraphData, color: data.color};
        return filteredGraphData;
    }

    getGraph(intersectionData) {
        return intersectionData.trafficData.length > 0 ? getChartByTypeAndData(this.props.graphType, intersectionData) : undefined;
    }

    //TODO: Datum veränderbar
    //TODO: Legend & Labels

    render() {
        let upperGraph = this.state.upperGraphData.map(intersectionData => this.getGraph(intersectionData));
        let lowerGraph = this.state.lowerGraphData.map(intersectionData => this.getGraph(intersectionData));
        return (
            <div className="traffic-vis-chart-container">
                <div className="top-chart">
                    <VictoryChart
                        padding={{ top: 10, bottom: 30, left: 26, right: 20 }}
                        scale={{x: "time"}}
                        domain={this.state.entireDomain}
                        containerComponent={
                            <VictoryZoomContainer zoomDimension="x"
                                                  zoomDomain={this.state.zoomDomain}
                                                  onZoomDomainChange={this.handleZoom}
                                                  preserveAspectRatio="none"
                            />
                        }
                    >
                        <VictoryAxis/>
                        <VictoryAxis dependentAxis standalone={false}
                                     width={10}
                                     tickLabelComponent={<VictoryLabel padding={{ top: 0, bottom: 0, left: 26, right: -10 }}
                                                                       transform="matrix(0.50,0.00,0.00,1.00,15,0)"/>}/>
                        {upperGraph}
                    </VictoryChart>
                </div>
                <div className="bottom-chart">
                    <VictoryChart
                        padding={{ top: 10, bottom: 30, left: 26, right: 20 }}
                        scale={{x: "time"}}
                        domain={this.state.entireDomain}
                        containerComponent={
                            <VictoryBrushContainer brushDimension="x"
                                                   brushDomain={this.state.zoomDomain}
                                                   onBrushDomainChange={this.handleZoom}
                                                   preserveAspectRatio="none"
                            />
                        }
                    >
                        <VictoryAxis/>
                        {lowerGraph}
                    </VictoryChart>
                </div>
            </div>
        );
    }
}