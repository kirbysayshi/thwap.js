function TVector(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;
}

TVector.prototype = {
	copy: function(){
		return new TVector( this.x, this.y, this.z );
	}
	, add: function(tVector){
		this.x += tVector.x;
		this.y += tVector.y;
		this.z += tVector.z;
		return this;
	}
	, subtract: function(tVector){
		this.x -= tVector.x;
		this.y -= tVector.y;
		this.z -= tVector.z;
		return this;
	}
	, magnitude: function(){
		return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
	}
	, dot: function(tVector){
		return (this.x*tVector.x) + (this.y*tVector.y) + (this.z*tVector.z);
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
	, slope2DTo: function(tVector){
		if(this.x != tVector.x){
			return (tVector.y - this.y) / (tVector.x - this.x);
		} else
			return false;
	}
	, multiplyScalar: function(scalar){
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}
	, normalize: function(){
		var mag = this.magnitude();
		return new TVector( this.x / mag, this.y / mag, this.z / mag );
	}
	, getPerpendicularTo: function(tVector){
		if(this.x != tVector.x){
			var m = this.slope2DTo(tVector);
			var dx = tVector.x - this.x;
			var dy = tVector.y - this.y;
			return new TVector(-dy, dx, 0);
		} else {
			return new TVector(0,0,0);
		}
	}
	, crossProductTo: function(tVector){
		return new TVector(
			this.y*tVector.z - this.z*tVector.y,
			this.z*tVector.x - this.x*tVector.z,
			this.x*tVector.y - this.y*tVector.x
		);
	}
};