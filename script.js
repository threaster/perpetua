var a = {
	ctx:false,
	cH:false,
	cW:false,
	canvasId:"canvas",
	spawnChance:2,
	spawnDistance:20,
	idCounter:0,
	minBaseSep:200,
	factions: [
		{
			id:1,
			base: {
				x:470,
				y:70,
				coords:[],
			},
			color:"blue",
			spawn:[],
			units:[],
		},
		{
			id:2,
			base: {
				x:60,
				y:60,
				coords:[]
			},
			color:"red",
			spawn:[],
			units:[],
		},
		{
			id:3,
			base: {
				x:270,
				y:570,
				coords:[],
			},
			color:"green",
			spawn:[],
			units:[],
		},
		{
			id:4,
			base: {
				x:570,
				y:140,
				coords:[],
			},
			color:"purple",
			spawn:[],
			units:[],
		},
	],
	
	setCanvasParams: function() {
		document.getElementById(this.canvasId).setAttribute("width", this.cW);
		document.getElementById(this.canvasId).setAttribute("height", this.cH);
	},
	
	// Sets base params
	setBaseParams: function() {
		var i,
			j,
			flag,
			rand1,
			rand2;
		
		for (i in this.factions) {
			while (true) {
				rand1 = (Math.random() * (this.cW - 60)) + 30;
				rand2 = (Math.random() * (this.cH - 60)) + 30;
				
				flag = false;
				for (j in this.factions) {
					if (this.factions[j].id === this.factions[i].id) { continue; }
					if (this.findDistance([rand1, rand2], [this.factions[j].base.x, this.factions[j].base.y]) < this.minBaseSep) { flag = true; }
				}
				if (!flag) {
					this.factions[i].base.x = rand1;
					this.factions[i].base.y = rand2;
					break;
				}
			}
			this.factions[i].base.health = (Math.random() * 200) + 300;
		}
		
		for (i in this.factions) {
			// coords
			this.factions[i].base.coords = [
				[this.factions[i].base.x - 10, this.factions[i].base.y - 10],
				[this.factions[i].base.x, this.factions[i].base.y - 20],
				[this.factions[i].base.x + 10, this.factions[i].base.y - 10],
				[this.factions[i].base.x + 10, this.factions[i].base.y + 10],
				[this.factions[i].base.x - 10, this.factions[i].base.y + 10]
			];
			
			this.factions[i].unitLimit = 15;
			
			// spawn
			this.factions[i].spawn = [this.factions[i].base.x, this.factions[i].base.y + 15];
		}
		
	},
	
	init: function() {
		this.ctx = document.getElementById(this.canvasId).getContext("2d");
		//this.cH = document.getElementById(this.canvasId).clientHeight;
		//this.cW = document.getElementById(this.canvasId).clientWidth;
		this.cH = document.body.clientHeight;
		this.cW = document.body.clientWidth;
		
		this.setCanvasParams();
		this.setBaseParams();

		this.main();		
	},
		
	main: function() {
		var temp;

		temp = this;
		
		// data processing
		this.moveUnits();
		this.spawnUnits();
		
		
		// drawing the visuals
		this.clearCanvas();
		this.drawBases();
		this.drawUnits();


		requestAnimationFrame(function() { temp.main(); })
	},
	
	clearCanvas: function() {
		this.ctx.clearRect(0, 0, this.cW, this.cH);
	},
	
	drawPolygon: function(coords, color) {
		var i;
		
		this.ctx.beginPath();
		this.ctx.fillStyle = color;
		this.ctx.moveTo(coords[0][0], coords[0][1]);
		for (i in coords) {
			this.ctx.lineTo(coords[i][0], coords[i][1]);
		}
		this.ctx.fill();
		this.ctx.closePath();
	},
	
	drawBases: function() {
		var i;
		
		for (i in this.factions) {
			if (this.factions[i].base.health < 1) { continue; }
			this.drawPolygon(this.factions[i].base.coords, this.factions[i].color);
		}
	},
	
	drawUnits: function() {
		var i,
			j;
			
		for (i in this.factions) {
			for (j in this.factions[i].units) {
				this.drawPolygon(this.factions[i].units[j].coords, this.factions[i].color);
			}
		}
	},
	
	Unit:function(x, y) {
		this.id = false;
		this.x = 0;
		this.y = 0;
		this.coord = [];
		this.target = {};
		this.dmg = (Math.random() * 3) + 6;
		this.factionId = false;
		this.attackCD = 300;
		
		this.setFaction = function(fact) {
			this.factionId = fact;
		}
		
		this.move = function(Mx, My) {
			this.x += Mx;
			this.y += My;
			this.coords = [
				[this.x - 2, this.y - 2],
				[this.x + 2, this.y - 2],
				[this.x + 2, this.y + 2],
				[this.x - 2, this.y + 2]
			];
		};
		this.setTarget = function(Tx, Ty) {
			this.target.x = Tx;
			this.target.y = Ty;
		};
		this.setId = function(id) {
			this.id = id;
		};
		this.move(x, y);
		this.h = 11 - Math.floor(Math.random() * 3);
	},
	
	spawnUnits: function() {
		var i,
			j,
			k,
			unit,
			spawn,
			spawnBlocked;
		
		for (i in this.factions) {
			// Destroyed bases cannot spawn units
			if (this.factions[i].base.health < 1) { continue; }
			
			if (Math.random() * 100 < this.spawnChance && this.factions[i].unitLimit > 0) {
				
				for (k = 0; k < 2 * Math.PI; k += .6) {
					spawnBlocked = false;
					spawn = [
						this.factions[i].base.x + (this.spawnDistance * Math.sin(k)),
						this.factions[i].base.y + (this.spawnDistance * Math.cos(k))
					];
					
					// Check for a blocked spawn point
					for (j in this.factions[i].units) {
						if (this.findDistance(spawn, [this.factions[i].units[j].x, this.factions[i].units[j].y]) < 10) {
							spawnBlocked = true;
							break;
						}
					}
					
					if (spawnBlocked) { continue; }
					
					// Create the unit
					unit = new this.Unit(spawn[0], spawn[1]);
				
					// Determine primary target
					while (this.factions[j] === undefined || j == i ) {
						j = Math.floor(Math.random() * this.count(this.factions));
					}
					j = this.factions[j].base;
					unit.setTarget(j.x, j.y);
				
					// Determine other characteristics of the unit
					unit.setId(this.idCounter);
					unit.setFaction(this.factions[i].id);
					this.idCounter++;
					this.factions[i].units.push(unit);
					this.factions[i].unitLimit--;
					
					// A unit has already been spawned - exit loop
					break;
				}
			}
		}
	},
	
	findTarget: function(factionId, unit) {
		var i,
			j,
			target,
			targetDistance,
			closestTargetDistance,
		
		closestTargetDistance = Infinity;
		for (i in this.factions) {
			// Don't target friendlies
			if (this.factions[i].id === factionId) { continue; }
			
			// Find closest hostile
			for (j in this.factions[i].units) {
				distance = this.findDistance([this.factions[i].units[j].x, this.factions[i].units[j].y], [unit.x, unit.y]);
				if (distance < closestTargetDistance) {
					closestTargetDistance = distance;
					target = this.factions[i].units[j];
				}
			}
		}
		
		// Threshhold distraction distance
		return (closestTargetDistance < 50) ? target : unit.target;
		
	},
	
	attack: function(attacker, defender) {
		var fact;
		
		defender.h -= (Math.random() * attacker.dmg/2) + attacker.dmg/2;
		if (defender.h <= 0) {
			//fact = this.getFactionObjFromId(attacker.factionId);
			//fact.unitLimit += .1;
			this.die(defender);
		}
	},
	
	// Not used
	getFactionObjFromId: function(index) {
		var i;
		
		for (i in this.factions) {
			if (this.factions[i].id === index) {
				return this.factions[i];
			}
		}
		
	},
	
	die: function(unit) {
		var i;
		
		for (i in this.factions) {
			for (j in this.factions[i].units) {
				if (this.factions[i].units[j].id === unit.id) {
					delete this.factions[i].units[j];
					this.factions[i].unitLimit += 1;
					break;
				}
			}
		}
		
	},
	
	moveUnit: function(target, unit) {
		var i,
			j,
			k,
			maxV,
			theta,
			slope,
			dist,
			dX,
			dY;
		
		if (unit.attackCD > 0 ) { unit.attackCD--; }
		
		dist = Infinity;
		for (i in target.coords) {
			dist = Math.min(dist, this.findDistance([target.coords[i][0], target.coords[i][1]], [unit.x, unit.y]));
		}
		if (dist < 6) {
			if (unit.attackCD === 0) {
				unit.attackCD = 300;
				this.attack(unit, target);
			}
			return;	
		}
		
		maxV = .6;
		slope = (target.y - unit.y) / (target.x - unit.x);
		theta = Math.atan(slope);
		
		dX = maxV * Math.cos(theta);
		dY = maxV * Math.sin(theta);
		if (target.x < unit.x) {
			dX *= -1;
			dY *= -1;
		}
		if (!this.checkPlannedMove(unit, dX, dY)) {
			
			slope = -1/slope;
			theta = Math.atan(slope);
			dX = maxV * Math.cos(theta);
			dY = maxV * Math.sin(theta);
			if (!this.checkPlannedMove(unit, dX, dY)) {
				dX *= -1;
				dY *= -1;
			}
			
			if (!this.checkPlannedMove(unit, dX, dY)) { return; }
		}
		
		unit.move(dX, dY);
		
	},
	
	plotPath: function(target) {
		return true;
	},
	
	// Return true if planned move is valid, false otherwise
	checkPlannedMove: function(unit, dX, dY) {
		var i,
			j;
		
		for (i in this.factions) {
			
			//closest enemy is always targeted, so we don't have to worry about collision between units of opposing factions
			if (this.factions[i].id !== unit.factionId) { continue; }
			
			for (j in this.factions[i].units) {
				if (this.factions[i].units[j].id === unit.id) { continue; }
				if (this.findDistance([unit.x + dX, unit.y + dY], [this.factions[i].units[j].x, this.factions[i].units[j].y]) < 5) {
					return false;
				}
				
			}
		}
		
		return true;
	},
	
	moveUnits: function() {
		var i,
			j,
			target;
		
		for (i in this.factions) {
			for (j in this.factions[i].units) {
				
				target = this.findTarget(this.factions[i].id, this.factions[i].units[j]);
				
				this.moveUnit(target, this.factions[i].units[j]);
				
				//this.factions[i].units[j].setCoords(Math.random() * 3, Math.random() * 3);
			}
		}
	},
	
	// Find distance between two sets of coordinates
	findDistance: function(coord1, coord2) {
		var i,
				a;
		
		for (i in coord1) {
			if (isNaN(coord1[i]) || isNaN(coord2[i])) { return Infinity; }
		}
		
		a = Math.sqrt(Math.pow(coord1[1] - coord2[1], 2) + Math.pow(coord1[0] - coord2[0], 2));
		return a;
		
	},
	
	// Find minimum distance between two sets of polygons
	findPolyDist: function(subject, target) {
		var i,
			j,
			min1,
			subCoords,
			tarCoords,
			tarCoords2,
			min2,
			dist;
		
		// Find closest coords
		min1 = Infinity;
		for (i in subject) {
			if (isNaN(subject[i])) { return Infinity; }
			
			for (j in target) {
				if (isNaN(target[j])) { return Infinity; }
				dist = this.findDistance(subject[i], target[j]);
				if (dist < min1) {
					if (dist < min2) {
						min1 = dist;
						subCoords = subject[i];
						tarCoords = target[j];
					}
				}
			}
			
		}
		
		
	},
	
	count: function(obj) {
		var i,
			c;
		
		c = 0;
		for (i in obj) { c++;	}
		return c;
	},
	
	inArray: function(needle, haystack) {
		var i;
		
		for (i in haystack) {
			if (needle === haystack[i]) { return true; }
		}
		
		return false;
	},
	
}
window.onload = function() { a.init(); }





