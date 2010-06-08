// world/view are TVectors, assuming 0, 0 is upper left
function Thwap(worldDimensions, viewDimensions, tilesize){
	
	this.world = worldDimensions;
	this.view = viewDimensions;
	this.grid = new TGrid(worldDimensions, tilesize);
	
	// all world objects go in this array, keyed by their unique id given when added
	this.objects = [];
	this.nextId = 0;
	
	this.worldForces = {};
	
	// add grid reference to all objects for ease, make sure this loads AFTER TObject!
	TObject.prototype.GRID = this.grid;
}

Thwap.prototype = {
	
	// run the next step of the simulation
	step: function(){
		
		for(var o in this.objects){
			var obj = this.objects[o];
			if(obj.active == true){
				for(var f in this.worldForces){
					obj.applyImpulseForce(this.worldForces[f]);
				}
				obj.calculateVelocity();
				obj.applyVelocity();
			} else {
				// destroy?!
			}
			
		}
		
		// for each Cell, test basic collision between each object
		var colCount = this.grid.colCount;
		var rowCount = this.grid.rowCount;
		var cells = this.grid.cells;
		// TODO: add a lookup table of paired objects, to prevent checking twice
		
		for(var c = 0; c < colCount; c++){
			for(var r = 0; r < rowCount; r++){
				var cell = cells[c][r];
				// loop through objects in cell, test for collision?
				
				var l = cell.objects.length;
				for(var o = 0; o < l; o++){
					var obj = cell.objects[o];
					if(obj !== undefined){ // arrays are padded for ids...
						var oAABB = obj.getAABB();
						for(var o2 = o + 1; o2 < l; o2++){
							var obj2 = cell.objects[o2];
							if(obj2 !== undefined){
								var o2AABB = obj2.getAABB();
						
								// perform basic aabb test
								if(oAABB[0].x < o2AABB[1].x && oAABB[1].x > o2AABB[0].x
								&& oAABB[0].y < o2AABB[1].y && oAABB[1].y > o2AABB[0].y){
									console.log("AABB INTERSECT");
									
									// do more intense calc here depending on shape
									
									var x = obj.position.copy().subtract(obj2.position);
									x.normalize();
									
									var v1 = obj.v.copy();
									var x1 = x.dot(v1);
									
									var v1x = x.copy().multiplyScalar(x1);
									var v1y = v1.copy().subtract(v1x);
									
									var m1 = obj.mass;
									x.multiplyScalar(-1);
									
									var v2 = obj2.v.copy();
									var x2 = x.dot(v2);
									
									var v2x = x.copy().multiplyScalar(x2);
									var v2y = v2.copy().subtract(v2x);
									
									var m2 = obj2.mass;
									var combinedMass = m1 + m2;
									
									var newVelA = v1x.copy().multiplyScalar( ((m1 - m2) / combinedMass) ).add( v2x.copy().multiplyScalar( ((2 * m2) / combinedMass) )).add(v1y);
									var newVelB = v1x.copy().multiplyScalar( ((2 * m1) / combinedMass) ).add( v2x.copy().multiplyScalar( ((m2 - m1) / combinedMass) )).add(v2y);
									
									if(obj.behavior == TObject.FREE)
										obj.v = newVelA;
									if(obj2.behavior == TObject.FREE)
										obj2.v = newVelB;
								}
							}
						
						}
					}
					
				}
				
				//for(var o in cell.objects){
				//	var obj = cell.objects[o];
				//	for(var o2 in cell.objects){
				//		
				//		if(cell.objects[o2].name != obj.name){
				//			// if o is a circle, test for length of line to nearest edge of o2
				//			// if length <= radius, collision
				//			switch(obj.type){
				//				case TObject.CIRCLE:
				//					var obj2 = cell.objects[o2];
				//					if(obj2.type == TObject.RECTANGLE){
				//						var poly = obj2.toVectorArray();
				//						var nearEdge = TUtil.getNearestPolyEdge(poly, obj.position);
				//						var d = TUtil.dotLineLength(obj.position.x, obj.position.y, 
				//							poly[nearEdge.start].x, poly[nearEdge.start].y, poly[nearEdge.end].x, poly[nearEdge.end].y, true);
				//						if( d <= obj.radius) {
				//							console.log("CIRCLE INTERSECT");
				//							obj.applyImpulseForce( poly[nearEdge.start].getPerpendicularTo( poly[nearEdge.end] ).multiplyScalar(-1) );
				//						}
				//					}
				//					break;
				//				case TObject.RECTANGLE:
				//					var obj2 = cell.objects[o2];
				//					if(obj2.type == TObject.RECTANGLE){
				//						if(obj.position.x - (obj.dimensions.x / 2) < obj2.position.x + (obj2.dimensions.x / 2)
				//						&& obj.position.x + (obj.dimensions.x / 2) > obj2.position.x - (obj2.dimensions.x / 2)
				//						&& obj.position.y - (obj.dimensions.y / 2) < obj2.position.y + (obj2.dimensions.y / 2)
				//						&& obj.position.y + (obj.dimensions.y / 2) > obj2.position.y + (obj2.dimensions.y / 2)){
				//							
				//							var poly = obj2.toVectorArray();
				//							var nearEdge = TUtil.getNearestPolyEdge(poly, obj.position);
				//							var slope = poly[nearEdge.start].slope2DTo( poly[nearEdge.end] );
				//							obj2.applyImpulseForce( poly[nearEdge.start].getPerpendicularTo( poly[nearEdge.end] ).multiplyScalar(-0.15) );
				//							console.log("RECT INTERSECT", slope);
				//						}
				//					}
				//					break;
				//			}
				//		}
				//		
				//		
				//	}
				//	
				//	
				//}
			}
		}
	}
	// add a TObject to the world. Duplicates are your problem!
	, add: function(tObj){
		
		// add to master list, and update obj's gridref
		tObj.id = this.getNextUniqueId();
		this.objects[tObj.id] = tObj;
		//this.objects[tObj.name] = tObj;
		tObj.updateWorldGridLocation();
	}
	// add a global force, like gravity
	, addWorldForce: function(name, tVector){
		this.worldForces[name] = tVector;
	}
	// grabs the next number in the series, should be unique
	, getNextUniqueId: function(){
		return (this.nextId += 1) - 1;
	}
	
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};