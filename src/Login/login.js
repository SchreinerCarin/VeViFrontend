import React from "react";
import {isLoggedIn, setToken} from "../Utils/localStorageHandler";
import {Redirect, withRouter} from "react-router-dom";
import {login} from "../Utils/restcalls";
import key from "../Ressources/key.svg";
import padlock from "../Ressources/padlock.svg";
import user from "../Ressources/user.svg";
import Input from "../Common/input";
import "./login.scss"
import Button from "../Common/button";

class Login extends React.Component{

    state = {
            error:"",
            nameField: "",
            passwordField:"",
            codeField:"",
    };

    handleSubmit = (event) => {
        event.preventDefault();
        let userName = this.state.nameField.trim();
        let password = this.state.passwordField.trim();
        let accessCode = this.state.codeField.trim();

        let error = "";
        if(!userName){
           error = "Bitte gebe einen Benutzernamen ein. ";
        }
        if(!password){
           error = error.concat("Bitte gebe einen Passwort ein. ");
        }
        if(error){
            this.setState({error: error});
            return;
        }

        login(userName, password, accessCode)
            .then((response) => {
                setToken(response.data.token)
                this.props.history.push('/')
            })
            .catch((e) => {
                this.setState({error: "Entweder sind die Einloggdaten falsch, " +
                        "der Account ist noch nicht freigeschaltet oder der Zugangscode ist fehlerhaft"})
            })
    }

    render(){
        const {location} = this.props;
        return(
            <div className="login-container">
                {(isLoggedIn()) &&
                <Redirect
                    to={{
                        pathname: "/",
                        state: { from: location }
                    }}
                />}
                <h3 className="login-item">VeVi</h3>
                <form className="login-input-container">
                    <div className="login-item">Wilkommen bei VeVi. Um Ihren Account frei zu schalten,
                        fragen Sie bitte Ihren Professor für einen Zugangscode. Wenn sie Ihren Account freigeschaltet haben,
                        können sie das Feld für den Zugangscode frei lassen.</div>
                    {this.state.error && <div className="error-text login-item">{this.state.error}</div>}
                    <div className="login-item">
                        <Input
                            type="text"
                            placeholder="Benutzername"
                            value={this.state.nameField}
                            onChange={(event)=> this.setState({nameField: event.target.value})}>
                                <img className="icon" src={user} alt="user-icon" />
                        </Input>
                    </div>
                    <div className="login-item">
                        <Input
                        type="password"
                        placeholder="Passwort"
                        value={this.state.passwordField}
                        onChange={(event)=> this.setState({passwordField: event.target.value})}>
                            <img className="icon" src={padlock} alt="padlock-icon" />
                        </Input>
                    </div>
                    <div className="login-item">
                        <Input
                        type="text"
                        placeholder="Zugangscode"
                        value={this.state.codeField}
                        onChange={(event)=> this.setState({codeField: event.target.value})}>
                            <img className="icon" src={key} alt="key-icon" />
                        </Input>
                    </div>
                    <Button inForm={true} onClick={event => this.handleSubmit(event)} value="Einloggen"/>
                    </form>
            </div>

        )
    }
}

export default withRouter(Login)