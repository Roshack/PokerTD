// Initialize Phaser, and creates a 400x490px game

var game = new Phaser.Game(840, 840, Phaser.AUTO, 'game_div');
var spades = [];
var diamonds = [];
var hearts = [];
var clubs = [];
var cards = [clubs,diamonds,hearts,spades];
var currentCards = [];
var currentHand;
var style = {font:"40px Arial", fill: "#ffffff" };
var smallStyle = {font:"26px Arial", fill: "#ffffff" };
var handText;
var timeText;
var roundText;
var livesText;
var tNameText;
var tDmgText;
var tASText;
var tRangeText;
var selectedSquare;
var towers = [];
var badguys = [];
var bullets = [];
var freeBullets = [0];
var lives;
var round = 0;
var bgCount = 0;

var currentTowerStats = 0;

function bulletClass(gamevar,bgInd,tow,myInd) {
	this.parent = tow;
	this.bg = bgInd;
	this.game = gamevar;
	this.image = "shot";
	this.speed = 200;
	this.ind = myInd;
	this.sprite = this.game.add.sprite(tow.x,tow.y,this.image);
	this.game.physics.enable(this.sprite,Phaser.Physics.ARCADE);
	this.dmg = tow.dmg;
	var self = this;
	
	this.update = function() {
		if (badguys[self.bg] != null) {
			xDist = badguys[self.bg].x+10 - self.sprite.body.x;
			yDist = badguys[self.bg].y+10 - self.sprite.body.y;
			tDist = Math.sqrt(xDist*xDist + yDist*yDist);
			xFrac = xDist/tDist;
			yFrac = yDist/tDist;
			self.sprite.body.velocity.x = xFrac*self.speed;
			self.sprite.body.velocity.y = yFrac*self.speed;
			if (tDist < 5) {
				var retval = badguys[self.bg].takeDmg(self.dmg);
				if (retval == -1) {
					badguys[self.bg] = null;
				}
				bullets[self.ind] = null;
				freeBullets.push(self.ind);
				self.sprite.kill();
			}
		} else {
			bullets[self.ind] = null;
			freeBullets.push(self.ind);
			self.sprite.kill();
		}
	};
	
	this.kill = function() {
		bullets[self.ind] = null;
		freeBullet.push(self.ind);
		self.sprite.kill();
	};
	

}


var towerClass = function(hand,xp,yp,gamevar) {
	switch (hand) {
	// switch statement to set stats based on hand
	case "RF":
		// 30 dps, blah
		this.dmg = 30;
		this.as = 50;
		this.range = 120;
		this.image = 'rfTow';
		break;
	case "SF":
		// 25 dps, med range, 
		this.dmg = 25;
		this.as = 60;
		this.range = 100;
		this.image = 'sfTow';
		break;
	case "Q":
		// 20 dps, HUGE range slow attack
		this.dmg = 40;
		this.as = 120;
		this.range = 200;
		this.image = 'qTow';
		break;
	case "FH":
		// 15 dps + med range
		this.dmg = 15;
		this.as = 60;
		this.range = 90;
		this.image = 'fhTow';
		break;
	case "F":
		//dps = 10 + med range
		this.dmg = 5;
		this.as = 30;
		this.range = 90;
		this.image = 'fTow';
		break;
	case "S":
		//dps = 6.6r dps + large range
		this.dmg = 10;
		this.as = 90;
		this.range = 120;
		this.image = 'sTow';
		break;
	case "T":
		//dps = 5/sec +  bigger range
		this.dmg = 5;
		this.as = 60;
		this.range = 90;
		this.image = 'tTow';
		break;
	case "TP":
		//dps = 4/sec
		this.dmg = 2;
		this.as = 30;
		this.range = 60;
		this.image = 'tpTow';
		break;
	case "P":
		//dps = 2.5/sec
		this.dmg = 5;
		this.as = 120;
		this.range = 60;
		this.image = 'pTow';
		break;
	case "HC":
		//dps = 0.5/s
		this.dmg = 1;
		this.as = 120;
		this.range = 60;
		this.image = 'hcTow';
		break;
}
	Phaser.Button.call(this,gamevar,xp,yp,this.image);
	this.x = xp;
	this.y = yp;
	this.game = gamevar;
	this.towerType = hand;
	this.timer = 0;
	gamevar.add.existing(this);
};

