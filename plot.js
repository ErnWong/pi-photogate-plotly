const config = require('./config.json');
const plotly = require('plotly')(config['username'], config['apiKey']);

let traceGreen = {
  'x': [],
  'y': [],
  'name': 'Green',
  'type': 'scatter',
  'mode': 'lines+markers',
  'stream': {
    'token': config['streamTokens'][0],
    'maxpoints': 100
  },
  'marker': {
    'color': 'green'
  },
  'line': {
    'color': 'green'
  }
};

let traceYellow = {
  'x': [],
  'y': [],
  'name': 'Yellow',
  'type': 'scatter',
  'mode': 'lines+markers',
  'stream': {
    'token': config['streamTokens'][1],
    'maxpoints': 100
  },
  'marker': {
    'color': 'yellow'
  },
  'line': {
    'color': 'yellow'
  }
};

let graphOptions = {
  'filename': 'pi-photgate-stream',
  'fileopt': 'overwrite',
  'layout': {
    'title': 'Photogate live stream',
    'xaxis': {
      'title': 'Time',
      'type': 'datetime'
    },
    'yaxis': {
      'title': 'Frequency / Hz'
    }
  }
};

let data = [traceGreen, traceYellow];

plotly.plot(data, graphOptions, function(error, response) {
  if (error) {
    return console.error('ERROR:', error);
  }
  console.log(response);
});
