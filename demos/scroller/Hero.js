function Hero(xPos){
	
	var r = 10;
	
	this.jumping = false;
	this.falling = false;
	this.maxThrust = 175;
	this.fuel = 5000;
	this.mainPoint = new CParticle( xPos, r*2, 3.5, 0.5 );
	
	// xPos, fBodyRadius, iNumParticles, fParticleMass, iRigidity, fFriction
	//CSoftBody.call(this, xPos, 10, 10, 2, 1, 2);
	CRigidBody.call(this, 2, 2);
	
	for(var i = 0; i < 8; i++){
		var t = (Math.PI * 2.0) * (i / 8);
		var pos = V3.add(xPos, V3.scale(V3.$(Math.cos(t), Math.sin(t), 0), r));
		this.AddParticle( new CParticle( pos, r, 3.5, 0.5 ) );
	}
	
	this.AddParticle( this.mainPoint );
	
	this.SetColor(0.2, 0.6, 1.0, 0.5);
	this.SetRigidBodyConstraints();
}

ChildInheritsParent(Hero, CRigidBody);

Hero.prototype.CheckJumpFall = function(){
	var v = this.GetVelocity()[1];
	if(v > 0.1) { this.falling = true; this.jumping = false; }
	else if(v < -0.1) { this.falling = false; this.jumping = true; }
	else { this.falling = false; this.jumping = false; }
}

Hero.prototype.Jump = function(){
	
	if(this.mainPoint.hasCollidedThisStep == true){
		this.AddForce( V3.$(0, -5500, 0) );
	}
}

Hero.prototype.MoveRight = function(){
	if(this.mainPoint.hasCollidedThisStep == true){
		this.AddForce( V3.$(350, 0, 0) );
	} else {
		// less movement while in the air
		this.AddForce( V3.$(50, 0, 0) );
	}
}

Hero.prototype.MoveLeft = function(){
	if(this.mainPoint.hasCollidedThisStep == true){
		this.AddForce( V3.$(-350, 0, 0) );
	} else {
		// less movement while in the air
		this.AddForce( V3.$(-50, 0, 0) );
	}
}

Hero.prototype.Thrust = function(t){
	
	if(this.fuel > 0)
		this.AddForce( V3.$(0, -1 * Math.min(Math.max(0.5, t), 1) * this.maxThrust, 0) );
	
}