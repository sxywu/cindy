import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

class Step extends Component {

  constructor(props) {
    super(props);
    this.state = {selectedNode: null, selectedLink: null};
  }

  componentDidMount() {
    this.container = d3.select(this.refs.container);

    const nodes = {}; // only keep the nodes that have links

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
      }).style('cursor', 'pointer')
      .on('click', (link) => this.setState({selectedNode: null, selectedLink: link}));

    this.circles = this.container.selectAll('g')
      .data(_.values(nodes)).enter().append('g')
      .style('cursor', 'pointer')
      .attr('transform', d => `translate(${d.fx}, ${d.fy})`)
      .on('click', (node) => this.setState({selectedNode: node, selectedLink: null}));
    this.circles.append('circle')
      .attr('r', 3)
      .attr('fill', '#000')
      .attr('stroke', '#000');
    this.circles.append('text')
      .attr('dy', '.35em')
      .attr('x', 5)
      .style('pointer-events', 'none')
      .text(d => d.label);
  }

  componentDidUpdate() {
    if (this.state.selectedNode) {
      this.clickNode(this.state.selectedNode);
    } else if (this.state.selectedLink) {
      this.clickLink(this.state.selectedLink);
    }
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
      return 0.005;
    });
    this.circles.attr('opacity', d => d.id === node.id || otherNodes[d.id] ? 1 : 0.01);
  }

  clickLink = (link) => {
    const nodes = {};
    this.lines.attr('opacity', d => {
      if (d.story === link.story) {
        nodes[d.source.id] = 1;
        nodes[d.target.id] = 1;
        return 0.5;
      }
      return 0.005;
    });
    this.circles.attr('opacity', d => nodes[d.id] ? 1 : 0.01);
  }

  render() {
    const style = {padding: 80};
    return (
      <div style={style}>
        <svg ref='container' style={{overflow: 'visible', display: 'inline-block'}}
          width={this.props.width} height={this.props.height} />
        <span style={{verticalAlign: 'top', display: 'inline-block',
          width: window.innerWidth - this.props.width - 200, lineHeight: 1.6}}>
          <h1>{this.props.variant}</h1>
          {this.state.selectedLink ?
            this.props.stories[this.state.selectedLink.story].abstract : ''}
        </span>
      </div>
    );
  }
}

export default Step;
