export function transformChatBotJsonData(json){
    return json.nodeDataArray.reduce((obj, node) => {
        let arrows = json.linkDataArray.reduce((array, link) => {
            if (link.from === node.key) {
                array.push(link.to);
            }
            return array
            }, []);
        return { ...obj,
            [node.key]:  {text: node.text, category: node.category, to: arrows}};
    }, {});
}

export function generateRandomColor(){
    return "#" + Math.floor(Math.random()*16777215).toString(16);
}
