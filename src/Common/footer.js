import React from "react";
import {
    getAccessCode,
    getExpirationDate,
    isUserProfessor,
    setAccessCode,
    setExpirationDate
} from "../Utils/localStorageHandler";
import {handleError, requestCode} from "../Utils/restcalls";
import Button from "./button";
import "./footer.scss"

export default class Footer extends React.Component{
    state = {
        accessCode:getAccessCode(),
        expirationDate: getExpirationDate(),
        error: ""
    }
    //TODO: Formatierung der Zeit
    onClick = () => {
        requestCode()
            .then((response) => {
                setExpirationDate(response.data.expirationDate);
                setAccessCode(response.data.accessCode);
                this.setState({accessCode: response.data.accessCode, expirationDate: response.data.expirationDate})
            })
            .catch((error)=>{
                handleError(error,  this.props.location);
                this.setState({error: "Leider ist gerade ein Fehler unterlaufen. \n" +
                        "Bitte versuche es später erneut"});}
            )
    }

    render() {
        return (

            <div>
                {isUserProfessor() &&
                <div className="footer-container">
                    <div className="button-side">
                        <div className="button-container">
                            <Button onClick={this.onClick}>Code erstellen</Button>
                        </div>
                    </div>
                    <div className="text-side">
                            {this.state.error && <div className="error-text">{this.state.error}</div>}
                            {this.state.accessCode && <div className="access-code">{this.state.accessCode}</div>}
                            {this.state.expirationDate && <div>Code ist gültig bis {this.state.expirationDate}</div>}
                    </div>
                </div>
                }
            </div>
        )
    }
}