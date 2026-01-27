export default {
    STATE: {
        order: 1,
        title: "State",
        tooltip: "Rollup to State",
        extract : [
            {
                regex: `^([A-Z]{2})$`,
                attribs: [
                    ["stateCode", "text", "$aggKey"]
                ],
                clickBox: {
                    options: {
                        closeButton: "true",
                        className: "onclick-box",
                        autoClose: false,
                        closeOnClick: false
                    },
                    template: "<b>[{{ZCTA5CE10}}] - {{name}}</b><br/>{{display}} patients"
                },
                hoverBox: {
                    position: "topright",
                    className: "onhover-box",
                    default: "<h4>Patient Count</h4>Hover over an area",
                    template: "<h4>Patient Count</h4><div><b>{{name}}</b></div><div>Zip Code: {{ZCTA5CE10}}</div><span>{{display}} patients</span>"
                },
                legendBox: {
                    position: "bottomright",
                    options: {},
                    templates: {
                        root: "<div class='map-title'><h4>Patient Count</h4></div><div class='map-entries'><div>{{entries}}</div></div>",
                        auto: "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min|2}}&ndash;{{~max|2}}</span></div>",
                        "min-max": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min}}&ndash;{{~max}}</span></div>",
                        "no-min": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>&lt;{{~max}}</span></div>",
                        "no-max": "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min}}+</span></div>"
                    }
                }
            },
            {
                regex: `^\\[(.*)\\]([A-Z]{2})$`,
                attribs: [
                    "$normalizer",
                    ["stateCode", "text", "$aggKey"]
                ]
            }
        ]
    },
    ZIP3: {
        order: 2,
        default: true,
        title: "ZIP3",
        tooltip: "Rollup to first 3 digits of ZIP Code",
        extract: [
            {
                regex: "^\\[(.*)\\]([0-9]{3}) - (.*)",
                attribs: [
                    "$normalizer",
                    ["zip3code", "$aggKey"],
                    "text"
                ]
            },
            {
                regex: "^([0-9]{3}) - (.*)",
                attribs: [
                    ["zip3code", "$aggKey"],
                    "text"
                ]
            }
        ]
    },
    ZIP5: {
        order: 3,
        title: "ZIP Code",
        tooltip: "Rollup to ZIP Code",
        extract: [
            {
                regex: "^([0-9]{5}) - (.*)",
                attribs: [
                    ["zip5code", "$aggKey"],
                    "text"
                ]
            },
            {
                regex: "^\\[(.*)\\]([0-9]{5}) - (.*)",
                attribs: [
                    "$normalizer",
                    ["zip5code", "$aggKey"],
                    "text"
                ]
            }
        ]
    }
}