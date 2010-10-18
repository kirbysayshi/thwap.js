function Scroller(){
	
	CBasic.call(this, V3.$(2400, 480, 0));
	
	this.scrollFocus = {};
	this.scrollOffset = V3.$(0,0,0);
	
	this.ID = new ID(false);
	
	this.InitBasicRenderer(640, 480, 60);
	this.InitBodies();
	this.StartBasicRun(this);
}

ChildInheritsParent(Scroller, CBasic);

Scroller.prototype.BasicRender = function(){
	
	this.CheckInput(this.deltaT);
	this.scrollFocus.CheckJumpFall();
	
	CBasic.prototype.BasicRender.call(this);
}

Scroller.prototype.InitBodies = function(){
	// build bodies
	
	// create "ground"
	var m = new CMesh();
	var vs = [
		  V3.$(0, 440, 0)
		, V3.$(600, 440, 0)
		, V3.$(1200, 280, 0)
		, V3.$(1250, 440, 0)
		, V3.$(2400, 440, 0)
		, V3.$(2400, 480, 0)
		, V3.$(0, 480, 0)
	];
	m.SetVertices(vs, 7, true);
	this.bodies.NewMesh( m );
	
	var b = new Hero( V3.$(100, 20, 0) );
	
	var setup = [
		// new CRectangularBox(V3.$(82.5, 320, 0), 10, 20, 10, 11, 0.5)
		//,new CRectangularBox(V3.$(60,   340, 0), 50, 10, 10, 11, 0.5)
		//,new CRectangularBox(V3.$(60,   350, 0), 10, 90, 10, 11, 0.5)
		//,new CRectangularBox(V3.$(100,  350, 0), 10, 90, 10, 11, 0.5)
		 new CBox(V3.$(60, 362, 0), 10, 10, 11, 0.5)
		,new CBox(V3.$(60, 384, 0), 10, 10, 11, 0.5)
		,new CBox(V3.$(60, 406, 0), 10, 10, 11, 0.5)
		,new CBox(V3.$(60, 428, 0), 10, 10, 11, 0.5)
	];
	
	var self = this;
	
	setup.forEach(function(e){
		self.bodies.NewBody(e);
	})
	
	this.bodies.NewBody(b);
	
	this.SetScrollFocus(b);
	
	this.bodies.AddWorldForce(V3.$(0, 100, 0)); // gravity
}

Scroller.prototype.GetScrollAmount = function(){
	var amount = V3.$(0,0,0);
	var limit = V3.$( this.worldD[0]-this.viewport[0], this.worldD[1]-this.viewport[1], 0 );
	var diff = V3.sub(this.scrollFocus.GetBoundingPos(), V3.$(this.viewport[0] * 0.5, this.viewport[1] * 0.5, 0));

	// need to scroll right?
	if( diff[0] > 0.1 ){
		amount[0] += diff[0];
	}
	// need to scroll left?
	if( diff[0] < -0.1 ){
		amount[0] += diff[0];
	}
	// need to scroll up?
	if( diff[1] > 0.1 ){
		amount[1] += diff[1];
	}
	// need to scroll down?
	if( diff[1] < -0.1 ){
		amount[1] += diff[1];
	}
	
	// correct to prevent from scrolling passed world bounds
	if(amount[0] < 0) amount[0] = 0;
	if(amount[1] < 0) amount[1] = 0;
	if(amount[0] > limit[0]) amount[0] = limit[0];
	if(amount[1] > limit[1]) amount[1] = limit[1];
	
	return amount;
}

Scroller.prototype.SetScrollFocus = function(body){
	this.scrollFocus = body;
}

Scroller.prototype.BasicMouseClickHandler = function(e){
	var mouseX = e.clientX - this.canvas.offsetLeft;
	var mouseY = e.clientY - this.canvas.offsetTop;
	var pos = this.scrollFocus.GetBoundingPos();
	var dir = V3.neg(V3.direction(pos, [mouseX, mouseY, 0]));
	
	var p = new CSoftBody( V3.add(pos, V3.scale(dir, this.scrollFocus.GetBoundingRad()))
		, 3, 8, 5, 1, 0.5 );
	
	this.bodies.NewBody(p);
	p.AddForce( V3.scale(dir, 10000) );
}

Scroller.prototype.BasicKeyHandler = function(e){
	if (e.keyCode == ID.ESCAPE)
		clearInterval(this.INTERVALREFERENCE);
}

Scroller.prototype.CheckInput = function(dt){
	this.ID.Update(dt);
	
	if( this.ID.IsKeyDown(ID.D) ){ this.scrollFocus.MoveRight(); }
	if( this.ID.IsKeyDown(ID.A) ){ this.scrollFocus.MoveLeft();  }
	
	//this.scrollFocus.AddForce(V3.$( this.ID.IsKeyDown(ID.D) ? 150 : 0, 0, 0));
	//this.scrollFocus.AddForce(V3.$( this.ID.IsKeyDown(ID.A) ? -150 : 0, 0, 0));
	//this.scrollFocus.AddForce(V3.$( 0, this.ID.IsKeyDown(ID.S) ? 150 : 0, 0));
	//this.scrollFocus.AddForce(V3.$( 0, this.ID.IsKeyDown(ID.W) ? -550 : 0, 0));
	if( this.ID.IsNewKeyPress(ID.SPACE) ) this.scrollFocus.Jump();
	//if (this.ID.IsKeyDown(ID.SPACE)) this.scrollFocus.Thrust( this.ID.TimePressed(ID.SPACE) );
	
}