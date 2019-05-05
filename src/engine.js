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
var outputNetworkCPU;
function addListeners() {
	document.getElementById('input-case-0').value = 0;
	document.getElementById('input-case-1').value = 0;
	document.getElementById('output-case-0').value = 0;
	document.getElementById('input-node-count').value = 2;
	document.getElementById('input-loop-count').value = 1000;
	document.getElementById('visual-input-case').value = 0;
	document.getElementById('layer-neuron-count').value = 3;

	document.getElementById('setup-input-button').addEventListener('click', (event) => {

	});

	document.getElementById('create-case-button').addEventListener('click', (event) => {
		var inputList = [];
		var outputList = [];
		for (var x = 0; x < joiner.networkCPU.getInputCount(); x++) { inputList.push(document.getElementById('input-case-' + x).value); }
		for (var x = 0; x < joiner.networkCPU.getOutputCount(); x++) { outputList.push(document.getElementById('output-case-' + x).value); }

		joiner.networkCPU.pushCase(inputList, outputList);
		document.getElementById('input-cases').innerHTML = casesToString(joiner.networkCPU.getInputCases());
		document.getElementById('output-cases').innerHTML = casesToString(joiner.networkCPU.getOutputCases());
	});

	document.getElementById('pop-case-button').addEventListener('click', (event) => {
		joiner.networkCPU.popCase();
		document.getElementById('input-cases').innerHTML = casesToString(joiner.networkCPU.getInputCases());
		document.getElementById('output-cases').innerHTML = casesToString(joiner.networkCPU.getOutputCases());
	});

	document.getElementById('create-layer-button').addEventListener('click', (event) => {
		layerCount += 1;
		document.getElementById('hidden-layer-count').innerHTML = "Hidden Layer Count: " + layerCount;
		joiner.networkCPU.pushLayer(document.getElementById('layer-neuron-count').value);
		joiner.networkCPU.initializeVisualizer();
	});

	document.getElementById('pop-layer-button').addEventListener('click', (event) => {
		layerCount -= 1;
		document.getElementById('hidden-layer-count').innerHTML = "Hidden Layer Count: " + layerCount;
		joiner.networkCPU.popLayer();
		joiner.networkCPU.initializeVisualizer();
	});

	document.getElementById('propagate-f-button').addEventListener('click', (event) => {
		outputNetworkCPU = joiner.networkCPU.propagateF();
		var tempString = outputNetworkCPU[0][0][0].toFixed(2);
		for (var x = 1; x < outputNetworkCPU[0].length; x++) { tempString += ", " + outputNetworkCPU[0][x][0].toFixed(2); }
		document.getElementById('printed-output').innerHTML = tempString;
		document.getElementById('printed-error').innerHTML = outputNetworkCPU[1];
	});

	document.getElementById('propagate-fb-button').addEventListener('click', (event) => {
		outputNetworkCPU = joiner.networkCPU.propagateFB(document.getElementById('input-loop-count').value);
		var tempString = outputNetworkCPU[0][0][0].toFixed(2);
		for (var x = 1; x < outputNetworkCPU[0].length; x++) { tempString += ", " + outputNetworkCPU[0][x][0].toFixed(2); }
		document.getElementById('printed-output').innerHTML = tempString;
		document.getElementById('printed-error').innerHTML = outputNetworkCPU[1];
	});

	document.addEventListener('keydown', (event) => {
		if (event.keyCode == 13) { joiner.networkCPU.propagateF(); }
	});
}

function casesToString(cases) {
	var tempString = "[";
	for (var x = 0; x < cases.length; x++) {
		for (var y = 0; y < cases[x].length; y++) {
			if (y == cases[x].length - 1) {
				tempString += cases[x][y] + "]";
			}
			else {
				tempString += cases[x][y] + ",";
			}
		}
		if (x != cases.length - 1) { tempString += " ["; }
	}

	return tempString;
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