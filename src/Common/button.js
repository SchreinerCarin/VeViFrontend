import React from "react";
import "./button.scss"

export default function Button ({children, className, inForm, ...rest}) {

    if(inForm){
        return (
            <input type="submit" className={`button ${ className }`} {...rest}/>
        )
    }
    return (
        <button className={`button ${ className }`} {...rest}>
            {children}
        </button>
    )
}
