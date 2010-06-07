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
	this.mass = 100; // default mass to 100 "somethings"
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
}

TObject.CIRCLE = "circle";
TObject.RECTANGLE = "rectangle";
TObject.TRIANGLE = "triangle";

// behaviors
TObject.FIXED = "fixed";
TObject.FREE = "free";