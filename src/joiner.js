var propagateWithMainLoop = false;

function Joiner() {
	this.networkCPU;

	this.initialize = () => {
		this.networkCPU = new Network(2,1);
		this.networkCPU.pushCase([0,0],[0]);
		this.networkCPU.pushCase([0,1],[1]);
		this.networkCPU.pushCase([1,0],[1]);
		this.networkCPU.pushCase([1,1],[0]);
		this.networkCPU.pushLayer(5);
		this.networkCPU.pushLayer(3);
		this.networkCPU.pushLayer(4);

		this.networkCPU.initializeVisualizer();
	}

	this.update = () => {
		if (propagateWithMainLoop) {
			outputNetworkCPU = this.networkCPU.propagateFBGPU(document.getElementById('input-loop-count').value / 250);
			var tempString = outputNetworkCPU[0][0][0].toFixed(2);
			for (var x = 1; x < outputNetworkCPU[0].length; x++) { tempString += ", " + outputNetworkCPU[0][x][0].toFixed(2); }
			document.getElementById('printed-output').innerHTML = tempString;
			document.getElementById('printed-error').innerHTML = outputNetworkCPU[1];
			document.getElementById('delta-gpu').innerHTML = outputNetworkCPU[2];
		}
	}

	this.draw = () => {
		this.networkCPU.draw();
	}
}