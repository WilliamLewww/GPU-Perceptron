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

var input = [[0,0],[0,1],[1,0],[1,1]];

var desiredOutput = [[0],[1],[1],[1]];

var w0 = createMatrixRandom(2,4);
var w1 = createMatrixRandom(4,3);
var w2 = createMatrixRandom(3,1);

function propagateF(printError = false) {
	var hidden0 = input;
	var hidden1 = activateLayer(math.multiply(hidden0,w0), logsig);
	var hidden2 = activateLayer(math.multiply(hidden1,w1), logsig);
	var hidden3 = activateLayer(math.multiply(hidden2,w2), logsig);

	var eHidden3 = math.subtract(desiredOutput, hidden3);
	if (printError) { console.log(math.sum(math.abs(eHidden3))); }

	return hidden3;
}

function propagateFB(loopCount = 1, printError = false) {
	for (var x = 0; x < loopCount; x++) {
		var hidden0 = input;
		var hidden1 = activateLayer(math.multiply(hidden0,w0), logsig);
		var hidden2 = activateLayer(math.multiply(hidden1,w1), logsig);
		var hidden3 = activateLayer(math.multiply(hidden2,w2), logsig);

		var eHidden3 = math.subtract(desiredOutput, hidden3);
		var dHidden3 = math.dotMultiply(eHidden3, activateLayer(hidden3, logsig, true));

		var eHidden2 = math.multiply(dHidden3, math.transpose(w2));
		var dHidden2 = math.dotMultiply(eHidden2, activateLayer(hidden2, logsig, true));

		var eHidden1 = math.multiply(dHidden2, math.transpose(w1));
		var dHidden1 = math.dotMultiply(eHidden1, activateLayer(hidden1, logsig, true));

		w2 = math.add(w2, math.multiply(math.transpose(hidden2), dHidden3));
		w1 = math.add(w1, math.multiply(math.transpose(hidden1), dHidden2));
		w0 = math.add(w0, math.multiply(math.transpose(hidden0), dHidden1));

		if (printError) { console.log(math.sum(math.abs(eHidden3))); }
	}

	return hidden3;
}