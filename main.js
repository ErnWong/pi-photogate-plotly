const readline = require('readline');
const config = require('./config.json');
const plotly = require('plotly')(config['username'], config['apiKey']);

let stream = [null, null];
function connectStream(id) {
  console.log(`Connecting/ed to stream #${id}.`);
  stream[id] = plotly.stream(config['streamTokens'][id], function(error, response) {
    console.log(error, response);
    console.log(`Connection closed for stream #${id}. Retrying...`);
    stream[id] = null;
    setTimeout(function() {
      connectStream(id);
    }, 1000);
  });
}

let tsvLineFeeds = readline.createInterface({
  input: process.stdin
});

tsvLineFeeds.on('line', function (line) {
  let [g, y] = line.split('\t');
  console.log('data:', line, '\n');
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
});
connectStream(0);
connectStream(1);
