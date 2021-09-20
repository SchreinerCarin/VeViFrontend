import React from "react";
import Plot from 'react-plotly.js';
import {requestTrafficData} from "../Utils/restcalls";
import {formatDateToRestTime} from "../Utils/timeUtil";
import "./trafficVisualisationCharts.scss"
import {generateRandomColor} from "../Utils/transformUtil";
import Dropdown from "../Common/dropdown";
import {
    getExponentialFilterData,
    getMaximum,
    getMean,
    getMedian,
    getMinimum,
    getMovingMeanData, getSigmaRuleData, getThresholdData,
    linearInterpolation
} from "time-series-pre-processing-library";

const twoYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() -2));

export default class TrafficVisualisationCharts extends React.Component {

    filteringMethods = Object.freeze(["Original", "Moving Mean", "Exponential Filter"])

    errorDetectionAlgorithms = Object.freeze(["Original", "Sigma rule", "Grenzwerte setzen"])

    errorHandlingMetehods = Object.freeze(["Punkt entfernen", "Punkt unsichtbar machen", "Ersetzen durch Minimum",
        "Ersetzen durch Median", "Ersetzen durch Durchschnitt", "Ersetzen durch Maximum",
        "Ersetzen durch Linear Interpolation"])

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

    state = {
        startDate: twoYearAgo,
        endDate: new Date(),
        entireData: [],
        modifiedData: [],
        isSetOnFilteringMode: true,
        filteringMethod: this.filteringMethods[0],
        filteringFunction: this.getOriginalData,
        errorDetectionAlgorithm: this.errorDetectionAlgorithms[0],
        errorDetectionFunction: this.getOriginalData,
        errorHandlingMethod: this.errorHandlingMetehods[0],
        errorHandlingFunction: undefined,
        isWidthNeeded: false,
        width: 3,
        isPercentageNeeded: false,
        percentage: 0.5,
        isRangeNeeded: false,
        minValue: 0,
        maxValue: 100000,
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

    getY = (data, index) => {
        return data[index].count
    }

    setY = (yArray, xArray, originalData, newValue, index) => {
        xArray.push(originalData[index].date)
        yArray.push(newValue)
    }

    getMovingMeanData = () => {
        let data = this.state.entireData;
        return data.map(trafficObject => {
            let trafficData = trafficObject.trafficData;
            let date = []
            let count = []
             getMovingMeanData(
                trafficData.length,
                (index) => this.getY(trafficData, index),
                (newValue, i) => this.setY(count, date, trafficData, newValue, i),
                this.state.width
            )
            return {name: trafficData[0].intersectionName,
                x: date,
                y: count,
                marker: {color: trafficObject.color},
                type: 'scattergl',
                mode: 'lines+markers'}
        })

    }

    getExponentialFilterData = () => {
        let data = this.state.entireData;
        return data.map(trafficObject => {
            let percentage = this.state.percentage;
            let trafficData = trafficObject.trafficData;
            let date = []
            let count = []
            getExponentialFilterData(
                trafficData.length,
                (index) => this.getY(trafficData, index),
                (newValue, i) => this.setY(count, date, trafficData, newValue, i),
                percentage
            )
            return {name: trafficData[0].intersectionName,
                x: date,
                y: count,
                marker: {color: trafficObject.color},
                type: 'scattergl',
                mode: 'lines+markers'}
        })
    }

    getSigmaRuleData = () => {
        let data = this.state.entireData;
        return data.map(trafficObject => {
            let trafficData = trafficObject.trafficData;
            let date = [];
            let count = [];
            getSigmaRuleData(
                trafficData.length,
                (index) => this.getY(trafficData, index),
                (newValue, i) => this.setY(count, date, trafficData, newValue, i),
                this.state.errorHandlingFunction)
            return {name: trafficData[0].intersectionName,
                x: date,
                y: count,
                marker: {color: trafficObject.color},
                type: 'scattergl',
                mode: 'lines+markers'}
        })
    }

    getThresholdData = () => {
        let data = this.state.entireData;
        return data.map(trafficObject => {
            const minRange = this.state.minValue;
            const maxRange = this.state.maxValue;
            let trafficData = trafficObject.trafficData;
            let date = []
            let count = []
            getThresholdData(
                trafficData.length,
                (index) => this.getY(trafficData, index),
                (newValue, i) => this.setY(count, date, trafficData, newValue, i),
                minRange,
                maxRange,
                this.state.errorHandlingFunction)
            return {name: trafficData[0].intersectionName,
                x: date,
                y: count,
                marker: {color: trafficObject.color},
                type: 'scattergl',
                mode: 'lines+markers'}
        })
    }

    handleNewMethodSelected = (event) => {
        let newMethod = event.target.value;
        let rawObject = {
            filteringMethod: this.state.filteringMethod,
            filteringFunction: this.state.filteringFunction,
            errorDetectionAlgorithm: this.state.errorDetectionAlgorithm,
            errorDetectionFunction: this.state.errorDetectionFunction,
            isWidthNeeded: false,
            isPercentageNeeded: false,
            isRangeNeeded: false
        }
        switch (newMethod) {
            case "Moving Mean":
                rawObject.filteringMethod = "Moving Mean";
                rawObject.filteringFunction = this.getMovingMeanData;
                rawObject.isWidthNeeded = true;
                break;
            case "Exponential Filter":
                rawObject.filteringMethod = "Exponential Filter";
                rawObject.filteringFunction = this.getExponentialFilterData;
                rawObject.isPercentageNeeded = true;
                break;
            case "Sigma rule":
                rawObject.errorDetectionAlgorithm = "Sigma rule";
                rawObject.errorDetectionFunction = this.getSigmaRuleData;
                break;
            case "Grenzwerte setzen":
                rawObject.errorDetectionAlgorithm = "Grenzwerte setzen";
                rawObject.errorDetectionFunction = this.getThresholdData;
                rawObject.isRangeNeeded = true;
                break;
            default: if(this.state.isSetOnFilteringMode){
                rawObject.filteringMethod = "Original";
                rawObject.filteringFunction = this.getOriginalData;
            }else{
                rawObject.errorDetectionAlgorithm = "Original";
                rawObject.errorDetectionFunction = this.getOriginalData;
            }
                break;
        }
        this.setState(rawObject);
    }

    handleNewErrorMethodSelected = (event) => {
        let newMethod = event.target.value;
        let rawObject = {
            errorHandlingMethod: "Punkt entfernen",
            errorHandlingFunction: undefined
        }
        switch (newMethod) {
            case "Ersetzen durch Minimum":
                rawObject.errorHandlingMethod = "Ersetzen durch Minimum";
                rawObject.errorHandlingFunction = getMinimum;
                break;
            case "Ersetzen durch Maximum":
                rawObject.errorHandlingMethod = "Ersetzen durch Maximum";
                rawObject.errorHandlingFunction = getMaximum;
                break;
            case "Ersetzen durch Durchschnitt":
                rawObject.errorHandlingMethod = "Ersetzen durch Durchschnitt";
                rawObject.errorHandlingFunction = getMean;
                break;
            case "Ersetzen durch Median":
                rawObject.errorHandlingMethod = "Ersetzen durch Median";
                rawObject.errorHandlingFunction = getMedian;
                break;
            case "Ersetzen durch Linear Interpolation":
                rawObject.errorHandlingMethod = "Ersetzen durch Linear Interpolation";
                rawObject.errorHandlingFunction = linearInterpolation;
                break;
            default: //Punkte löschen
                break;
        }
        this.setState(rawObject);
    }

    getData = () => {
        if(this.state.entireData.length > 0) {
            return this.state.isSetOnFilteringMode
                ? this.state.filteringFunction()
                : this.state.errorDetectionFunction();
        } else {
            return []
        }
    }

    handleChangeMode = () => {
        this.setState(prevState =>  {return{
            filteringMethod: "Original",
            filteringFunction: this.getOriginalData,
            errorDetectionAlgorithm: "Original",
            errorDetectionFunction: this.getOriginalData,
            isSetOnFilteringMode: !prevState.isSetOnFilteringMode,
            isWidthNeeded: false,
            isPercentageNeeded: false,
            isRangeNeeded: false
        }})
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
                        Filtern
                        <input type="radio" name="site_name"
                               value="filtering"
                               checked={this.state.isSetOnFilteringMode}
                               onChange={this.handleChangeMode} />
                        Fehler suche
                        <input type="radio" name="site_name"
                           value="error"
                           checked={!this.state.isSetOnFilteringMode}
                           onChange={this.handleChangeMode} />
                    </div>
                    <div>
                        <Dropdown
                            activeDropdownOption={this.state.isSetOnFilteringMode? this.state.filteringMethod: this.state.errorDetectionAlgorithm}
                            handleDropdownChange={this.handleNewMethodSelected}
                            dropdownOptions={this.state.isSetOnFilteringMode? this.filteringMethods: this.errorDetectionAlgorithms}
                            extractMethod={(option)=> {return option.displayName}}
                        />
                    </div>
                    <div>
                        {!this.state.isSetOnFilteringMode &&
                            <Dropdown
                                activeDropdownOption={this.state.errorHandlingMethod}
                                handleDropdownChange={this.handleNewErrorMethodSelected}
                                dropdownOptions={this.errorHandlingMetehods}
                        />}
                    </div>
                    <div>
                        {this.state.isWidthNeeded &&
                            <div>
                                Breite
                                <input type="number"
                                       value={this.state.width}
                                       onChange={(event) => {this.setState({width: event.target.value})}}/>
                            </div>
                        }
                    </div>
                    <div>
                        {this.state.isPercentageNeeded &&
                        <div>
                            Prozent
                            <input type="number"
                                   max={1}
                                   min={0}
                                   step={0.05}
                                   value={this.state.percentage}
                                   onChange={(event) => {this.setState({percentage: event.target.value})}}/>
                        </div>
                        }
                    </div>
                    <div>
                        {this.state.isRangeNeeded &&
                        <div>
                            <div>
                                Mininimal Wert
                                <input type="number"
                                       value={this.state.minValue}
                                       max={this.state.maxValue-1}
                                       onChange={(event) => {this.setState({minValue: event.target.value})}}/>
                            </div>
                            <div>
                                Maximal Wert
                                <input type="number"
                                       value={this.state.maxValue}
                                       min={this.state.minValue+1}
                                       onChange={(event) => {this.setState({maxValue: event.target.value})}}/>
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}