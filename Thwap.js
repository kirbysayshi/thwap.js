// world/view are TVectors, assuming 0, 0 is upper left
function Thwap(worldDimensions, viewDimensions, tilesize){
	
	this.world = worldDimensions;
	this.view = viewDimensions;
	this.grid = new TGrid(worldDimensions, tilesize);
	
	// all world objects go in this object, keyed by their "unique" name
	this.objects = {};
	
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
				for(var o in cell.objects){
					var obj = cell.objects[o];
					for(var o2 in cell.objects){
						
						if(cell.objects[o2].name != obj.name){
							// if o is a circle, test for length of line to nearest edge of o2
							// if length <= radius, collision
							switch(obj.type){
								case TObject.CIRCLE:
									var obj2 = cell.objects[o2];
									if(obj2.type == TObject.RECTANGLE){
										var poly = obj2.toVectorArray();
										var nearEdge = TUtil.getNearestPolyEdge(poly, obj.position);
										var d = TUtil.dotLineLength(obj.position.x, obj.position.y, 
											poly[nearEdge.start].x, poly[nearEdge.start].y, poly[nearEdge.end].x, poly[nearEdge.end].y, true);
										if( d <= obj.radius) {
											console.log("CIRCLE INTERSECT");
											obj.applyImpulseForce( poly[nearEdge.start].getPerpendicularTo( poly[nearEdge.end] ).multiplyScalar(-1) );
										}
									}
									break;
								case TObject.RECTANGLE:
									var obj2 = cell.objects[o2];
									if(obj2.type == TObject.RECTANGLE){
										if(obj.position.x - (obj.dimensions.x / 2) < obj2.position.x + (obj2.dimensions.x / 2)
										&& obj.position.x + (obj.dimensions.x / 2) > obj2.position.x - (obj2.dimensions.x / 2)
										&& obj.position.y - (obj.dimensions.y / 2) < obj2.position.y + (obj2.dimensions.y / 2)
										&& obj.position.y + (obj.dimensions.y / 2) > obj2.position.y + (obj2.dimensions.y / 2)){
											
											var poly = obj2.toVectorArray();
											var nearEdge = TUtil.getNearestPolyEdge(poly, obj.position);
											var slope = poly[nearEdge.start].slope2DTo( poly[nearEdge.end] );
											obj2.applyImpulseForce( poly[nearEdge.start].getPerpendicularTo( poly[nearEdge.end] ).multiplyScalar(-0.15) );
											console.log("RECT INTERSECT", slope);
										}
									}
									break;
							}
						}
						
						
					}
					
					
				}
			}
		}
	}
	// add a TObject to the world. Duplicates are your problem!
	, add: function(tObj){
		
		// add to master list, and update obj's gridref
		this.objects[tObj.name] = tObj;
		tObj.updateWorldGridLocation();
	}
	// add a global force, like gravity
	, addWorldForce: function(name, tVector){
		this.worldForces[name] = tVector;
	}
	
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};