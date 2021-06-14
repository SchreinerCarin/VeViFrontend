import React from "react";

import "./dropdown.scss"

export default function Dropdown(props) {

    return (<div className="dropdown-container">
        <select className="dropdown" value={props.activeDropdownOption} onChange={props.handleDropdownChange}>
            {props.dropdownOptions.map(option =>
                <option value={option.toLowerCase()} key={option} className="option">
                    {option}
                </option>)}
        </select>
    </div>)
}