function Vertex(world, body, posX, posY, posZ){
	
	this.position = new Vector3d(posX, posY, posZ);
	this.oldPosition = new Vector3d(posX, posY, posZ);
	
	this.acceleration = new Vector3d(0,0,0);
	this.parent = body;
	
	body.addVertex(this);
	world.addVertex(this);	
}