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
		
		for(var c = 0; c < colCount; c++){
			for(var r = 0; r < rowCount; r++){
				
				// nearby canidates for collision tests
				var canidates = [];
				
				canidates = canidates.concat(cells[c][r].objects);
				if(cells[c][r-1] !== undefined) canidates = canidates.concat(cells[c][r-1].objects);
				if(cells[c][r+1] !== undefined) canidates = canidates.concat(cells[c][r+1].objects);
				if(cells[c-1] !== undefined) canidates = canidates.concat(cells[c-1][r].objects);
				if(cells[c+1] !== undefined) canidates = canidates.concat(cells[c+1][r].objects);
				
				var l = canidates.length;
				for(var o = 0; o < l; o++){
					var obj = canidates[o];
					if(obj !== undefined){ // arrays are padded for ids...
						
						// test all objs in this cell
						for(var o2 = o + 1; o2 < l; o2++){
							var obj2 = canidates[o2];
							if(obj2 !== undefined && obj2.name != obj.name){
								obj.testCollision(obj2);
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