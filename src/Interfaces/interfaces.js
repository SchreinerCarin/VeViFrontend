import React from "react";
import {transformChatBotJsonData} from "../Utils/transformUtil";
import Button from "../Common/button";
import {handleError, requestDynamicPost} from "../Utils/restcalls";
import "./interfaces.scss"
import Bubble from "./bubble";

let json = require('./flowchart.json')
const flowchart = transformChatBotJsonData(json);
const errorCodeIndex = 0;
const errorTextIndex = 1;
const pathNameIndex = 2;
const successMessageIndex = 3;
const dynamicVariablesStartingIndex = 4;

export class Interfaces extends React.Component{
    state = {
        chatContent: [],
        answerOptions: [],
    }

    componentDidMount() {
        this.interpretFlowChartNode();
    }

    scrollToBottom = () => {
        if(this.lastMessage ) {
            this.lastMessage.scrollIntoView({behavior: "smooth"});
        }
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    onSubmitForm = (event, destinationIndex, key, inputType) => {
        //TODO Errorhandling für zulässige Datei und Inputvalues
        event.preventDefault();
        let oldText
        if(inputType === "file"){
            oldText = "Datei"
        } else if(this.state[key] && this.state[key] != null){
            oldText = this.state[key]
        } else {
            oldText = 1;
            this.setState({[key]: 1});
        }
        this.interpretFlowChartNode(destinationIndex , oldText);
    }

    getInput = (key ,inputType, destinationIndex) => {
        return <form className="input-answer-container" key={key}>
            <input className={inputType === "file"? "file-input-answer input-answer" : "input-answer" }
                   type={inputType}
                   accept={inputType === "file"?
                       "application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ""}
                   defaultValue={inputType === "number"? 1 : ""}
                   value={this.state[key]}
                   onChange={(event)=> {this.setState({[key]: inputType === "file"? event.target.files[0] : event.target.value})}}/>
            <Button inForm={true}
                   value="->"
                   className="button-answer"
                onClick={(event) => this.onSubmitForm(event, destinationIndex, key, inputType)}>
            </Button>
        </form>
    }

    getErrorMessage = (sendRequestSpecifics, error) => {
        let updatedChatContent = this.state.chatContent;
        handleError(error, this.props.location);
        if (error.response && error.response.data && error.response.data.errorCode && error.response.data.errorCode.toString() === sendRequestSpecifics[errorCodeIndex]) {
            updatedChatContent.push(Bubble(false, sendRequestSpecifics[errorTextIndex]));
            this.setState({chatContent: updatedChatContent});
        } else if (error.response && error.response.status && error.response.status >= 400){
            updatedChatContent.push(Bubble(false, "Hallo hier ist Vergangenheits-VeVi, leider konnte ich die Daten nicht anlegen. Es kann einfach später erneut versucht werden. Gegenwarts-VeVi wird jetzt normal fortfahren."));
            this.setState({chatContent: updatedChatContent});
        }
    }

    interpretFlowChartNode = (index, oldText) => {
        let actualNode;

        if(index){
            actualNode = flowchart[index];
        } else {
            actualNode = flowchart[-1];
        }

        let updatedChatContent = this.state.chatContent;
        if(oldText && oldText !== ""){
            updatedChatContent.push(Bubble(true, oldText));
        }

        let clearOffState = {}
        if(actualNode.category === "End"){
            let sendRequestSpecifics = actualNode.text.split(":");
            let requestKeys = sendRequestSpecifics.splice(dynamicVariablesStartingIndex);
            let model = {}
            requestKeys.forEach(key => {
                if(key !== "file"){
                    model[key] = this.state[key]? this.state[key] :null;
                }
                clearOffState[key] = undefined;
            });
            let postBody = new FormData();
            postBody.append("model", JSON.stringify(model));
            if(requestKeys.includes("file")){
                postBody.append("file", this.state.file);
            }

            updatedChatContent.push(Bubble(false, sendRequestSpecifics[successMessageIndex]))
            requestDynamicPost(sendRequestSpecifics[pathNameIndex], postBody)
                .catch((error) =>this.getErrorMessage(sendRequestSpecifics, error));
            actualNode = flowchart[-1];
        }
        updatedChatContent.push(Bubble(false, actualNode.text, el => this.lastMessage = el));

        while(actualNode.to.length === 1 && !flowchart[actualNode.to[0]].category){
            updatedChatContent.push(Bubble(false, flowchart[actualNode.to[0]].text, el => this.lastMessage = el));
            actualNode = flowchart[actualNode.to[0]];
        }

        let inputOptions = actualNode.to.map(destination => {
            let destinationNode = flowchart[destination];
            let modeAndSpecifics = destinationNode.text.split(":");
            switch (modeAndSpecifics[0]) {
                case "inputFile":
                    return this.getInput(modeAndSpecifics[1],"file", destinationNode.to);
                case "inputNumber":
                    return this.getInput(modeAndSpecifics[1],"number", destinationNode.to);
                case "inputText":
                    return this.getInput(modeAndSpecifics[1],"text", destinationNode.to);
                default :
                    return <div className="option-container">
                        <div
                            className="option"
                            onClick={(event) => this.interpretFlowChartNode(destinationNode.to ,modeAndSpecifics[0])}>
                            {modeAndSpecifics[0]}
                        </div>
                    </div>
            }
        });
        this.setState({chatContent: updatedChatContent, answerOptions: inputOptions, ...clearOffState});
    }

    render(){
        return(<div className="interface-container">
            <div className="chat-history">{this.state.chatContent}</div>
            <div className="answers-container">{this.state.answerOptions}</div>
        </div>)
    }
}