towerClass.prototype = Object.create(Phaser.Button.prototype);
towerClass.prototype.constructor = towerClass;
towerClass.prototype.onInputOver = function() {
	currentTowerStats = [this.towerType,this.dmg,this.as,this.range];
	console.log("hover over tower");
};
towerClass.prototype.update = function() {

	if (this.timer <= 0) {
		for (var i = 0; i < badguys.length; i++) {
			if (badguys[i] != null) {
				dist = Math.sqrt(Math.pow(badguys[i].x - this.x,2) + Math.pow(badguys[i].y - this.y,2))
				if (dist < this.range) {
					this.timer = this.as;
					if (freeBullets.length > 0) {
						var ind = freeBullets.pop(0);
						bullets[ind] = new bulletClass(this.game,i,this,ind);
					} else {
						bullets.push(new bulletClass(this.game,i,this,bullets.length));
					}
					break;
				}
			}
		}
	} else {
		this.timer--;
	}
};



function sortNumber(a,b) {
	return a-b;
};

function cardConvert(x) {
	if (x < 11) {
		return ""+x;
	} else if (x == 11) {
		return "J";
	} else if (x == 12) {
		return "Q";
	} else if (x == 13) {
		return "K";
	} else if (x == 14) {
		return "A";
	}
};

function cardClass(cStr,gameVar,pos) {
	this.cardStr = cStr;
	this.Selected = false;
	this.Suit = cStr.split("-")[1];
	this.Value= cStr.split("-")[0];
	this.xpos = pos;
	this.num = 0;
	if (isNaN(this.Value)) {
		if (this.Value == "J") {
			this.num = 11;
		} else if (this.Value == "Q") {
			this.num = 12;
		} else if (this.Value == "K") {
			this.num = 13;
		} else if (this.Value == "A") {
			this.num = 14
		}

	} else {
		this.num = Number(this.Value);
	}
	
	this.cardClicked = function() {
		console.log(self.cardStr);
		if (!self.Selected) { 
			self.button.loadTexture(self.cardStr + "Y");
		} else if (self.Selected) { 
			self.button.loadTexture(self.cardStr);
		}
		self.Selected = !self.Selected;
	};
	this.button = gameVar.add.button(pos*72,64,cStr,this.cardClicked);
	var self = this;

};


function enemyClass(gamevar,index,round) {
	this.hp = 1;
	this.lvl = round;
	this.imgkey = "badcircle";
	this.ind = index;
	this.x = 40*3;
	this.y = 40*4;
	this.game = gamevar;
	this.sprite = gamevar.add.sprite(this.x,this.y,this.imgkey);
	this.game.physics.enable(this.sprite,Phaser.Physics.ARCADE);
	this.speed = 50;
	var self = this;
	this.update = function() {
		self.x = self.sprite.body.x;
		self.y = self.sprite.body.y;
		row = self.y - 160;
		col = self.x  - 120;
		//console.log("Col - " + col);
		//console.log("Row - " + row);
		if (col <= 0 && row < 560) {
			self.sprite.body.velocity.y = self.speed;
			self.sprite.body.velocity.x = 0;
		} else if (row >= 560 && col < 560) {
			self.sprite.body.velocity.y = 0;
			self.sprite.body.velocity.x = self.speed;
		} else if (row > 0 && col >= 560) {
			self.sprite.body.velocity.y = -self.speed;
			self.sprite.body.velocity.x = 0;
		} else if (row <= 0 &&  col > 0) {
			self.sprite.body.velocity.y = 0;
			self.sprite.body.velocity.x = -self.speed;
		}
	};
	
	this.kill = function() {
		self.sprite.kill();
		badguys[self.ind] = null;
	}
}

enemyClass.prototype.takeDmg = function(dmg) {
	this.hp = this.hp - dmg;
	if (this.hp <= 0) {
		this.sprite.kill();
		bgCount--;
		badguys[self.ind] = null;
		return -1
	} else {
		return 1
	}
};

