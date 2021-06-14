import React from "react";
import "./input.scss"

export default function Input ({children, ...rest}) {
    return (
        <div className="input-container">
            <input className="input" {...rest}/>
            <div className="icon-background">
                {children}
            </div>
        </div>
    )
}