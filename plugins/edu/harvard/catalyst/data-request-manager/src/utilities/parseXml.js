export const parseXml = (xmlString) => {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, "text/xml");
};