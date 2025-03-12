export const parseXml = (xmlString) => {
    //parses XML with CDATA properly
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, "text/xml");
};