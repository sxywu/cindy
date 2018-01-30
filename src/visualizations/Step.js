import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

const width = 900;
const height = 900;

class Step extends Component {

  constructor(props) {
    super(props);
    this.simulation = d3.forceSimulation()
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', this.onTick)
      .stop();
  }

  componentDidMount() {
    this.container = d3.select(this.refs.container);

    this.lines = this.container.selectAll('path')
      .data(this.props.links).enter().append('path')
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('stroke', d => d3.interpolateRainbow(d.story / 341)) // 341 is number of stories
      .attr('opacity', 0.25);

    this.circles = this.container.selectAll('g')
      .data(this.props.nodes).enter().append('g')
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
      .text(d => d.label);

    this.simulation.nodes(this.props.nodes)
      .force('link', d3.forceLink(this.props.links).id(d => d.id).distance(100))
      .alpha(1).restart();
  }

  onTick = () => {
    this.circles.attr('transform', d => `translate(${d.x}, ${d.y})`);

    this.lines.attr('d', d => {
      const x1 = d.source.x;
      const y1 = d.source.y;
      const x2 = d.target.x;
      const y2 = d.target.y;

      const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      return `M${x1},${y1} A${dist/8},${dist/8} 0 1 1 ${x2},${y2}`;
    });
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
