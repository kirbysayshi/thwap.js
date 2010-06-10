function Edge(world, body, pV1, pV2, pBoundary){
	if(arguments[4] == undefined){
		pBoundary = true;
	}
	
	this.v1 = pV1, // set boundary vertices
	this.v2 = pV2;
	
	// calculate original length
	this.length = Math.hypot(pV2.position.x - pV1.position.x, pV2.position.y - pV1.position.y);
	this.boundary = pBoundary;
	this.parent = body;
	body.addEdge( this ); // add the edge to givenbody and physics sim
	world.addEdge( this );
	
}