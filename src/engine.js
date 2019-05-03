var SCREEN_WIDTH = 1000;
var SCREEN_HEIGHT = 300;

var gl;
var programList = [];

var joiner;

function initialize() {
	var canvas = document.getElementById("glCanvas");
	gl = canvas.getContext("experimental-webgl");
	resize();
	addListeners();

	programList.push(createProgram(VERTEX_SHADER_1, FRAGMENT_SHADER_1));

	joiner = new Joiner();
	joiner.initialize();

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	mainLoop();
}

function resize() {
	scaleX = (window.innerWidth / (SCREEN_WIDTH + 50));
	scaleY = (window.innerHeight / (SCREEN_HEIGHT + 50));
	scaleMin = Math.min(scaleX, scaleY);

	if (scaleMin <= 1.0) {
		gl.canvas.width = (SCREEN_WIDTH * scaleMin);
		gl.canvas.height = (SCREEN_HEIGHT * scaleMin);
	}
	else {
		scaleMin = 1.0;
		gl.canvas.width = SCREEN_WIDTH;
		gl.canvas.height = SCREEN_HEIGHT;
	}
}

var inputSettingsDiv = document.getElementById('input-settings');
var inputNodeCount = 2;
var layerCount = 3;
function addListeners() {
	document.getElementById('layer-count').value = 3;
	document.getElementById('layer-count').addEventListener('change', (event) => {
		console.log(event.target.value);
	});

	document.getElementById('input-case-1').value = 0;
	document.getElementById('input-case-2').value = 0;
	document.getElementById('output-case-1').value = 0;
	document.getElementById('input-node-count').value = 2;
	document.getElementById('input-node-count').addEventListener('change', (event) => {

	});

	document.getElementById('create-case-button').addEventListener('click', (event) => {
		
	});
}

function mainLoop() {
	update();
	draw();

	requestAnimationFrame(mainLoop);
}

function update() {
	joiner.update();
}

function draw() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	joiner.draw();
}

function createProgram(vertexSource, fragmentSource) {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(vertexShader, vertexSource);
	gl.shaderSource(fragmentShader, fragmentSource);

	gl.compileShader(vertexShader);
	gl.compileShader(fragmentShader);

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	return program;
}