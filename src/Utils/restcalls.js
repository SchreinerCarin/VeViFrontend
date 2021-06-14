import {getToken, logout} from "./localStorageHandler";
import React from "react";
import {Redirect} from "react-router-dom";

const axios = require('axios').default;
const localUrl = "http://localhost:8090/";
//TODO Prodlösungen: const prodUrl ="";

function createAxios () {
    return axios.create({
        baseURL: localUrl,
        timeout: 1000,
        headers: {'X-Auth-Header': getToken()}
    });
}

export function login (username, password, accessCode) {
    const instance = createAxios();
    return instance.post('auth/login', {
        username: username,
        password: password,
        accessCode: accessCode
    });
}

export function requestCode () {
    const instance = createAxios();
    return instance.get('auth/accesscode');
}

export function requestTrafficData (dataprovider, intersectionName, startDate, endDate) {
    const instance = createAxios();
    return instance.get('trafficdata/' + dataprovider + '/' + intersectionName + '/' + startDate + '/' + endDate);
}

export function requestIntersectionList () {
    const instance = createAxios();
    return instance.get('trafficdata/intersection');
}

export function requestDynamicPost (path, body) {
    const instance = createAxios();
    return instance.post(path, body);
}

export function handleError (error, location) {
    if(error.response && error.response.data && error.response.data.errorCode){
       if(error.response.data.errorCode === 1001 || error.response.data.errorCode === 1000){
            return <Redirect
                to={{
                    pathname: "/",
                    state: { from: location }
                }}
            />
       }
       if(error.response.data.errorCode === 3000){
           logout();
           return <Redirect
               to={{
                   pathname: "/login",
                   state: { from: location }
               }}
           />
       }
    }
}