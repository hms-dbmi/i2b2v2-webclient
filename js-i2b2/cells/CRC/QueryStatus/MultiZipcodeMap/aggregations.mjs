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
                // non-functioning example
                clickBox: {
                    template: "<b>[{{ZCTA5CE10}}] - {{name}}</b><br/>{{display}} patients"
                },
                // non-functioning example
                hoverBox: {
                    default: "<h4>Patient Count</h4>Hover over an area",
                    template: "<h4>Patient Count</h4><div><b>{{name}}</b></div><div>Zip Code: {{ZCTA5CE10}}</div><span>{{display}} patients</span>"
                },
                // non-functioning example
                legendBox: {
                    templates: {
                        root: "<div class='map-title'><h4>Patient Count</h4></div><div class='map-entries'><div>{{entries}}</div></div>",
                        auto: "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min|2}}&ndash;{{~max|2}}</span></div>"
                    }
                }
            },
            {
                regex: `^\\[(.*)\\]([A-Z]{2})$`,
                attribs: [
                    "$normalizer",
                    ["stateCode", "text", "$aggKey"]
                ],
                // non-functioning example
                clickBox: {
                    template: "<b>[{{stateCode}}]</b><br/>{{count}} patients"
                },
                // non-functioning example
                hoverBox: {
                    default: "<h4>Patient Population %</h4>Hover over an area",
                    template: "<h4>Patient Population %</h4><div><b>{{stateCode}}</b></div><div>% of Population: {{$normalizedValue}}</div><span>{{display}} patients</span>"
                },
                // non-functioning example
                legendBox: {
                    templates: {
                        root: "<div class='map-title'><h4>% of Population</h4></div><div class='map-entries'><div>{{entries}}</div></div>",
                        auto: "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min|2}}%&ndash;{{~max|2}}%</span></div>"
                    }
                }
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
                ],
                clickBox: {
                    template: "<b>[{{ZCTA5CE10}}] - {{name}}</b><br/>{{display}} patients"
                },
                // non-functioning example
                hoverBox: {
                    default: "<h4>Patient Count</h4>Hover over an area",
                    template: "<h4>Patient Count</h4><div><b>{{name}}</b></div><div>Zip Code: {{ZCTA5CE10}}</div><span>{{display}} patients</span>"
                },
                // non-functioning example
                legendBox: {
                    templates: {
                        root: "<div class='map-title'><h4>Patient Count</h4></div><div class='map-entries'><div>{{entries}}</div></div>",
                        auto: "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min|2}}&ndash;{{~max|2}}</span></div>"
                    }
                }
            },
            {
                regex: "^([0-9]{3}) - (.*)",
                attribs: [
                    ["zip3code", "$aggKey"],
                    "text"
                ],
                // non-functioning example
                clickBox: {
                    template: "<b>[{{stateCode}}]</b><br/>{{count}} patients"
                },
                // non-functioning example
                hoverBox: {
                    default: "<h4>Patient Population %</h4>Hover over an area",
                    template: "<h4>Patient Population %</h4><div><b>{{stateCode}}</b></div><div>% of Population: {{$normalizedValue}}</div><span>{{display}} patients</span>"
                },
                // non-functioning example
                legendBox: {
                    templates: {
                        root: "<div class='map-title'><h4>% of Population</h4></div><div class='map-entries'><div>{{entries}}</div></div>",
                        auto: "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min|2}}%&ndash;{{~max|2}}%</span></div>"
                    }
                }
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
                ],
                clickBox: {
                    template: "<b>[{{ZCTA5CE10}}] - {{name}}</b><br/>{{display}} patients"
                },
                // non-functioning example
                hoverBox: {
                    default: "<h4>Patient Count</h4>Hover over an area",
                    template: "<h4>Patient Count</h4><div><b>{{name}}</b></div><div>Zip Code: {{ZCTA5CE10}}</div><span>{{display}} patients</span>"
                },
                // non-functioning example
                legendBox: {
                    templates: {
                        root: "<div class='map-title'><h4>Patient Count</h4></div><div class='map-entries'><div>{{entries}}</div></div>",
                        auto: "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min|2}}&ndash;{{~max|2}}</span></div>"
                    }
                }
            },
            {
                regex: "^\\[(.*)\\]([0-9]{5}) - (.*)",
                attribs: [
                    "$normalizer",
                    ["zip5code", "$aggKey"],
                    "text"
                ],
                // non-functioning example
                clickBox: {
                    template: "<b>[{{stateCode}}]</b><br/>{{count}} patients"
                },
                // non-functioning example
                hoverBox: {
                    default: "<h4>Patient Population %</h4>Hover over an area",
                    template: "<h4>Patient Population %</h4><div><b>{{stateCode}}</b></div><div>% of Population: {{$normalizedValue}}</div><span>{{display}} patients</span>"
                },
                // non-functioning example
                legendBox: {
                    templates: {
                        root: "<div class='map-title'><h4>% of Population</h4></div><div class='map-entries'><div>{{entries}}</div></div>",
                        auto: "<div data-color='{{color}}'><i style='background:{{color}}'></i><span>{{~min|2}}%&ndash;{{~max|2}}%</span></div>"
                    }
                }
            }
        ]
    }
}