// Creates a new 'main' state that will contain the game
var main_state = {

	// Function to check what hand player has
	handCheck : function () {
		handText.setText("");
		var firstSuit = currentCards[0].Suit;
		var flush = true;
		var vals = [];
		var royals = ['10','J','Q','K','A'];
		vals.push(currentCards[0].num);
		// Start by checking if we have a flush. If we have a flush
		// our only psosible hands are flush or straightflush
		for (var i = 1; i < 5; i++) {
			vals.push(currentCards[i].num);
			if (currentCards[i].Suit != firstSuit) {
				flush = false;
			}
		}
		vals = vals.sort(sortNumber);
		// Now determine if we have a straight
		var straight = true
		var current = vals[0];
		for (var i = 1; i < 5; i++) {
			//console.log("Current - " + current);
			//console.log("Val - " + vals[i]);
			//console.log(vals[i] != current+1);
			if (vals[i] != current+1) {
				straight = false;
			}
			current = vals[i];
		}
		//console.log(vals);
		if (flush) {
			if (straight) {
				if (vals[4] == 14) {
					handText.setText("ROYAL FLUSH!");
					currentHand = "RF";
					//console.log("ROYALFLUSH");
				} else {
					handText.setText("STRAIGHT FLUSH!");
					currentHand = "SF";
					//console.log("STRAIGHT FLUSH!");
				}
			} else {
				handText.setText("FLUSH!");
				currentHand = "F";
			}
		} else {
			// If we don't have a flush let's check for multiples.
			var dict = [0,0,0,0,0,0,0,0,0,0,0,0,0];
			pairs = 0;
			trips = 0;
			quads = 0;
			for (var i =0; i < 5; i++) {
				dict[vals[i]-2] = dict[vals[i]-2]+1;
			}
			for (var i =0; i < 13; i++) {
				if (dict[i] == 2) {
					pairs++;
				} else if (dict[i] == 3) {
					trips++;
				} else if (dict[i] == 4) {
					quads++;
				}
			}
			
			if (quads == 1) {
				handText.setText("QUADS!");
				currentHand= "Q";
				//console.log("QUADS!");
			} else if (trips == 1 && pairs == 1) {
				currentHand = "FH";
				handText.setText("FULL HOUSE!");
				//console.log("FULL HOUSE!");
			} else if (straight) {
				handText.setText("STRAIGHT!");
				currentHand= "S";
				//console.log("STRAIGHT");
			} else if (trips == 1) {
				handText.setText("TRIPS!");
				currentHand = "T";
				//console.log("TRIPS!");
			} else if (pairs == 2) {
				handText.setText("TWO PAIR!");
				currentHand = "TP";
				//console.log("TWOPAIR!");
			} else if ( pairs == 1) {
				handText.setText("PAIR!");
				currentHand = "P"
				//console.log("PAIR!");
			} else {
				handText.setText(cardConvert(vals[4]) + "-HIGH!");
				currentHand = "HC"
				//console.log(vals[4] + "-HIGH!");
			}
			
		
		}
	
	},

	cardGen : function() {
		var chosen = [];
		var thrower = [];
		var max = 5;
		if (currentCards.length > 0) {
			for (var j = 0; j < 5; j++) {
				if (currentCards[j].Selected) {
					chosen.push(currentCards[j].cardStr);
					max--;
				} else {
					thrower.push(j);			
				}
				
			}
			//console.log(chosen);
			var i = 0;
			while (i < max) {
				suit = Math.floor((Math.random() *100) + 1) % 4;
				card = Math.floor((Math.random() *1000000)) % 13;
				if (chosen.indexOf(cards[suit][card]) == -1) {
					//this.game.add.sprite(72*i,64,cards[suit][card]);
					currentCards[thrower[i]] = new cardClass(cards[suit][card],this.game,thrower[i]);
					chosen.push(cards[suit][card]);
					i++;
				}
				
			}
		} else {
			var i = 0;
			while (i < max) {
				suit = Math.floor((Math.random() *100) + 1) % 4;
				card = Math.floor((Math.random() *1000000)) % 13;
				if (chosen.indexOf(cards[suit][card]) == -1) {
					//this.game.add.sprite(72*i,64,cards[suit][card]);
					currentCards.push(new cardClass(cards[suit][card],this.game,i));
					chosen.push(cards[suit][card]);
					i++;
				}
				
			}		
		
		}
		this.handCheck();
		
	},
	
	roundStart : function() {
		while (currentCards.length != 0) {
			currentCards.pop();
		}
		this.cardGen();
	},
	
	rollButtonClicked: function() {
		if (this.phase <= 2) {
			this.cardGen();
			this.phase++;
		}
		
	},
	
	startButtonClicked: function() {
		console.log("phase: " + this.phase);
		if (this.phase == 4) {
			this.phase++;
			round++;
			this.levelTime = 120;
			this.secTimer = 60;
			bgCount = 30;
			this.startButton.loadTexture("startGrey");
		}
	
	},
	

    preload: function() { 
		// Function called first to load all the assets
		this.game.stage.backgroundColor = '#000000';
		var loadText = this.game.add.text("LOADING...",400,400,style);
		this.game.load.image('rollGrey','assets/rollGrey.png');
		this.game.load.image('startRound','assets/startRound.png');
		this.game.load.image('startGrey','assets/startGrey.png');
		this.game.load.image('bird','assets/bird.png');
		this.game.load.image('shot','assets/shot.png');
		this.game.load.image('bSq','assets/Brown.png');
		this.game.load.image('gSq','assets/Green.png');
		this.game.load.image('roll','assets/roll.png');
		this.game.load.image('hcTow','assets/towers/hcTow.png');
		this.game.load.image('pTow','assets/towers/pTow.png');
		this.game.load.image('tpTow','assets/towers/tpTow.png');
		this.game.load.image('tTow','assets/towers/tTow.png');
		this.game.load.image('sTow','assets/towers/sTow.png');
		this.game.load.image('fTow','assets/towers/fTow.png');
		this.game.load.image('fhTow','assets/towers/fhTow.png');
		this.game.load.image('qTow','assets/towers/qTow.png');
		this.game.load.image('sfTow','assets/towers/sfTow.png');
		this.game.load.image('rfTow','assets/towers/rfTow.png');
		this.game.load.image('badcircle','assets/badguy.png');
		this.game.load.image('tower1','assets/tower.png');
		this.phase = 0;
		var suits = ["Cl","Di","He","Sp"];
		for (var i =0; i < 4; i++) {
			for (var j = 2; j < 11; j++) {
				var theStr = 'assets/cards/' + j + "-"  + suits[i] + ".png";
				var theYStr = 'assets/cards/' + j + "-"  + suits[i] + "Y.png";
				this.game.load.image(j + "-" + suits[i],theStr);
				this.game.load.image(j + "-" + suits[i] + "Y",theYStr);
				
				theStr = j + "-" + suits[i];
				cards[i].push(theStr);
				/*
				if (i == 0) {
					clubs.push(theStr);
				} else if (i == 1) {
					diamonds.push(theStr);
				} else if (i == 2 ) {
					hearts.push(theStr);
				} else if (i==3) {
					spades.push(theStr);
				}*/
			}
			this.game.load.image("J-" + suits[i],'assets/cards/J-' + suits[i] + ".png");
			this.game.load.image("J-" + suits[i]+"Y",'assets/cards/J-' + suits[i] + "Y.png");
			this.game.load.image("Q-" + suits[i],'assets/cards/Q-' + suits[i] + ".png");
			this.game.load.image("Q-" + suits[i]+"Y",'assets/cards/Q-' + suits[i] + "Y.png");
			this.game.load.image("K-" + suits[i],'assets/cards/K-' + suits[i] + ".png");
			this.game.load.image("K-" + suits[i]+"Y",'assets/cards/K-' + suits[i] + "Y.png");
			this.game.load.image("A-" + suits[i],'assets/cards/A-' + suits[i] + ".png");
			this.game.load.image("A-" + suits[i]+"Y",'assets/cards/A-' + suits[i] + "Y.png");
			cards[i].push("J-" + suits[i]);
			cards[i].push("Q-" + suits[i]);
			cards[i].push("K-" + suits[i]);
			cards[i].push("A-" + suits[i]);
			loadText = null;

		}
    },

    create: function() { 
    	// Fuction called after 'preload' to setup the game  
		var greenTiles = [];
		var brownTiles = [];
		var gtiles = [[3],[3,4,5,6],[6],[1,2,3,4,5,6],[1],[1],[1,3,4,5],[1,2,3,5],[5],[3,4,5],[3],[3],[3,6,7,8],[3,4,5,6,8],[8],[8],[2,3,4,5,6,7,8],[2]]
		var j = 0;
		var i = 0;
		var phase = 0;
		round = 0;
		lives = 20;
		handText = this.game.add.text(0,0,"",style);
		timeText = this.game.add.text(400,120,"",style);
		roundText = this.game.add.text(400,80,"Next round: " + (round+1),style);
		livesText = this.game.add.text(600,0,"Live Left: " +lives,style);
		tNameText = this.game.add.text(0,200,"",smallStyle);
		tDmgText = this.game.add.text(0,240,"",smallStyle);
		tASText = this.game.add.text(0,240,"",smallStyle);
		tRangeText = this.game.add.text(0,240,"",smallStyle);
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		var levelTime = 120;
		var secTimer = 60;
		this.cardGen();
		
		i = 0;
		j = 0;
		
		while (i < 15) {
			j = 0;
			while (j < 15) {
				if (i == 0 || i == 14 || j == 0 || j == 14) {
					greenTiles.push(this.game.add.sprite(40*(j+3),40*(i+4),'gSq'));
					//console.log(gtiles[i])
					//console.log(i)
					//console.log(j)
				} else {
					brownTiles.push(this.game.add.button(40*(j+3),40*(i+4),'bSq',
									this.groundClick,this));
				}
				j++;
			}
			i++;
		}
		/*
		 These were test functions and stuff
		
		var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		space_key.onDown.add(this.spawnBad, this);  
		var up_key = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
		up_key.onDown.add(this.dmgall,this);
		*/
		
		this.rollButton = this.game.add.button(320,0,'roll',this.rollButtonClicked,this);
		this.startButton = this.game.add.button(440,0,'startGrey',this.startButtonClicked,this);
    },
	
    
    update: function() {
		// Function called 60 times per second
		// First check if we're in a round
		if (this.phase == 5) {
			// Decrement sec timer and update all dudes.
			roundText.setText("Current Round: " + round);
			timeText.setText("Time Left: " + this.levelTime);
			this.secTimer--;
			for (var i = 0; i < badguys.length; i++) {
				if (badguys[i] != null) {
					badguys[i].update();
				}
			}
			for (var i = 0; i < bullets.length; i++) {
				if(bullets[i] != null) {
					bullets[i].update();
				}
			}
			// If sectimer <= 0 a sec has passed decrement roundTimer
			// This also means that if we're in the first 30 seconds
			// we should spawn a badguy.
			if (this.secTimer <= 0) {
				this.secTimer = 60;
				if (this.levelTime > 90) {
					badguys.push(new enemyClass(this.game,badguys.length,round));
				}
				this.levelTime--;
				
			}
			if (this.levelTime <= 0) {
				this.phase = 0;
				var badCount = 0;
				// Kill all bullets
				for (var i = 0; i < bullets.length; i++) {
					if(bullets[i] != null) {
						bullets[i].kill();
						bullets[i] = null;
					}	
				}
				// kill all bad guys left and subtract lives
				for (var i = 0; i < badguys.length; i++) {
					if (badguys[i] != null) {
						badguys[i].kill();
						badguys[i] = null;
						badCount++;
					}
				}
				lives = lives - badCount;
			} else if (bgCount <= 0) {
				this.phase = 0;
				// Kill all bullets
				for (var i = 0; i < bullets.length; i++) {
					if(bullets[i] != null) {
						bullets[i].kill();
						bullets[i] = null;
					}	
				}
			}
		} else if (this.phase == 4) {
			// Phase 3 means we have rolled, and placed tower
			// We can only press start button now
			this.startButton.loadTexture("startRound");
		} else if (this.phase == 3) {
			// Three means rolls have been used, need to place tower
			this.rollButton.loadTexture("rollGrey");
		} else if (this.phase == 1) {
			// Two means we we've rerolled once, have one more chance
			this.rollButton.key = "roll";
		} else if (this.phase == 0) {
			// phase 0 means game must autoroll and update phase
			this.roundStart();
			bgCount = 0;
			livesText.setText("Lives Left: " + lives);
			timeText.setText("");
			roundText.setText("Upcoming round: " + (round+1));
			this.startButton.loadTexture("startGrey");
			this.phase++;
		}
		if (currentTowerStats != 0) {
			tNameText.setText(currentTowerStats[0]);
			tDmgText.setText(currentTowerStats[1]);
			tASText.setText(currentTowerStats[2]);
			tRangeText.setText(currentTowerStats[3]);
		}
	},
	
	groundClick: function(tile) {
		console.log("hand " + currentHand);
		console.log("x " + tile.x);
		console.log("y " + tile.y);
		if (this.phase == 3) {
			towers.push(new towerClass(currentHand,tile.x,tile.y,this.game));
			this.phase++;
		}
	},
	
	
	spawnBad : function() {
		badguys.push(new enemyClass(this.game,badguys.length,0));
	},
	dmgall : function() {
		// Test function used to dmg enemies
		var retval;
		for (var i = 0; i < badguys.length; i++) {
			retval = badguys[i].takeDmg(5);
			if (retval == -1) {
				badguys[i] = null;
			}
		}
	},

	// Restart the game
	restart_game: function() {  
		// Start the 'main' state, which restarts the game
		this.game.state.start('main');
	},
};

// Add and start the 'main' state to start the game
game.state.add('main', main_state);  
game.state.start('main'); 