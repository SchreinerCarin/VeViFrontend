import React from "react";
import "./searchPanel.scss"
import Input from "./input";
import magnifyingGlass from "../Ressources/magnifyingGlass.svg";

export class SearchPanel extends React.Component{

    state = {
        searchFieldValue: "",
        optionsMatchingToSearch: []
    }

    filter = (event) => {
        let searchValue = event.target.value;
        let newOptionsMatchingToSearch = this.props.options.filter(option => option.includes(searchValue));
        this.setState({searchFieldValue: searchValue, optionsMatchingToSearch: newOptionsMatchingToSearch});
    }

    getNoOptions(text) {
        return <div className="no-data"> {text} </div>;
    }

    getOptions(options) {
        return options.map(option => {
            let isSelected = this.props.selectedOptions.includes(option);
            return (<div className={isSelected ? "selected-option" : "unselected-option"}
                         key={option}
                         onClick={() => this.props.onOptionClick(option)}>
                {option}
            </div>)
        });
    }

    render(){
        return (
            <div className="search-panel-container">
                <Input
                    type="text"
                    placeholder="Auswählbare Induktionsschleifen"
                    value={this.state.searchFieldValue}
                    onChange={(event)=> this.filter(event)}>
                    <img className="icon" src={magnifyingGlass} alt="user-icon" />
                </Input>
                <div className="options-container">
                    {this.state.searchFieldValue !== ""?
                        this.state.optionsMatchingToSearch.length > 0 ?
                            this.getOptions(this.state.optionsMatchingToSearch)
                            :
                            this.getNoOptions("für \"" + this.state.searchFieldValue + "\" gibt es leider keine passenden Elemente")
                        :
                        this.props.options.length > 0?
                            this.getOptions(this.props.options)
                            :
                            this.getNoOptions("(Noch) keine Daten vorhanden")
                    }
                </div>
            </div>
        )
    }
}