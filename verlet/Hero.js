function Hero(world){
	PhysicsBody.call(this, world, 200);
	
	var lFoot = new Vertex(world, this, 10, 100, 0, 200, false);
	var rFoot = new Vertex(world, this, 30, 100, 0, 200, false);
	var footEdge = new Edge(world, this, lFoot, rFoot, true);
	
	var head = new Vertex(world, this, 20, 0, 0, 200, false);
	var lShoulder = new Vertex(world, this, 10, 20, 0, 200, false);
	var clavical = new Vertex(world, this, 20, 20, 0, 200, false);
	var rShoulder = new Vertex(world, this, 30, 20, 0, 200, false);
	var lCollar = new Edge(world, this, lShoulder, clavical, true);
	var rCollar = new Edge(world, this, rShoulder, clavical, true);
	var neck = new Edge(world, this, head, clavical, false);
	var lNeckStabilizer = new Edge(world, this, lShoulder, head, true);
	var rNeckStabilizer = new Edge(world, this, rShoulder, head, true);
	
	var bellyButton = new Vertex(world, this, 20, 50, 0, 200, false);
	var lKidney = new Vertex(world, this, 10, 50, 0, 200, false);
	var rKidney = new Vertex(world, this, 30, 50, 0, 200, false);
	var lWaist = new Edge(world, this, lKidney, bellyButton, false);
	var rWaist = new Edge(world, this, rKidney, bellyButton, false);
	
	var lAbs = new Edge(world, this, lShoulder, rKidney, false);
	var rAbs = new Edge(world, this, rShoulder, lKidney, false);
	var lLat = new Edge(world, this, lShoulder, lKidney, true);
	var rLat = new Edge(world, this, rShoulder, rKidney, true);
	
	var lLeg = new Edge(world, this, lKidney, lFoot, true);
	var rLeg = new Edge(world, this, rKidney, rFoot, true);
	
	var lXLeg = new Edge(world, this, lKidney, rFoot, false);
	var rXLeg = new Edge(world, this, rKidney, lFoot, false);
	
	lFoot.addConstantForce(new Vector3d(0, 2.5, 0));
	rFoot.addConstantForce(new Vector3d(0, 2.5, 0));
}

Hero.prototype = new PhysicsBody();
Hero.prototype.constructor = Hero;
