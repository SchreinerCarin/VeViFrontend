import React from "react";
import "./bubble.scss";

export default function Bubble(isUserLine, text, ref) {
    return <div className={isUserLine ? "user-line" : "chatbot-line"}>
        <div ref={ref? ref: undefined} className="bubble">{text}</div>
    </div>;
}