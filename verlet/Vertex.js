function Vertex(world, body, posX, posY, posZ, mass, fixed){
	
	this.position = new Vector3d(posX, posY, posZ);
	this.oldPosition = new Vector3d(posX, posY, posZ);
	
	this.acceleration = new Vector3d(0,0,0);
	this.parent = body;
	this.mass = mass;
	this.inverseMass = mass != 0 ? 1/mass: 0;
	this.fixed = fixed == undefined ? false : fixed;
	this.forces = [];
	
	body.addVertex(this);
	world.addVertex(this);
}

Vertex.prototype = {
	applyForce: function(vector3d){
		this.forces.push(vector3d);
	}
	, resetForces: function(){
		this.forces = [];
	}
};