import React from "react";
import Plot from 'react-plotly.js';
import {requestTrafficData} from "../Utils/restcalls";
import {formatDateToRestTime} from "../Utils/timeUtil";
import "./trafficVisualisationCharts.scss"
import {generateRandomColor} from "../Utils/transformUtil";
import {getMovingMeanData, getThresholdData,} from "time-series-pre-processing-library";

const twoYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() -2));

export default class TrafficVisualisationCharts extends React.Component {

    state = {
        startDate: twoYearAgo,
        endDate: new Date(),
        entireData: [],
        modifiedData: [],
        isSetOnFilteringMode: true,
    }

    async componentDidUpdate(prevProps, prevState) {
        if(this.props.selectedIntersections !== prevProps.selectedIntersections){
            await this.handleChangedIntersectionData(prevProps);
        }
    }

    async handleChangedIntersectionData(prevProps) {
        let startDateString = formatDateToRestTime(this.state.startDate);
        let endDateString = formatDateToRestTime(this.state.endDate);
        let newEntireData = [];
        let oldSelectedIntersections = prevProps.selectedIntersections;
        for (const intersection of this.props.selectedIntersections) {
            let possibleIndexInOldSelectedIntersection = oldSelectedIntersections
                .findIndex(oldIntersection => oldIntersection.intersectionName === intersection.intersectionName);
            if (possibleIndexInOldSelectedIntersection >= 0) {
                oldSelectedIntersections.splice(possibleIndexInOldSelectedIntersection, 1);
            } else {
                let response = await requestTrafficData(intersection.dataProvider, intersection.intersectionName, startDateString, endDateString)
                newEntireData.push({trafficData: response.data.trafficDataDTOS, color: generateRandomColor()});
            }
        }

        let oldEntireData = this.state.entireData;
        for (let i = 0; i < oldEntireData.length; i++) {
            let possibleIndex = oldSelectedIntersections.findIndex(oldSelectedIntersection => oldSelectedIntersection.intersectionName === oldEntireData[i].trafficData[0].intersectionName);
            if (possibleIndex >= 0) {
                oldSelectedIntersections.splice(possibleIndex, 1);
                oldEntireData.splice(i, 1);
                i--;
                if (oldSelectedIntersections.length === 0) {
                    break;
                }
            }
        }
        newEntireData = newEntireData.concat(oldEntireData);
        this.setState({entireData: newEntireData});
    }

    getOriginalData = () => {
        let data = this.state.entireData;
        return data.map(trafficObject => {
            let date = []
            let count = []
            for (const dataPoint of trafficObject.trafficData){
                date.push(dataPoint.date)
                count.push(dataPoint.count)
            }
            return {name: trafficObject.trafficData[0].intersectionName,
                x: date,
                y: count,
                marker: {color: trafficObject.color},
                type: 'scattergl',
                mode: 'lines+markers'}
        })
    }

    setY = (yArray, xArray, originalData, newValue, index) => {
        xArray.push(originalData[index].date)
        yArray.push(newValue)
    }

    getFilteredData = () => {
        let data = this.state.entireData;
        return data.map(trafficObject => {
            let trafficData = trafficObject.trafficData;
            let thresholdDate = []
            let thresholdCount = []
            getThresholdData(
                trafficData.length,
                (index) => trafficData[index].count,
                (newValue, i) => this.setY(thresholdCount, thresholdDate, trafficData, newValue, i),
                0,
                60)

            let count = []
            getMovingMeanData(
                trafficData.length,
                (index) => thresholdCount[index],
                (newValue) => count.push(newValue),
                11)

            return {name: trafficData[0].intersectionName,
                x: thresholdDate,
                y: count,
                marker: {color: trafficObject.color},
                type: 'scattergl',
                mode: 'lines+markers'}
        })
    }

    getData = () => {
        if(this.state.entireData.length > 0) {
            return this.state.isSetOnFilteringMode
                ? this.getFilteredData()
                : this.getOriginalData()
        } else {
            return []
        }
    }

    render() {
        let data = this.getData();
        return (
            <div className="traffic-vis-chart-container">
                <div className="top-chart">
                    <Plot
                        data={data}
                        layout={{autosize: true}}
                        useResizeHandler={true}
                        style={{width: "100%", height: "100%"}}
                    />
                </div>
                <div className="bottom-chart">
                    <div>
                        Daten filtern
                        <input type="radio" name="site_name"
                               value="filtering"
                               checked={this.state.isSetOnFilteringMode}
                               onChange={() => this.setState({isSetOnFilteringMode: !this.state.isSetOnFilteringMode})} />
                        Ungefiltert
                        <input type="radio" name="site_name"
                           value="error"
                           checked={!this.state.isSetOnFilteringMode}
                           onChange={() => this.setState({isSetOnFilteringMode: !this.state.isSetOnFilteringMode})} />
                    </div>
                </div>
            </div>
        );
    }
}