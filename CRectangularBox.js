//-----------------------------------------------------------
// Rectangular Box Body
//-----------------------------------------------------------
function CRectangularBox(xPos, width, height, fParticleMass, iRigidity, fFriction){
	CRigidBody.call(this, iRigidity, fFriction);
	this.SetColor(1.0, 0.3, 0.3, 0.5);
	
	this.SetRigidity(iRigidity);

	var  fillers = []
		,fRad = Math.min(width, height) / 2
		,cornerRad = fRad / 8
		,widerThanTall = width > height ? true : false;
	
	if(widerThanTall === true){
		var widthFillerCount = width / fRad;
		for(var i = 1; i < widthFillerCount; i++){
			fillers.push( V3.add(V3.$(i*fRad, fRad, 0), xPos) )
		}
	} else {
		var heightFillerCount = height / fRad;
		for(var i = 1; i < heightFillerCount; i++){
			fillers.push( V3.add(V3.$(fRad, i*fRad, 0), xPos) )
		}
	}
	
	var corners = [
		  V3.add(V3.$( cornerRad, cornerRad, 0), xPos)
		, V3.add(V3.$( width-cornerRad, cornerRad, 0), xPos)
		, V3.add(V3.$( width-cornerRad, height-cornerRad, 0), xPos)
		, V3.add(V3.$( cornerRad,  height-cornerRad, 0), xPos)
	];
	
	//-----------------------------------------------------------
	// simple square box body Some masses will be set to < 0.0f,
	// marking the particle as unmovable.
	//-----------------------------------------------------------


	for(var v = 0; v < fillers.length; v++){
		this.AddParticle(new CParticle(fillers[v], fRad, fParticleMass));
	}

	for(var c = 0; c < corners.length; c++){
		this.AddParticle(new CParticle(corners[c], cornerRad, fParticleMass));
	}

	this.SetRigidBodyConstraints();
}

ChildInheritsParent(CRectangularBox, CRigidBody);