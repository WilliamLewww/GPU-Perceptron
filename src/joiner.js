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

	}

	this.draw = () => {
		this.networkCPU.draw();
	}
}