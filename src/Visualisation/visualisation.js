import React from "react";
import "./visualisation.scss"
import TrafficVisualisationCharts from "./trafficVisualisationCharts";
import Dropdown from "../Common/dropdown";
import {SearchPanel} from "../Common/searchPanel";
import {handleError, requestIntersectionList} from "../Utils/restcalls";
import {isUserProfessor} from "../Utils/localStorageHandler";

const graphTypeOptions = ["Liniendiagramm", "Balkendiagramm"]

export class Visualisation extends React.Component{

    state = {
        selectedIntersections: [],
        graphType: "liniendiagramm",
        intersectionList: [],
        error: "",
    }

    componentDidMount() {
        requestIntersectionList()
            .then(response => this.setState({intersectionList: response.data.intersectionNameDTOS}))
            .catch(error =>
            {handleError(error,  this.props.location)})
    }

    handleGraphTypeChange = (event) => {
        this.setState({graphType: event.target.value});
    }

    handleNewIntersectionSelected = (option) => {
        let updatedSelectedIntersections = [].concat(this.state.selectedIntersections);
        let possibleIndex = this.state.selectedIntersections
            .findIndex(intersection => intersection.intersectionName === option);

        if(possibleIndex >= 0) {
            updatedSelectedIntersections.splice(possibleIndex, 1);
        } else {
            let selectedIntersection = this.state.intersectionList
                .find(intersection => intersection.intersectionName === option);
            updatedSelectedIntersections.push(selectedIntersection);
        }
        this.setState({selectedIntersections: updatedSelectedIntersections});
    }
    render(){
        return(<div className={(isUserProfessor()? "vis-with-footer" : "vis-without-footer") + " visualisation-container"}>
            <div className="graphs-side">
                <TrafficVisualisationCharts
                    location={this.props.location}
                    selectedIntersections={this.state.selectedIntersections}
                    graphType={this.state.graphType}/>
            </div>
            <div className="controls-side">
                <div className="intersection-controls">
                    <SearchPanel
                        selectedOptions={this.state.selectedIntersections.map(intersection => intersection.intersectionName)}
                        options={this.state.intersectionList.map(intersection => intersection.intersectionName)}
                        onOptionClick={(event) => this.handleNewIntersectionSelected(event)}
                    />
                </div>
                <div className="dropdown">
                    <Dropdown
                        activeDropdownOption={this.state.graphType}
                        handleDropdownChange={this.handleGraphTypeChange}
                        dropdownOptions={graphTypeOptions}
                    />
                </div>
            </div>

        </div>)
    }
}