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
	document.getElementById('feed-forward-value-0').value = 0;
	document.getElementById('feed-forward-value-1').value = 0;

	//<input id="input-case-0" type="number" step="1" min="-8" max="8" class="textbox-size-medium">
	document.getElementById('setup-input-button').addEventListener('click', (event) => {
		for (var x = 0; x < joiner.networkCPU.getInputCount(); x++) { document.getElementById('input-case-' + x).remove(); }
		document.getElementById('input-output-separate').remove();
		for (var x = 0; x < joiner.networkCPU.getOutputCount(); x++) { document.getElementById('output-case-' + x).remove(); }
		for (var x = 0; x < joiner.networkCPU.getInputCount(); x++) { document.getElementById('feed-forward-value-' + x).remove(); }

		joiner.networkCPU = new Network(parseInt(document.getElementById('input-node-count').value),1);
		joiner.networkCPU.pushLayer(5);
		joiner.networkCPU.pushLayer(3);
		joiner.networkCPU.pushLayer(4);
		joiner.networkCPU.initializeVisualizer();
		document.getElementById('input-cases').innerHTML = '[';
		document.getElementById('output-cases').innerHTML = '[';

		//<input id="feed-forward-value-1" type="number" step="1" min="-100" max="100" class="textbox-size-medium">
		for (var x = 0; x < document.getElementById('input-node-count').value; x++) {
			var newInput = document.createElement('input');
			newInput.setAttribute('id', 'feed-forward-value-' + x);
			newInput.setAttribute('type', 'number');
			newInput.setAttribute('step', '1');
			newInput.setAttribute('min', '-100');
			newInput.setAttribute('max', '100');
			newInput.setAttribute('value', '0');
			newInput.setAttribute('class', 'textbox-size-medium');
			document.getElementById('manipulate-network-div').appendChild(newInput);
		}

		for (var x = 0; x < document.getElementById('input-node-count').value; x++) {
			var newInput = document.createElement('input');
			newInput.setAttribute('id', 'input-case-' + x);
			newInput.setAttribute('type', 'number');
			newInput.setAttribute('step', '1');
			newInput.setAttribute('min', '-8');
			newInput.setAttribute('max', '8');
			newInput.setAttribute('value', '0');
			newInput.setAttribute('class', 'textbox-size-medium');
			document.getElementById('input-settings').appendChild(newInput);
		}

		var inputOutputSeparate = document.createElement('inline');
		inputOutputSeparate.setAttribute('id', 'input-output-separate');
		inputOutputSeparate.innerHTML = '->';
		document.getElementById('input-settings').appendChild(inputOutputSeparate);

		var outputInput = document.createElement('input');
		outputInput.setAttribute('id', 'output-case-' + 0);
		outputInput.setAttribute('type', 'number');
		outputInput.setAttribute('step', '1');
		outputInput.setAttribute('min', '-8');
		outputInput.setAttribute('max', '8');
		outputInput.setAttribute('value', '0');
		outputInput.setAttribute('class', 'textbox-size-medium');
		document.getElementById('input-settings').appendChild(outputInput);
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
		outputNetworkCPU = joiner.networkCPU.propagateFBCPU(document.getElementById('input-loop-count').value);
		var tempString = outputNetworkCPU[0][0][0].toFixed(2);
		for (var x = 1; x < outputNetworkCPU[0].length; x++) { tempString += ", " + outputNetworkCPU[0][x][0].toFixed(2); }
		document.getElementById('printed-output').innerHTML = tempString;
		document.getElementById('printed-error').innerHTML = outputNetworkCPU[1];
		document.getElementById('delta-cpu').innerHTML = outputNetworkCPU[2];
	});

	document.getElementById('propagate-fb-gpu-button').addEventListener('click', (event) => {
		propagateWithMainLoop = !propagateWithMainLoop;
		if (propagateWithMainLoop) { document.getElementById('propagate-fb-gpu-button').setAttribute('class', 'button-green'); }
		else { document.getElementById('propagate-fb-gpu-button').setAttribute('class', 'button-red'); }
	});

	document.getElementById('feed-forward-button').addEventListener('click', (event) => {
		var inputList = [];
		for (var x = 0; x < joiner.networkCPU.getInputCount(); x++) { inputList.push(document.getElementById('feed-forward-value-' + x).value); }
		document.getElementById('printed-feed').innerHTML = joiner.networkCPU.feedForward(inputList);
	});

	document.addEventListener('keydown', (event) => {
		if (event.keyCode == 13) { joiner.networkCPU.propagateF(); }
	});
}

function casesToString(cases) {
	var tempString = "[";
	for (var x = 0; x < cases.length; x++) {
		for (var y = 0; y < cases[x].length; y++) {
			if (y == cases[x].length - 1) { tempString += cases[x][y] + "]"; }
			else { tempString += cases[x][y] + ","; }
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