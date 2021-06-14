let jwt = require('jsonwebtoken');

const ACCESS_CODE = "AccessCode";
const EXPIRATION_DATE = "CodeExpirationDate";
const TOKEN = "token";

export function setToken (token) {
    localStorage.setItem(TOKEN,token);
}

export function isUserProfessor () {
    let token = localStorage.getItem(TOKEN);
    if(!token){
        return false
    }
    let tokenValue = jwt.decode(token);
    return true;
    //return !!tokenValue.isProfessor;
}

export function getToken () {
    return localStorage.getItem(TOKEN);
}

export function isLoggedIn () {
    let token = localStorage.getItem(TOKEN);
    if(!token){
        return false
    }
    let tokenValue = jwt.decode(token);
    return !!tokenValue;
}

export function logout () {
    return localStorage.clear();
}

export function setExpirationDate (expirationDate) {
    localStorage.setItem(EXPIRATION_DATE, expirationDate);
}

export function getExpirationDate () {
    let expirationDate = localStorage.getItem(EXPIRATION_DATE);
    return expirationDate? expirationDate: "";
}

export function setAccessCode (accessCode) {
    localStorage.setItem(ACCESS_CODE ,accessCode);
}

export function getAccessCode () {
    let accessCode = localStorage.getItem(ACCESS_CODE);
    return accessCode? accessCode: "";
}
