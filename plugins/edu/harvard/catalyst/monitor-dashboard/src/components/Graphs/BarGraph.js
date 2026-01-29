import React, {useEffect, useRef} from "react";
import {Box} from "@mui/material";
import PropTypes from "prop-types";
import * as d3 from "d3";
import "./BarGraph.scss";

export const BarGraph = ({ data, xAxisTitle, yAxisTitle }) => {
    const svgRef = useRef();
    const height = 300;
    const width = 400;
    const margin = {top: 10, right: 35, bottom: 70, left: 50};

    const shortenLabel = function(inText, maxLen) {
        if (inText.length > maxLen) {
            let tpos = inText.indexOf(" ",parseInt(maxLen * 0.75));
            if (tpos > 0 && tpos <= maxLen) {
                return inText.substring(0, tpos);
            } else {
                return inText.substring(0, maxLen-3) + "...";
            }
        } else {
            return inText;
        }
    };

    useEffect(() => {
        d3.selectAll(".BarGraph svg > *").remove();
        const svg = d3.select(svgRef.current)
            .attr("width", "100%")
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .classed("svg-body", true)
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        const x = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, width])
            .padding(0.2);

        svg.select(".x-axis").remove();

        let maxHeight = 0;
        // build the X axis
        let x_axis = svg.append("g")
            .classed("x-axis", true)
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(d3.axisBottom(x))

        //add x axis labels
        x_axis.selectAll("text").data(data)
            .text((d) => shortenLabel(d.name, 18))
            .attr("transform", "translate(-10,0)rotate(-45)")
            .classed("graphLabel", true)
            .attr("test", (x, y, z) => {
                let h = z[y].getBoundingClientRect().height;
                if (maxHeight < h) maxHeight = h;
                return h;
            }).append("title")
            .text((d) => {
                return d.name + ": " + d.value;
            });

        //add x-axis title
        x_axis.append("text")
            .classed("x-title", true)
            .text(xAxisTitle)
            .attr("letter-spacing", "1.16")
            .attr("text-anchor", "middle")
            .attr("x", width/2)
            .attr("y", 96)


        //------------------------
        let maxValue = Math.max(...data.map((d) => parseFloat(d.value)));
        let y = d3.scaleLinear()
            .domain([0, maxValue])
            .range([ height-margin.bottom, 0]);
        // build the Y axis
        svg.select(".y-axis").remove();

        let y_axis = svg.append("g")
            .classed("y-axis", true)
            .call(d3.axisLeft(y).tickFormat(d3.format(".2~s")));

        y_axis.append("text")
            .classed("y-title", true)
            .text(yAxisTitle)
            .attr("letter-spacing", "1.16")
            .attr("transform", (x, y, z) => {
                let l = -margin.right;
                let h = (height - z[0].getBoundingClientRect().width) / 2;
                return "translate(" + l + "," + h + ") rotate(-90) ";
            });

        // Bars selection and updating
        // -----------------------------------------------------------------------------------------------------
        let bars = svg.selectAll(".graphbar").data(data);
        // animate transition
        bars.attr("width", x.bandwidth())
            .attr("x", function(d) { return x(d.name); })
            .transition().duration(1000)
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .select('title')
            .text((d) => {
                return d.name + ": " + d.value;
            });

        // create bars for data
        bars.enter().append("rect")
            .classed("graphbar", true)
            .attr("x", function(d) { return x(d.name); })
            .attr("y", function(d) { return y(d.value); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return (height - margin.bottom) - y(d.value); })
            .append("title")
            .text((d) => {
                return d.name + ": " + d.value;
            });

        // delete bars when data is removed
        bars.exit().transition().duration(1000)
            .attr('height', 0)
            .remove();

        if(data.length === 0){
            let noActivityText = x_axis.append("text")
                .classed("nodata", true)
                .text("No Query Activity Found ")
                .attr("letter-spacing", "1.16")
                .attr("text-anchor", "middle")
                .attr("x", width/2)
                .attr("y", (-height/2));

            noActivityText.append("tspan")
                .text("In This Time Frame")
                .attr("x", width/2)
                .attr("dy", "1.5em");
        }
    }, [data]);

    return (
        <Box className={"BarGraph"}>
            <svg ref={svgRef} width={width} height={height}></svg>
        </Box>

    );
}

BarGraph.propTypes = {
    data: PropTypes.arrayOf(PropTypes.objects).isRequired
};