import React from "react";
import {isUserProfessor} from "../Utils/localStorageHandler";
import {useLocation, Link} from "react-router-dom";
import logoHochschuleRheinMain from "../Ressources/logoHochschuleRheinMain.svg";
import "./header.scss"

const headerArrays = [{
    path: "/",
    text: "Visualisierung"
},{
    path: "/schnittstellen",
    text: "Schnittstellen"
}]

export default function Header() {
    let location = useLocation();
    let arrayLength = headerArrays.length;
    return(
        <div className="header-container">
            <div className="left-side">
                <img className="icon" src={logoHochschuleRheinMain} alt="user-icon" />
            </div>
            {isUserProfessor() &&
                <div className="right-side">
                    {headerArrays.map((headerPair, index) => {
                        let isLast = index >= arrayLength-1;
                        let isActual = headerPair.path === location.pathname;
                        return( <div key={headerPair.text}>
                            {isActual?
                                    <div className="head-link disabled-head-link">
                                        {headerPair.text} {!isLast&& "|"}
                                    </div>
                                    :
                                    <Link
                                        className="head-link active-head-link"
                                        to={headerPair.path}>
                                        {headerPair.text} {!isLast&& "|"}
                                    </Link>
                            }
                        </div>)
                    })}
                </div>
            }
        </div>
    )
}