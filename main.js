const readline = require('readline');
const config = require('./config.json');
const plotly = require('plotly')(config['username'], config['apiKey']);
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const fs = require('fs');

function log() {
  let d = new Date();
  let timestamp = `[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}]\t`;
  rollingLog.log(timestamp + Array.prototype.slice.call(arguments).join('\t'));
}

let screen = blessed.screen({smartCSR: true});
screen.title = 'Photogate Dashboard';

let grid = new contrib.grid({rows: 3, cols:4, screen: screen});

let helpText = grid.set(2, 3, 1, 1, contrib.markdown);
helpText.setMarkdown('# Controls\n - `<escape>`, `q`, `<Ctr-C>` to quit.\n - `s`, `<Ctr-s>` to submit the current data points.')

let rollingLog = grid.set(2, 0, 1, 2, contrib.log, {
  label: 'Logs'
});

let dataLog = grid.set(2, 2, 1, 1, contrib.log, {
  label: 'Data'
});

let linePlot = grid.set(0, 0, 2, 4, contrib.line, {
  style: {
    showLegend: true
  },
  label: 'Plot',
  wholeNumbersOnly: true
});

let dataYellow = {
  title: 'Yellow',
  x: [],
  y: [],
  style: {line: 'yellow'}
};

let dataGreen = {
  title: 'Green',
  x: [],
  y: [],
  style: {line: 'green'}
};
function initData(data) {
  for (let i = 0; i < 50; i++) {
    data.x.push(i);
    data.y.push(0);
  }
}
initData(dataYellow);
initData(dataGreen);

let stream = [null, null];
function connectStream(id) {
  log(`Connecting/ed to stream #${id}.`);
  stream[id] = plotly.stream(config['streamTokens'][id], function(error, response) {
    log(error, response);
    log(`Connection closed for stream #${id}. Retrying...`);
    stream[id] = null;
    setTimeout(function() {
      connectStream(id);
    }, 1000);
  });
}

let tsvLineFeeds = readline.createInterface({
  input: process.stdin
});

let g = 0;
let y = 0;
tsvLineFeeds.on('line', function (line) {
  [g, y] = line.split('\t');
  dataLog.log(line);
  let d = new Date();
  let t = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()+d.getMilliseconds()/1000}`;
  if (stream[0]) {
    let data0 = JSON.stringify({x: t, y: g});
    stream[0].write(data0 + '\n');
  }
  if (stream[1]) {
    let data1 = JSON.stringify({x: t, y: y});
    stream[1].write(data1 + '\n');
  }
  dataYellow.y.shift();
  dataYellow.y.push(y);
  dataGreen.y.shift();
  dataGreen.y.push(g);
  dataGreen.y[0] = 1;
});


/*
fs.createReadStream('/dev/tty').on('data', function(chunk) {
  log('tty:', chunk, `(len = ${chunk.length})`);
  for (let c of chunk) {
    switch (c) {
      case 'q':
        log('Quiting...');
        if (stream[0]) stream[0].close();
        if (stream[1]) stream[1].close();
        if (stream[2]) stream[2].close();
        process.exit();
        break;
      case 's':
        log('Saving datapoint to scatter plot');
        let data = JSON.stringify({x: g, y: y});
        if (stream[3]) stream[3].write(data + '\n');
        break;
    }
  }
});
*/
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  log('Quiting...');
  process.exit(0);
});
screen.key(['s', 'C-s'], function(ch, key) {
  log('Saving datapoint to scatter plot');
  let data = JSON.stringify({x: g, y: y});
  if (stream[3]) stream[3].write(data + '\n');
});


connectStream(0);
connectStream(1);
connectStream(2);

setInterval(function() {
  linePlot.setData([dataGreen, dataYellow]);
  screen.render();
}, 300);
