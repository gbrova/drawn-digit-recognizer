// Canvas drawing stuff inspired by this sweet tutorial
// http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/#demo-simple

var canvasWidth = 400;
var canvasHeight = 400;

function setupCanvas() {
  var canvasDiv = document.getElementById('canvasDiv');
  canvas = document.createElement('canvas');
  canvas.setAttribute('width', canvasWidth);
  canvas.setAttribute('height', canvasHeight);
  canvas.setAttribute('id', 'canvas');
  canvas.style.backgroundColor = 'rgba(127, 127, 127, 0.3)'; // TODO use css?
  canvasDiv.appendChild(canvas);
  if(typeof G_vmlCanvasManager != 'undefined') {
    canvas = G_vmlCanvasManager.initElement(canvas);
  }
  context = canvas.getContext("2d");
}

setupCanvas();

$('#canvas').mousedown(function(e){
  canvasOffset = $("#canvas").offset()
  var mouseX = e.pageX - canvasOffset.left;
  var mouseY = e.pageY - canvasOffset.top;

  paint = true;
  addClick(mouseX, mouseY);
  redraw();
});

var paint = false;

$('#canvas').mousemove(function(e){
  if(paint){
    canvasOffset = $("#canvas").offset()
    var mouseX = e.pageX - canvasOffset.left;
    var mouseY = e.pageY - canvasOffset.top;

    addClick(mouseX, mouseY, true);
    redraw();
  }
});

$('#canvas').mouseup(function(e){
  paint = false;
  updatePrediction();
});

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

function addClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function redraw(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

  context.strokeStyle = "#df4b26";
  context.lineJoin = "round";
  context.lineWidth = 5;

  for(var i=0; i < clickX.length; i++) {
    context.beginPath();
    if(clickDrag[i] && i){
      context.moveTo(clickX[i-1], clickY[i-1]);
     }else{
       context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();
  }
}

function clearCanvas() {
  clickX = [];
  clickY = [];
  clickDrag = [];
  redraw();
}

function clearResults() {
  $("#chart").empty();
}

function redrawResults(values) {
  clearResults()

  var data = values;

  var height = 40,
      barWidth = 40;

  var maxValue = 1; //d3.max(data)
  var x = d3.scale.linear()
      .domain([0, maxValue])
      .range([0, height]);

  var chart = d3.select(".chart")
      .attr("height", height)
      .attr("width", barWidth * data.length);

  var bar = chart.selectAll("g")
      .data(data)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(" + i * barWidth + ", 0)"; });

  bar.append("rect")
      .attr("y", function(d) { return height - x(d); })
      .attr("height", function(d) { return x(d); })
      .attr("width", barWidth - 1);

  bar.append("text")
      .attr("x", barWidth / 2)
      .attr("y", height / 2)
      .attr("dx", ".30em")
      .attr("dy", ".30em")
      .text(function(d, i) { return i; });
}

function updatePrediction() {
  traceObj = JSON.stringify({xs: clickX, ys: clickY});
  $.ajax({
    type: "GET",
    url: $SCRIPT_ROOT + "/digittrace/",
    contentType: "application/json; charset=utf-8",
    data: {trace: traceObj},
    success: function(data) {
        redrawResults(data.proba);
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
    }
  });
}

$(function() {
  $("#clearBtn").click(function() {
      clearCanvas();
      clearResults();
  });
});
