// for type == CIRCLE
// type, radius, center TVector
// for type == RECTANGLE
// type, dimensions TVector, position TVector
function TObject(type){
	this.type = type;
	
	this.name = "thwapobj_" + Math.floor(Math.random() * 256000000 + new Date().getTime());
	this.active = true; // determines if obj should be included in calcs
	
	this.a = new TVector(0, 0, 0);
	this.v = new TVector(0, 0, 0);
	this.gridPosition = {col: 0, row: 0};
	this.id = 0; // this is assigned when added to the world
	
	switch(type){
		case TObject.CIRCLE:
			this.radius = arguments[1];
			this.position = arguments[2] || new TVector(0, 0, 0); // TVector, center of circle
			break;
		case TObject.RECTANGLE:
			this.dimensions = arguments[1];
			this.position = arguments[2]; // TVector, center of rectangle
			break;
	}
	
	// default to free movement
	this.behavior = TObject.FREE;
	this.drag = 0.95; // default drag or friction
	this.mass = 10; // default mass to 10 "somethings"
}

TObject.prototype.setPosition = function(){
	switch(arguments.length){
		case 1: // TVector
			this.postion = arguments[0];
			break;
		case 3: // x, y, z
			this.position.x = arguments[0];
			this.position.y = arguments[1];
			this.position.z = arguments[2];
			break;
	}
	this.updateWorldGridLocation();
}

//TObject.prototype.step = function(){
//	this.calculateVelocity();
//}
//
TObject.prototype.updateWorldGridLocation = function(){
	this.gridPosition = this.GRID.translatePointToGrid(this.position);
	var cell = this.GRID.getCellAt(this.gridPosition.col, this.gridPosition.row);
	if(cell !== undefined) cell.add(this);
	else this.active = false;
}

TObject.prototype.applyVelocity = function(){
	this.position.x += this.v.x;
	this.position.y += this.v.y;
	this.position.z += this.v.z;
	
	// could also be:
	// this.position.add(this.v);
	
	this.updateWorldGridLocation();
};

TObject.prototype.applyImpulseForce = function(tVectorF){
	this.a.add(tVectorF);
}

TObject.prototype.thrustRight = function(force){
	this.a.x += force;
};

TObject.prototype.thrustLeft = function(force){
	this.a.x -= force;
};

TObject.prototype.calculateVelocity = function(){
	if(this.behavior != TObject.FIXED){
		this.a.x *= this.drag;
		this.a.y *= this.drag;
		this.a.z *= this.drag;
	
		this.v.x *= this.drag;
		this.v.y *= this.drag;
		this.v.z *= this.drag;
	
		if(this.a.x > -0.01 && this.a.x < 0.01) this.a.x = 0;
		if(this.a.y > -0.01 && this.a.y < 0.01) this.a.y = 0;
		if(this.a.z > -0.01 && this.a.z < 0.01) this.a.z = 0;
	
		if(this.v.x > -0.01 && this.v.x < 0.01) this.v.x = 0;
		if(this.v.y > -0.01 && this.v.y < 0.01) this.v.y = 0;
		if(this.v.z > -0.01 && this.v.z < 0.01) this.v.z = 0;
	
		this.v.x = (this.v.x + this.a.x);
		this.v.y = (this.v.y + this.a.y);
		this.v.z = (this.v.z + this.a.z);
	}
};

TObject.prototype.toVectorArray = function(){
	switch(this.type){
		case TObject.CIRCLE:
			return [this.position];
			break;
		case TObject.RECTANGLE:
			var points = [];
			// top left
			points[0] = new TVector(this.position.x - (this.dimensions.x / 2),
				this.position.y - (this.dimensions.y / 2),
				this.position.z - (this.dimensions.z / 2));
			// top right
			points[1] = new TVector(this.position.x + (this.dimensions.x / 2),
				this.position.y - (this.dimensions.y / 2),
				this.position.z - (this.dimensions.z / 2));
			// bottom left
			points[2] = new TVector(this.position.x - (this.dimensions.x / 2),
				this.position.y + (this.dimensions.y / 2),
				this.position.z - (this.dimensions.z / 2));
			// bottom right
			points[3] = new TVector(this.position.x + (this.dimensions.x / 2),
				this.position.y + (this.dimensions.y / 2),
				this.position.z - (this.dimensions.z / 2));
			return points;
			break;
	}
};

// returns an array of two points, the top left, and bottom right, defining the box
TObject.prototype.getAABB = function(){
	switch(this.type){
		case TObject.CIRCLE:
			return [
				new TVector(this.position.x - this.radius, 
					this.position.y - this.radius, 
					this.position.z - this.radius),
				new TVector(this.position.x + this.radius, 
					this.position.y + this.radius, 
					this.position.z + this.radius)];
			break;
		case TObject.RECTANGLE:
			return [
				new TVector(this.position.x - (this.dimensions.x / 2),
					this.position.y - (this.dimensions.y / 2),
					this.position.z - (this.dimensions.z / 2)),
				new TVector(this.position.x + (this.dimensions.x / 2),
					this.position.y + (this.dimensions.y / 2),
					this.position.z - (this.dimensions.z / 2))];
			break;
	}
}

TObject.prototype.testCollision = function(obj2){
	var oAABB = this.getAABB();
	var o2AABB = obj2.getAABB();

	// perform basic aabb test
	if(oAABB[0].x < o2AABB[1].x && oAABB[1].x > o2AABB[0].x
	&& oAABB[0].y < o2AABB[1].y && oAABB[1].y > o2AABB[0].y){
		//console.log("AABB INTERSECT");
		
		// do more intense calc here depending on shape
		
		this.handleCollision(obj2);
	}
};

TObject.prototype.handleCollision = function(obj2){
	var delta = this.position.copy().subtract(obj2.position);
	var d = delta.magnitude();
	var mtd = delta.copy().multiplyScalar( (( (this.radius || (this.dimensions.x / 2)) + (obj2.radius || (obj2.dimensions.x / 2)) ) - d) / d );
	
	var im1 = 1 / this.mass;
	var im2 = 1 / obj2.mass;
	if(this.behavior == TObject.FREE)
		this.position.add( mtd.copy().multiplyScalar(im1 / (im1 + im2)) );
	if(obj2.behavior == TObject.FREE)
		obj2.position.subtract( mtd.copy().multiplyScalar( im2 / (im1 + im2) ) );
	
	var v = this.v.copy().subtract(obj2.v);
	var vn = v.dot( mtd.normalize() );
	
	if(vn > 0.0) return; // should this be return?
	
	// the second 1 is restitution
	var i = ( -(1 + 0.85) * vn ) / (im1 + im2);
	var impulse = mtd.copy().multiplyScalar(i).multiplyScalar(0.01); // the 0.01 is to tone things down a bit
	
	if(this.behavior == TObject.FREE)
		this.v.multiplyScalar(-1);
	if(obj2.behavior == TObject.FREE)
		obj2.v.multiplyScalar(-1);
	
	if(this.behavior == TObject.FREE)
		this.v.add(impulse.copy().multiplyScalar(im1));
	if(obj2.behavior == TObject.FREE)
		obj2.v.subtract(impulse.copy().multiplyScalar(im2));
};

TObject.CIRCLE = "circle";
TObject.RECTANGLE = "rectangle";
TObject.TRIANGLE = "triangle";

// behaviors
TObject.FIXED = "fixed";
TObject.FREE = "free";