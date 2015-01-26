// js/Level.js
Critterer.Level = function(game){
   this.good_objects,
		this.bad_objects,
		this.slashes,
		this.line,
		this.scoreLabel;
		this.score = 0;
        this.points = [];	
        this.fireRate = 1000;
        this.nextFire = 0;
        this.contactPoint = new Phaser.Point(0,0);
   
};

Critterer.Level.prototype = {
    
    
  preload: function() {
       
    
  },
    
  create: function() {
      
    //These are green circles that represent what will be bugs  
    var bmd = this.add.bitmapData(100,100);
	bmd.ctx.fillStyle = '#00ff00';
	bmd.ctx.arc(50,50,50, 0, Math.PI * 2);
	bmd.ctx.fill();
	this.cache.addBitmapData('good', bmd);
    
    //Makes the gravity system 
    this.physics.startSystem(Phaser.Physics.ARCADE);
	this.physics.arcade.gravity.y = 300;

	good_objects = this.createGroup(4, this.cache.getBitmapData('good'));

	slashes = this.add.graphics(0, 0);

    //Puts the label at the top of the screen
	scoreLabel = this.add.text(10,10,'Tip: get the green ones!');
	scoreLabel.fill = 'white';

	this.throwObject();
  },
    
  //Used for making a group of sprites (In our case, bugs)
  createGroup: function(numItems, sprite) {
	var group = this.add.group();
	group.enableBody = true;
	group.physicsBodyType = Phaser.Physics.ARCADE;
	group.createMultiple(numItems, sprite);
	group.setAll('checkWorldBounds', true);
	group.setAll('outOfBoundsKill', true);
	return group;
},

  //The the timer for launching bugs
  throwObject: function() {
	if (this.time.now > this.nextFire && good_objects.countDead()>0) {
		this.nextFire = this.time.now + this.fireRate;
        
		this.throwGoodObject();
	}
},

//The bug launcher
throwGoodObject: function() {
	var obj = good_objects.getFirstDead();
	obj.reset(this.world.centerX + Math.random()*100-Math.random()*100, 600);
	obj.anchor.setTo(0.5, 0.5);
	//obj.body.angularAcceleration = 100;
	this.physics.arcade.moveToXY(obj, this.world.centerX, this.world.centerY, 530);
},

  update: function() {
    this.throwObject();
      
      //This holds points for touchscreen movement
      var points = [];

	points.push({
		x: this.input.x,
		y: this.input.y
	});
	points = points.splice(points.length-10, points.length);

	if (points.length<1 || points[0].x==0) {
		return;
	}

    //For animation fall ing your movement on the touchscreen. Currently does not seem to be working
	slashes.clear();
	slashes.beginFill(0xFFFFFF);
	slashes.alpha = .5;
	slashes.moveTo(points[0].x, points[0].y);
	for (var i=1; i<points.length; i++) {
		slashes.lineTo(points[i].x, points[i].y);
	} 
	slashes.endFill();

    //For handling collisions with an object
	for(var i = 1; i< points.length; i++) {
		line = new Phaser.Line(points[i].x, points[i].y, points[i-1].x, points[i-1].y);
		this.debug.geom(line);

		good_objects.forEachExists(checkIntersects);
		bad_objects.forEachExists(checkIntersects);
	}
  },

//Validates a target hit
checkIntersects: function(fruit, callback) {
	var l1 = new Phaser.Line(fruit.body.right - fruit.width, fruit.body.bottom - fruit.height, fruit.body.right, fruit.body.bottom);
	var l2 = new Phaser.Line(fruit.body.right - fruit.width, fruit.body.bottom, fruit.body.right, fruit.body.bottom-fruit.height);
	l2.angle = 90;

	if(Phaser.Line.intersects(line, l1, true) ||
		 Phaser.Line.intersects(line, l2, true)) {

		contactPoint.x = this.input.x;
		contactPoint.y = this.input.y;
		var distance = Phaser.Point.distance(contactPoint, new Phaser.Point(fruit.x, fruit.y));
		if (Phaser.Point.distance(contactPoint, new Phaser.Point(fruit.x, fruit.y)) > 110) {
			return;
		}

		if (fruit.parent == good_objects) {
			this.killFruit(fruit);
		} else {
			this.resetScore();	
		}
	}

},

//Handles resetting the high score (and thus, the game)
resetScore: function() {
	var highscore = Math.max(score, localStorage.getItem("highscore"));
	localStorage.setItem("highscore", highscore);

	good_objects.forEachExists(killFruit);
	bad_objects.forEachExists(killFruit);

	score = 0;
	scoreLabel.text = 'Game Over!\nHigh Score: '+highscore;
}

}; 