function Physics(width, height, GravitationX, GravitationY, pIterations){
	
	this.axis = new Vector3d(0, 0, 0);
	this.vertices = [], this.edges = [], this.bodies = [];
	
	this.screenWidth = width;
	this.screenHeight = height;
	this.bodyCount = 0;
	this.vertexCount = 0;
	this.edgeCount = 0;
	
	this.worldFriction = 0.01;
	
	this.worldForces = [];
	this.addWorldForce(new Vector3d(GravitationX, GravitationY, 0));
	
	this.iterations = pIterations;
	this.timestep = 1.0;
	
	this.CollisionInfo = {
		depth: 0
		, normal: new Vector3d(0,0,0)
		, e: undefined // Edge
		, v: undefined // Vertex
	};
}

Physics.prototype = {
	addWorldForce: function(vector){
		this.worldForces.push(vector);
	}
	, _updateForces: function(){
		for( var i = 0; i < this.vertexCount; i++ ){
			this.vertices[i].acceleration.replace(0, 0, 0);
			for(var f = 0; f < this.worldForces.length; f++){
				this.vertices[i].acceleration.plusEq( this.worldForces[f] );
			}
			
		}
	}
	, _updateVerlet: function(){
		var tempX, tempY;
		
		for(var i = 0; i < this.vertexCount; i++){
			var v = this.vertices[i];
			tempX = v.position.x;
			tempY = v.position.y;
			v.position.x += v.position.x - v.oldPosition.x + v.acceleration.x * this.timestep*this.timestep;
			v.position.y += v.position.y - v.oldPosition.y + v.acceleration.y * this.timestep*this.timestep;
			v.oldPosition.x = tempX;
			v.oldPosition.y = tempY;
		}
	}
	, _updateEdges: function(){
		for(var i = 0; i < this.edgeCount; i++){
			var e = this.edges[i];
			
			// Calculate the vector between the two vertices
			var v1v2x = e.v2.position.x - e.v1.position.x;
			var v1v2y = e.v2.position.y - e.v1.position.y;
			
			var v1v2Length = Math.hypot(v1v2x, v1v2y); // calculate the current distance
			var diff = v1v2Length - e.length; // calculate the difference from the original
			
			// Normalize
			var len = 1.0 / Math.hypot(v1v2x, v1v2y);
			v1v2x *= len;
			v1v2y *= len;
			
			// Push both vertices apart by half of the difference respectively so the distance between them equals the original length
			e.v1.position.x += v1v2x * diff * 0.5;
			e.v1.position.y += v1v2y * diff * 0.5;
			e.v2.position.x -= v1v2x * diff * 0.5;
			e.v2.position.y -= v1v2y * diff * 0.5;
		}
	}
	, _iterateCollisions: function(){
		for(var i = 0; i < this.iterations; i++ ) { //Repeat this a few times to give more exact results
			//A small 'hack' that keeps the vertices inside the screen. You could of course implement static objects and create
			//four to serve as screen boundaries, but the max/min method is faster
			for (var t = 0; t < this.vertexCount; t++ ) {
				var pos = this.vertices[ t ].position;
				pos.x = Math.max( Math.min( pos.x, this.screenWidth  ), 0.0 );
				pos.y = Math.max( Math.min( pos.y, this.screenHeight ), 0.0 );
			}

			this._updateEdges(); //Edge correction step

			for (var j = 0; j < this.bodyCount; j++) {
				this.bodies[j].calculateCenter(); //Recalculate the center
			}

			for (var b1 = 0; b1 < this.bodyCount; b1++) { //Iterate trough all bodies
				for (var b2 = 0; b2 < this.bodyCount; b2++) {
					if (b1 != b2) {
						if (this._bodiesOverlap(this.bodies[b1], this.bodies[b2])) { //Test the bounding boxes
							if (this._detectCollision(this.bodies[b1], this.bodies[b2])) { //If there is a collision, respond to it
								this._processCollision();
							}
						}
					}
				}
			}
		}
	}
	, _detectCollision: function( b1, b2 ){
		var minDistance = 10000.0; //Initialize the length of the collision vector to a relatively large value
		
		for (var i = 0; i < b1.edgeCount + b2.edgeCount; i++ ) { //Just a fancy way of iterating through all of the edges of both bodies at once
			var e;

			if (i < b1.edgeCount) {
				e = b1.edges[i];
			}
			else {
				e = b2.edges[i - b1.edgeCount];
			}

			//This will skip edges that lie totally inside the bodies, as they don't matter.
			//The boundary flag has to be set manually and defaults to true
			if (e.boundary == false) {
				continue;
			}

			// Calculate the perpendicular to this edge and normalize it
			this.axis.x = e.v1.position.y - e.v2.position.y;
			this.axis.y = e.v2.position.x - e.v1.position.x;
			
			// Normalise
			var len = 1.0/ Math.hypot(this.axis.x, this.axis.y);
			this.axis.x *= len;
			this.axis.y *= len;

			// Project both bodies onto the perpendicular
			var dataA = b1.projectToAxis( this.axis );
			var dataB = b2.projectToAxis( this.axis );

			var distance = this._intervalDistance( dataA.min, dataA.max, dataB.min, dataB.max ); //Calculate the distance between the two intervals

			// If the intervals don't overlap, return, since there is no collision
			if (distance > 0.0) {
				return false;
			}
			else if (Math.abs(distance) < minDistance ) {
				minDistance = Math.abs(distance);

				// Save collision information for later
				this.CollisionInfo.normal.x = this.axis.x;
				this.CollisionInfo.normal.y = this.axis.y;
				this.CollisionInfo.e      = e;    //Store the edge, as it is the collision edge
			}
		}
		
		this.CollisionInfo.depth = minDistance;

		if (this.CollisionInfo.e.parent != b2) { //Ensure that the body containing the collision edge lies in B2 and the one conatining the collision vertex in B1
			var temp = b2;
			b2 = b1;
			b1 = temp;
		}
		
		// int Sign = SGN( CollisionInfo.Normal.multiplyVal( B1.Center.minus(B2.Center) ) ); //This is needed to make sure that the collision normal is pointing at B1
		var xx = b1.center.x - b2.center.x;
		var yy = b1.center.y - b2.center.y;
		var mult = this.CollisionInfo.normal.x * xx + this.CollisionInfo.normal.y * yy;

		// Remember that the line equation is N*( R - R0 ). We choose B2->Center as R0; the normal N is given by the collision normal

		if (mult < 0) {
			// Revert the collision normal if it points away from B1
			this.CollisionInfo.normal.x = 0-this.CollisionInfo.normal.x;
			this.CollisionInfo.normal.y = 0-this.CollisionInfo.normal.y;
		}
		
		var smallestD = 10000.0; //Initialize the smallest distance to a large value

		for (var i = 0; i < b1.vertexCount; i++) {
			// Measure the distance of the vertex from the line using the line equation
			// float Distance = CollisionInfo.Normal.multiplyVal( B1.Vertices[I].Position.minus(B2.Center) );
			xx = b1.vertices[i].position.x - b2.center.x;
			yy = b1.vertices[i].position.y - b2.center.y;
			var distance = this.CollisionInfo.normal.x * xx + this.CollisionInfo.normal.y * yy;

			if (distance < smallestD) { //If the measured distance is smaller than the smallest distance reported so far, set the smallest distance and the collision vertex
				smallestD = distance;
				this.CollisionInfo.v = b1.vertices[i];
			}
		}

		return true; //There is no separating axis. Report a collision!
	}
	, _processCollision: function(){
		var e1 = this.CollisionInfo.e.v1;
		var e2 = this.CollisionInfo.e.v2;

		var collisionVectorX = this.CollisionInfo.normal.x * this.CollisionInfo.depth;
		var collisionVectorY = this.CollisionInfo.normal.y * this.CollisionInfo.depth;

		var t;
		if (Math.abs( e1.position.x - e2.position.x ) > Math.abs( e1.position.y - e2.position.y ) ) {
			t = ( this.CollisionInfo.v.position.x - collisionVectorX - e1.position.x )/(  e2.position.x - e1.position.x );
		}
		else {
			t = ( this.CollisionInfo.v.position.y - collisionVectorY - e1.position.y )/(  e2.position.y - e1.position.y );
		}

		var lambda = 1.0/( t*t + ( 1 - t )*( 1 - t ) );
		var edgeMass = t*e2.parent.mass + ( 1 - t )*e1.parent.mass; //Calculate the mass at the intersection point
		var invCollisionMass = 1.0/( edgeMass + this.CollisionInfo.v.parent.mass );

		var ratio1 = this.CollisionInfo.v.parent.mass*invCollisionMass;
		var ratio2 = edgeMass*invCollisionMass;

		e1.position.x -= collisionVectorX * (( 1 - t )*ratio1*lambda);
		e1.position.y -= collisionVectorY * (( 1 - t )*ratio1*lambda);
		e2.position.x -= collisionVectorX * (    t    *ratio1*lambda);
		e2.position.y -= collisionVectorY * (    t    *ratio1*lambda);
		
		this.CollisionInfo.v.position.x += collisionVectorX * ratio2;
		this.CollisionInfo.v.position.y += collisionVectorY * ratio2;
	}
	, _intervalDistance: function(minA, maxA, minB, maxB) {
		if (minA < minB) {
			return minB - maxA;
		}
		else {
			return minA - maxB;
		}
	}
	/**
	 * Used for optimization to test if the bounding boxes of two bodies overlap.
	 * @param B1
	 * @param B2
	 * @return
	 */
	, _bodiesOverlap: function( B1, B2 ) {
		return ( B1.minX <= B2.maxX ) && ( B1.minY <= B2.maxY ) && ( B1.maxX >= B2.minX ) && ( B2.maxY >= B1.minY );
	}
	, update: function(){
		this._updateForces();
		this._updateVerlet();
		this._iterateCollisions();
	}
	, render: function(ctx){
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
		
		ctx.strokeStyle = 'red';

		//ctx.save();
		for (var i = 0; i < this.edgeCount; i++ ) {
			ctx.beginPath();
			ctx.moveTo( this.edges[ i ].v1.position.x, this.edges[ i ].v1.position.y );
			ctx.lineTo( this.edges[ i ].v2.position.x, this.edges[ i ].v2.position.y );
			ctx.closePath();
			ctx.stroke();
		}

		ctx.fillStyle ="#FFFFFF";

		for (var i = 0; i < this.vertexCount; i++ ) {
			ctx.beginPath();
			ctx.arc( this.vertices[ i ].position.x, this.vertices[ i ].position.y, 2, 0, Math.PI*2, false );
			ctx.stroke();
		}
	}
	, addBody: function(Body) {
		this.bodies[this.bodyCount++] = Body;
	}	
	, addEdge: function(E) {
		this.edges[this.edgeCount++] = E;
	}
	, addVertex: function(V) {
		this.vertices[this.vertexCount++] = V;
	}
	, findVertex: function( X, Y ) {
		var nearestVertex = null;
		var minDistance = 1000.0;

		var coords = new Vector3d( X, Y, 0 );

		for (var i = 0; i < this.vertexCount; i++ ) {
			var distance = Math.hypot(this.vertices[ i ].position.x - coords.x, this.vertices[ i ].position.y - coords.y);

			if (distance < minDistance ) {
				nearestVertex = this.vertices[ i ];
				minDistance = distance;
			}
		}

		return nearestVertex;
	}
};

Physics.MAX_BODIES = 256;  //Maximum body/vertex/edgecount the physics simulation can handle
Physics.MAX_VERTICES = 1024;
Physics.MAX_EDGES = 1024;
Physics.MAX_BODY_VERTICES = 10; //Maximum body/edge count a body can contain
Physics.MAX_BODY_EDGES = 10;