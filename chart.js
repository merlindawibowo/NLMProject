var plotly = require('plotly')("merlindawibowo", "J2Woo2fyZ4iz00Yac0TH");

var trace1 = {
  x: ["giraffes", "orangutans", "monkeys"],
  y: [20, 14, 23],
  name: "Abstract",
  type: "bar"
};

var trace2 = {
  x: ["giraffes", "orangutans", "monkeys"],
  y: [12, 18, 29],
  name: "Mesh Heading",
  type: "bar"
};

var data = [trace1, trace2];
var layout = {barmode: "group"};
var graphOptions = {layout: layout, filename: "grouped-bar", fileopt: "overwrite"};
plotly.plot(data, graphOptions, function (err, msg) {
    console.log(msg);
});