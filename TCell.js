// one cell of the world grid, used to determine what collisions should be tested
function TCell(){
	this.objects = {};
}

TCell.prototype = {
	add: function(tObject){
		if(!this.objects[tObject.name]){
			this.objects[tObject.name] = tObject;
			return true;
		} else {
			return false;
		}
	}
	, remove: function(tObject){
		if(this.objects[tObject.name]){
			this.objects[tObject.name] = undefined;
			return true;
		} else {
			return false;
		}
	}
};