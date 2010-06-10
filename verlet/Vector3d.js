function Vector3d(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;
}

Vector3d.prototype = {
	copy: function(){
		return new Vector3d( this.x, this.y, this.z );
	}
	, add: function(vector){
		this.x += vector.x;
		this.y += vector.y;
		this.z += vector.z;
		return this;
	}
	, subtract: function(vector){
		this.x -= vector.x;
		this.y -= vector.y;
		this.z -= vector.z;
		return this;
	}
	, magnitude: function(){
		return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
	}
	, dot: function(vector){
		return (this.x*vector.x) + (this.y*vector.y) + (this.z*vector.z);
	}
	, distanceTo: function(){
		switch(arguments.length){
			case 1: // we have a TVector
				var arg = arguments[0];
				return Math.sqrt((this.x - arg.x) * (this.x - arg.x) 
					+ (this.y - arg.y) * (this.y - arg.y) 
					+ (this.z - arg.z) * (this.z - arg.z));
				break;
			
			case 3: // we have x, y, z
				return Math.sqrt((this.x - arguments[0]) * (this.x - arguments[0]) 
					+ (this.y - arguments[1]) * (this.y - arguments[1]) 
					+ (this.z - arguments[2]) * (this.z - arguments[2]));
				break;
		}
	}
	, slope2DTo: function(vector){
		if(this.x != vector.x){
			return (vector.y - this.y) / (vector.x - this.x);
		} else
			return false;
	}
	, multiply: function(scalar){
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}
	, normalize: function(){
		var mag = this.magnitude();
		return new Vector3d( this.x / mag, this.y / mag, this.z / mag );
	}
	, getPerpendicularTo: function(vector){
		if(this.x != vector.x){
			var m = this.slope2DTo(vector);
			var dx = vector.x - this.x;
			var dy = vector.y - this.y;
			return new Vector3d(-dy, dx, 0);
		} else {
			return new Vector3d(0,0,0);
		}
	}
	, crossProductTo: function(vector){
		return new Vector(
			this.y*vector.z - this.z*vector.y,
			this.z*vector.x - this.x*vector.z,
			this.x*vector.y - this.y*vector.x
		);
	}
};