import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import Step from './visualizations/Step';

const width = 600;
const height = 1200;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {nodes: [], variants: [], stories: {}};
  }

  componentWillMount() {
    d3.queue()
      .defer(d3.csv, `${process.env.PUBLIC_URL}/data/edgeAllDirected.csv`)
      .defer(d3.csv, `${process.env.PUBLIC_URL}/data/edgeSummaryDirected.csv`)
      .defer(d3.csv, `${process.env.PUBLIC_URL}/data/edgeSummaryUndirected.csv`)
      .defer(d3.csv, `${process.env.PUBLIC_URL}/data/elementNodes.csv`)
      .defer(d3.csv, `${process.env.PUBLIC_URL}/data/elementPercentages.csv`)
      .defer(d3.csv, `${process.env.PUBLIC_URL}/data/stories.csv`)
      .await((err, edgeAllDirected, edgeSummaryDirected, edgeSummaryUndirected,
        elementNodes, elementPercentages, stories) => {

        stories = _.keyBy(stories, s => +s.story_num);

        const nodes = _.chain(elementNodes)
          .map(node => {
            let percent = _.find(elementPercentages, p =>
              p.element_name.toLowerCase() === node.Label.toLowerCase());
            return {
              id: +node.Node,
              label: node.Label,
              percent: parseFloat(percent.avg_pctg),
              std: parseFloat(percent.pctg_sd),
            }
          }).sortBy(node => node.percent)
          .map((node, i) => {
            return Object.assign(node, {
              // fx: (i / elementNodes.length) * width * 0.8,
              fx: width / 2,
              // fx: width * node.std * 0.8 + (height * 0.1),
              fy: (i / elementNodes.length) * height,
            })
          }).value();
        const variants = _.chain(edgeAllDirected)
          .map(link => {
            const story = parseInt(link.Variant.replace('s', ''), 10);
            const variant = stories[story].variant_group;
            return {
              source: _.find(nodes, node => node.id === +link.Source),
              target: _.find(nodes, node => node.id === +link.Target),
              story,
              variant,
            }
          }).groupBy('variant').value();
        // this is all just to assign some meaningless color to the links...
        _.each(variants, links => {
          const numStories = _.chain(links).groupBy('story').size().value();
          _.chain(links).groupBy('story')
            .sortBy(links => links[0].story)
            .each((links, i) => {
              _.each(links, link => {
                link.color = d3.interpolateRainbow(i / numStories);
              })
            }).value();
        });

        this.setState({nodes, variants, stories});
      });
  }

  render() {
    let steps = null;
    if (this.state.nodes.length) {
      steps = _.map(this.state.variants, (links, variant) => {
        const props = {
          nodes: this.state.nodes,
          links, variant,
          stories: this.state.stories,
          width, height,
        }
        return (<Step {...props} />);
      });
    }

    return (
      <div className="App">
        {steps}
      </div>
    );
  }
}

export default App;
