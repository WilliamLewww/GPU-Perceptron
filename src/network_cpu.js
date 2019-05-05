function NetworkCPU(inputCount, outputCount) {
	var inputCount = inputCount;
	var outputCount = outputCount;
	var input = [];
	var desiredOutput = [];
	var synapseList = [];
	var layerList = [];

	var outputConnected = false;

	var connectOutput = () => {
		if (outputConnected == false) {
			if (synapseList.length == 0) {
				synapseList.push(createMatrixRandom(inputCount, outputCount));
			}
			else {
				synapseList.push(createMatrixRandom(synapseList[synapseList.length - 1][0].length, outputCount));
			}
			outputConnected = true;
		}
	}

	var disconnectOutput = () => {
		if (outputConnected == true) {
			synapseList.pop();
			outputConnected = false;
		}
	}

	this.pushCase = (inputRow, outputRow) => {
		disconnectOutput();

		if (inputRow.length == inputCount && outputRow.length == outputCount) {
			input.push(inputRow);
			desiredOutput.push(outputRow);
		}

		connectOutput();
	}

	this.pushLayer = (neuronCount) => {
		disconnectOutput();

		if (neuronCount > 0) {
			if (synapseList.length == 0) {
				synapseList.push(createMatrixRandom(inputCount, neuronCount));
			}
			else {
				synapseList.push(createMatrixRandom(synapseList[synapseList.length - 1][0].length, neuronCount));
			}
		}

		connectOutput();
	}

	this.propagateF = (printError = false) => {
		layerList = [input];
		for (var x = 0; x < synapseList.length; x++) {
			layerList.push(activateLayer(math.multiply(layerList[x],synapseList[x]), logsig));
		}

		var error = math.subtract(desiredOutput, layerList[layerList.length - 1]);

		this.updateVisualiser();
		if (printError) { console.log(math.sum(math.abs(error))); }
		return [layerList[layerList.length - 1], math.sum(math.abs(error))];
	}

	this.propagateFB = (loopCount = 1, printError = false) => {
		for (var iteration = 0; iteration < loopCount; iteration++) {
			layerList = [input];
			for (var x = 0; x < synapseList.length; x++) {
				layerList.push(activateLayer(math.multiply(layerList[x],synapseList[x]), logsig));
			}

			var errorList = [math.subtract(desiredOutput, layerList[layerList.length - 1])];
			var deltaList = [math.dotMultiply(errorList[errorList.length - 1], activateLayer(layerList[layerList.length - 1], logsig, true))];

			for (var x = 0; x < synapseList.length - 1; x++) {
				errorList.push(math.multiply(deltaList[x], math.transpose(synapseList[synapseList.length - 1 - x])));
				deltaList.push(math.dotMultiply(errorList[x + 1], activateLayer(layerList[layerList.length - 2 - x], logsig, true)));
			}

			for (var x = synapseList.length - 1; x >= 0; x--) {
				synapseList[x] = math.add(synapseList[x], math.multiply(math.transpose(layerList[x]), deltaList[deltaList.length - 1 - x]));
			}
		}

		this.updateVisualiser();
		if (printError) { console.log(math.sum(math.abs(errorList[0]))); }
		return [layerList[layerList.length - 1], math.sum(math.abs(errorList[0]))];
	}

	//Network Visualizer
	var nodeWidth = 25;
	var nodeHeight = 25;
	var rectangleList = [];
	var lineList = [];
	this.initializeVisualizer = () => {
		var distanceX = SCREEN_WIDTH / (synapseList.length + 1);
		var distanceY = SCREEN_HEIGHT / inputCount;
		var previousNeuronCount = inputCount;
		var previousRectangleCount = 0;
		for (var x = 0; x < inputCount; x++) {
			rectangleList.push(new Rectangle((distanceX / 2) - (nodeWidth / 2), ((distanceY * x) + (distanceY / 2)) - (nodeHeight / 2), nodeWidth, nodeHeight));
		}

		for (var x = 0; x < synapseList.length; x++) {
			distanceY = SCREEN_HEIGHT / synapseList[x][0].length;
			for (var y = 0; y < synapseList[x][0].length; y++) {
				rectangleList.push(new Rectangle((distanceX * (x + 1)) + (distanceX / 2) - (nodeWidth / 2), ((distanceY * y) + (distanceY / 2)) - (nodeHeight / 2), nodeWidth, nodeHeight));
				for (var z = 0; z < previousNeuronCount; z++) {
					lineList.push(new Line(rectangleList[z + previousRectangleCount].x + (nodeWidth / 2), rectangleList[z + previousRectangleCount].y + (nodeHeight / 2), rectangleList[rectangleList.length - 1].x + (nodeWidth / 2), rectangleList[rectangleList.length - 1].y + (nodeHeight / 2)));
				}
			}
			previousRectangleCount += previousNeuronCount;
			previousNeuronCount = synapseList[x][0].length;
		}
	}

	this.updateVisualiser = () => {
		var counter = 0;
		var inputCase = document.getElementById('visual-input-case').value;
		if (inputCase > input.length - 1) { inputCase = input.length - 1; }
		if (inputCase < 0) { inputCase = 0; }

		for (var x = 0; x < layerList.length; x++) {
			for (var y = 0; y < layerList[x][inputCase].length; y++) {
				rectangleList[counter].color[0] = (1.0 - layerList[x][inputCase][y]) * 255.0;
				rectangleList[counter].color[1] = (layerList[x][inputCase][y]) * 255.0;
				counter += 1;
			}
		}

		var counter = 0;
		for (var x = 0; x < synapseList.length; x++) {
			for (var y = 0; y < synapseList[x].length; y++) {
				for (var z = 0; z < synapseList[x][y].length; z++) {
					lineList[counter].color[0] = (1.0 - synapseList[x][y][z]) * 255.0;
					lineList[counter].color[1] = (synapseList[x][y][z]) * 255.0;
					counter += 1;
				}
			}
		}
	}

	this.draw = () => {
		lineList.forEach(line => { line.draw(); });
		rectangleList.forEach(rectangle => { rectangle.draw(); });
	}
}

var logsig = (value, derivative = false) => {
	if (derivative) { return value * (1 - value); }
	return 1 / (1 + Math.exp(-value));
}

var purelin = (value, derivative = false) => {
	if (derivative) { return 1; }
	return value;
}

var tanh = (value, derivative = false) => {
	if (derivative) { return 1 - (Math.pow(Math.tanh(value), 2)); }
	return Math.tanh(value);
}

function activateLayer(matrix, activationFunction, derivative = false) {
	tempMatrix = [];
	for (var y = 0; y < matrix.length; y++) {
		tempMatrix.push([]);
		for (var x = 0; x < matrix[y].length; x++) {
			tempMatrix[y].push(activationFunction(matrix[y][x], derivative));
		}
	}

	return tempMatrix;
}

function activateLayer(matrix, activationFunction, derivative = false) {
	tempMatrix = [];
	for (var y = 0; y < matrix.length; y++) {
		tempMatrix.push([]);
		for (var x = 0; x < matrix[y].length; x++) {
			tempMatrix[y].push(activationFunction(matrix[y][x], derivative));
		}
	}

	return tempMatrix;
}

function createMatrixRandom(col, row) {
	tempMatrix = [];

	for (var y = 0; y < col; y++) {
		tempMatrix.push([]);
		for (var x = 0; x < row; x++) {
			tempMatrix[y].push(Math.random());
		}
	}

	return tempMatrix;
}