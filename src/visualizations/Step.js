import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

const width = 900;
const height = 900;

class Step extends Component {

  componentDidMount() {
    this.container = d3.select(this.refs.container);

    const nodes = {};

    this.lines = this.container.selectAll('path')
      .data(this.props.links).enter().append('path')
      .attr('fill', 'none')
      .attr('stroke-width', 4)
      .attr('stroke', d => d.color)
      .attr('opacity', 0.25)
      .attr('d', d => {
        nodes[d.source.id] = d.source;
        nodes[d.target.id] = d.target;

        const x1 = d.source.fx;
        const y1 = d.source.fy;
        const x2 = d.target.fx;
        const y2 = d.target.fy;

        const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return `M${x1},${y1} A${dist/8},${dist/8} 0 1 1 ${x2},${y2}`;
      });

    this.circles = this.container.selectAll('g')
      .data(_.values(nodes)).enter().append('g')
      .style('cursor', 'pointer')
      .attr('transform', d => `translate(${d.fx}, ${d.fy})`)
      .on('click', this.clickNode);
    this.circles.append('circle')
      .attr('r', 12)
      .attr('fill', '#fff')
      .attr('stroke', '#000');
    this.circles.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .text(d => d.id);
    this.circles.append('text')
      .attr('dy', '.35em')
      .attr('x', 14)
      .style('pointer-events', 'none')
      .text(d => d.label);
  }

  clickNode = (node) => {
    const otherNodes = {}; // nodes on the other side
    this.lines.attr('opacity', d => {
      if (d.source.id === node.id) {
        otherNodes[d.target.id] = 1;
        return 0.5;
      }
      if (d.target.id === node.id) {
        otherNodes[d.source.id] = 1;
        return 0.5;
      }
      return 0.01;
    });
    this.circles.select('circle')
      .attr('stroke-opacity', d => d.id === node.id || otherNodes[d.id] ? 1 : 0.01);
    this.circles.selectAll('text')
      .attr('opacity', d => d.id === node.id || otherNodes[d.id] ? 1 : 0.01);
  }

  render() {
    const style = {padding: 80};
    return (
      <div style={style}>
        <h1>{this.props.variant}:</h1>
        <svg ref='container' style={{overflow: 'visible'}} width={width} height={height} />
      </div>
    );
  }
}

export default Step;
