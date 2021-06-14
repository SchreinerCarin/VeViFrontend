# Getting Started with Create React App

This is the Frontend of the VeVi Project. For documentation beyond this quick starting guide, 
please look up the Bachelor Thesis "Entwicklung eines Multikanaltools zur Verkehrsdatenvisualisierung".

## Getting started

To start the Application you need to have npm installed.

Before running the project for the first time, all frameworks and libraries have to be installed. Run:
### `npm install`

Then you can start the project with:
### `npm start`

## Encountering Problems

In case the application should run on your machine, but your browser won't open the site because of Security Issues,
open a secure window in firefox. Type in `about:config` and search for `TLS`. Set down `security.tls.version.max` to 3. 
You can now open the application in a secure windows. Just keep in mind to use `http://` instead of `https://`.

## configuring the Pseudo-Chatbot

The Pseudo-Chatbot interpretes the JSON-file name `flowchart.json` in `VeViFrontend.src.interfaces`. 
This JSON can be visualized using the example site of [GoJS](https://gojs.net/latest/samples/flowchart.html). 
To create a working Pseudo-Chatbot flowchart JSON keep these constraints in mind:

- Use only one start element. It has to have the ID -1.
- The steps (squares) will directly translate into VeVis speech bubbles.
- The Rhombus will be translated into answer options.
- If an answer option should be just an option to select, just write the text of the choice option in the rhombus.
- If an answer option should be an input field, type the input type (`inputNumber` for an input field that only accepts numbers, `inputText` for an input text field, `inputFile` for an input field that only accepts files) and the data key separated by colons (for example `inputNumber:endDateColumn`). The data entered into the fields will be saved under the datakey.
- If an answer option is a `fieldInput` the datakey has to be `file`
- The datakeys have to equal the fields of the DTO that the targeted rest function is accepting. 
- Don't forget to use the arrows.
- Multiple end elements are possible. It has many fields, that are seperated by colons. The first field should equal the possible errorcode the targeted rest function may return. The second field will be interpreted into the speech bubble, that will be shown in case of the before mentioned error code. The third is the suffix of the backend route that the data should be sent to. The fourth is the speech bubble, that will be displayed when reaching this node. Every field after that, will be interpreted as a datakey. The frontend uses this information to send a FormData request to the backend with the before mentioned suffix, using the data saved with the datakeys. Example: `3:error code 3 occured:/trafficdata/filedata:Thank you for submitting your data:timeColumn:dateColumn:startDataColumn:endDataColumn:dataKey:file` 