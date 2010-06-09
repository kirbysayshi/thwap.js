// This is more 2d than 3d, but still...
function TGrid(worldDimensions, tilesize){
	
	this.tilesize = tilesize;
	this.world = worldDimensions;
	this.colCount = Math.floor(this.world.x / tilesize);
	this.rowCount = Math.floor(this.world.y / tilesize);
	this.cells = [];
	for(var c = 0; c < this.colCount; c++){
		this.cells[c] = [];
		for(var r = 0; r < this.rowCount; r++){
			this.cells[c][r] = new TCell();
		}
	}
}

TGrid.prototype = {
	getCellAt: function(col, row){
		if(col < this.colCount && row < this.rowCount){
			return this.cells[col][row];
		} else 
			return undefined;
	}
	, translatePointToGrid: function(){
		switch(arguments.length){
			case 1: // TVector
				return { col: Math.floor(arguments[0].x / this.tilesize), 
					row: Math.floor(arguments[0].y / this.tilesize) };
				break;
			case 3: // x, y, z
				return { col: Math.floor(arguments[0] / this.tilesize) , 
					row: Math.floor(arguments[1] / this.tilesize) };
				break;
		}
	}
	, drawGrid: function(ctx){
		ctx.strokeStyle = '#CCCCCCC';
		ctx.strokeWidth = 0.5;
		ctx.beginPath();
		for (var i = 0; i < this.colCount; i++) {
			ctx.moveTo(i * this.tilesize, 0);
			ctx.lineTo(i * this.tilesize, this.world.y);
		}
		for (var j = 0; j < this.rowCount; j++) {
			ctx.moveTo(0, j * this.tilesize);
			ctx.lineTo(this.world.x, j * this.tilesize);
		}
		ctx.closePath();
		ctx.stroke();
	}
};