function PhysicsBody(parent, pMass){
	this.center = new Vector3d(0,0,0); // center of mass
	this.vertexCount = 0;
	this.edgeCount = 0;
	this.mass = pMass;
	
	// min/max coordinates of bounding box
	this.minX = 0, this.minY = 0;
	this.maxX = 0, this.maxY = 0;
	
	this.vertices = [];
	this.edges = []
	
	parent.addBody(this);
}

PhysicsBody.prototype = {

	addEdge: function(e){
		this.edges[ this.edgeCount++ ] = e;
	}
	, addVertex: function(v){
		this.vertices[ this.vertexCount++ ] = v;
	}
	, projectToAxis: function(axis){
		var dotP = axis.dot( this.vertices[0].position );
		var data = new MinMax();
		data.min = dotP;
		data.max = dotP; //Set the minimum and maximum values to the projection of the first vertex
		
		for( var i = 0; i < this.vertexCount; i++ ){
			//Project the rest of the vertices onto the axis and extend the interval to the left/right if necessary
			dotP = axis.dot( this.vertices[i].position );
			data.min = Math.min( dotP, data.min );
			data.max = Math.max( dotP, data.max );
		}
		
		return data;
	}
	, calculateCenter: function(){
		this.center.x = 0;
		this.center.y = 0;
		this.center.z = 0;
		
		this.minX = 10000.0;
		this.minY = 10000.0;
		this.maxX = -10000.0;
		this.maxY = -10000.0;
		
		for(var i = 0; i < this.vertexCount; i++){
			this.center.x += this.vertices[ i ].position.x;
			this.center.y += this.vertices[ i ].position.y;
			this.center.z += this.vertices[ i ].position.z;
			
			this.minX = Math.min( this.minX, this.vertices[ i ].position.x );
			this.minY = Math.min( this.minY, this.vertices[ i ].position.y );
			this.maxX = Math.max( this.maxX, this.vertices[ i ].position.x );
			this.maxY = Math.max( this.maxY, this.vertices[ i ].position.y );
		}
		
		this.center.x /= this.vertexCount;
		this.center.y /= this.vertexCount;
		this.center.z /= this.vertexCount;
	}
	, createBox: function(world, x, y, width, height){
		var v1 = new Vertex( world, this, x, 		 y, 0 );
		var v2 = new Vertex( world, this, x + width, y, 0 );
		var v3 = new Vertex( world, this, x + width, y + height, 0 );
		var v4 = new Vertex( world, this, x, 		 y + height, 0 );
		
		new Edge( world, this, v1, v2, true );
		new Edge( world, this, v2, v3, true );
		new Edge( world, this, v3, v4, true );
		new Edge( world, this, v4, v1, true );
		
		new Edge( world, this, v1, v3, false ); // these are cross beams?
		new Edge( world, this, v2, v4, false );
	}
	, createCircle: function(world, x, y, radius, smoothness){
		var points = [];
		var lastPoint = undefined;
		var firstPoint = undefined;
		for(var i = 0; i < smoothness; i++){
			var ratio = 2*Math.PI * (i / smoothness);
			var v = new Vertex(world, this, 
				x + radius*Math.cos( ratio ), 
				y + radius*Math.sin( ratio ), 0);
			if(i == 0) firstPoint = v;
			if(lastPoint != undefined){
				new Edge( world, this, lastPoint, v, true );
			}
			if(i == smoothness-1) {
				new Edge( world, this, v, firstPoint, true );
			}
			lastPoint = v;
			points.push(v);
		}
		
		var l = points.length;
		var middle = Math.floor(l / 2);
		var opposite = 0;
		for(var i = 0; i < l; i++){
			opposite = i + middle;
			if(opposite >= l) opposite -= middle*2;
			new Edge( world, this, points[i], points[opposite], false );
		}
	}
};