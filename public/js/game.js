console.log("GAME.JS")

// DEGREE TO RADIAN
Math.radians = function(degrees) {return degrees * Math.PI / 180;};

// GLOBAL GAME VARIABLES
var godHue = 0;
var laserHits = 0;
var lastShot = 0;

function createTexture(color1, color2) {
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        var ctx = canvas.getContext('2d');
        var gradient = ctx.createLinearGradient(0,0,64,64);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,64,64);
        return new THREE.CanvasTexture(canvas);
}

function getElementMaterial(){
        var choice = Math.floor(Math.random()*4);
        switch(choice){
                case 0:
                        return new THREE.MeshLambertMaterial({map:createTexture('#8B4513','#CD853F')}); // earth
                case 1:
                        return new THREE.MeshLambertMaterial({map:createTexture('#F0F8FF','#B0E0E6')}); // wind
                case 2:
                        return new THREE.MeshLambertMaterial({map:createTexture('#1E90FF','#00BFFF')}); // water
                default:
                        return new THREE.MeshLambertMaterial({map:createTexture('#FF4500','#FFD700')}); // fire
        }
}

function createStarTexture(){
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = 512;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,512,512);
        for(var i=0;i<1000;i++){
                var x = Math.random()*512;
                var y = Math.random()*512;
                var s = Math.random()*2;
                ctx.fillStyle = 'white';
                ctx.fillRect(x,y,s,s);
        }
        return new THREE.CanvasTexture(canvas);
}
////DEFINE KEYPRESS EVENT LISTENERS (X & Y MOTION AND CAMERA CHOOSER)
window.addEventListener('keyup', function(event) { event.preventDefault(); Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { event.preventDefault(); Key.onKeydown(event); }, false);
var Key = {
	_pressed: {},
	shift: 16, 
	left: 37, up: 38, right: 39, down: 40,
        A: 65,W: 87,D: 68,S: 83,
        one: 49,two: 50, three: 51, zero: 48,
        space: 32,
        equal: 187, dash: 189,
	isDown: function (keyCode) {return this._pressed[keyCode];},
	onKeydown: function (event) {this._pressed[event.keyCode] = true;},
//	onKeyup: function (event) {if (event.keyCode === 16){rexMesh.rotation.y = 0;} delete this._pressed[event.keyCode];}
	onKeyup: function (event) {delete this._pressed[event.keyCode];}	
};

////DOM SETUP
var renderer = new THREE.WebGLRenderer();
var display = document.getElementById('game-display');
var displayStyle = window.getComputedStyle(display);
var displayWidth = parseInt(displayStyle.width);
var displayHeight = parseInt(displayStyle.width) / 1.78;
renderer.setSize(displayWidth, displayHeight);
display.appendChild(renderer.domElement);

////WINDOW RESIZE LISTENER
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
		var displayWidth = parseInt(displayStyle.width);
		var displayHeight = parseInt(displayStyle.width) / 2;
		if (typeof orbitCamera != "undefined"){
			orbitCamera.aspect = displayWidth / displayHeight;
			orbitCamera.updateProjectionMatrix();
		} else if (typeof gameCamera != "undefined"){
			gameCamera.aspect = displayWidth / displayHeight;
			gameCamera.updateProjectionMatrix();
		} else if (typeof sideCamera != "undefined" ){
			sideCamera.aspect = displayWidth / displayHeight;
			sideCamera.updateProjectionMatrix();
		} else if (typeof startCamera != "undefined"){
			startCamera.aspect = displayWidth / displayHeight;
			startCamera.updateProjectionMatrix();
		}
		renderer.setSize(displayWidth, displayHeight);
	}	

/////////////////////////////////////////////////////////////////////////////////////      END GLOBAL

////GAME STATE

setGameState("menu");

function startMenu(){
	function killStartMenu(){
		cancelAnimationFrame(sMA);
		for( var i = startMenuScene.children.length - 1; i >= 0; i--) {
			object = startMenuScene.children[i];
			startMenuScene.remove(object);
		}
		startMenuScene.remove();
		startCamera.remove();
		rexMesh.remove();
		rexPivot.remove();
		gameLogo.remove();
		startSphereMesh.remove();
		startButton.remove();
		setGameState("game");
	}
	
	////CREATE SCENE
	var startMenuScene = new THREE.Scene();
	
	////LIGHTS
	startMenuScene.add(new THREE.AmbientLight(0xCCCCCC));
	
	////START CAMERA
	var startCamera = new THREE.PerspectiveCamera(55, displayWidth / displayHeight, 0.1, 500);
	startCamera.position.set(0,60,100);
	startCamera.lookAt(startMenuScene.position);

        ////START SPHERE
        var sphereGeometry = new THREE.SphereGeometry(150,50,50);
        var sphereMaterial = new THREE.MeshBasicMaterial({color:0xffffff, wireframe: true, transparent: false, opacity: .3})
        var startSphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        startMenuScene.add(startSphereMesh);
	
	////DOM SETUP - START GAME
	var startButton = document.createElement('button');
	startButton.id = "start-button"
	startButton.innerHTML = 'START GAME';
	display.appendChild(startButton);
	startButton.addEventListener('click',function(){killStartMenu();})
	
	////DOM SETUP - LOGO
	var gameLogo = document.createElement('pre');
	gameLogo.id = "game-logo"
	gameLogo.innerHTML = '██████╗ ███████╗████████╗██████╗  ██████╗ ███████╗██╗  ██╗██████╗ ██████╗ ███████╗███████╗███████╗\r\n██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗██╔════╝╚██╗██╔╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝\r\n██████╔╝█████╗     ██║   ██████╔╝██║   ██║█████╗   ╚███╔╝ ██████╔╝██████╔╝█████╗  ███████╗███████╗\r\n██╔══██╗██╔══╝     ██║   ██╔══██╗██║   ██║██╔══╝   ██╔██╗ ██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║\r\n██║  ██║███████╗   ██║   ██║  ██║╚██████╔╝███████╗██╔╝ ██╗██║     ██║  ██║███████╗███████║███████║\r\n╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝';
	var gameLogoStyle = window.getComputedStyle(gameLogo);
	display.appendChild(gameLogo);
	
	
	////GEOMETRY
	////REX (SPACESHIP) - CENTERED ON AXIS
	var rexPivot = new THREE.Object3D();
	var rexShape = new THREE.Shape();
	////REX SVG COORDINATES - CENTERED
	function rexShapeData() {
		rexShape.moveTo(0, -35);
		rexShape.lineTo(9.3, -17.7);
		rexShape.lineTo(50, 21.8);
		rexShape.lineTo(6.6, 21.8);
		rexShape.lineTo(0, 35);
		rexShape.lineTo(-6.6, 21.8);
		rexShape.lineTo(-50, 21.8);
		rexShape.lineTo(-9.3, -17.7);
	}
	rexShapeData() //GRABS SVG DATA
	var rexExtrusion = {amount: 4, bevelEnabled: false};
	var rexGeometry = new THREE.ExtrudeGeometry(rexShape, rexExtrusion);
	var rexMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00, wireframe: true});
	var rexMesh = new THREE.Mesh(rexGeometry, rexMaterial);
	//var rexMesh = new Physijs.ConvexMesh(rexGeometry, rexMaterial);
	rexMesh.rotateX(Math.radians(90));
	rexPivot.add(rexMesh);
	startMenuScene.add(rexPivot);
	
        var startHue = 0;

        var startMenuAnimate = function(){
                sMA = requestAnimationFrame(startMenuAnimate);
                rexPivot.rotateY(Math.radians(.9));
                startSphereMesh.rotateY(Math.radians(-.1));
                startHue = (startHue + 0.5) % 360;
                startSphereMesh.material.color.setHSL(startHue/360,0.5,0.5);
                gameLogo.style.color = 'hsl(' + startHue + ',100%,70%)';
                renderer.render(startMenuScene, startCamera);
        };
	startMenuAnimate();
}


function startGame(){
	
	function killGame(){
		clearInterval(enemyCreateInterval);
		for( var i = enemyPivot.children.length - 1; i >= 0; i--) {
			selectedEnemyMesh = enemyPivot.children[i];
			selectedEnemyMesh.position.set(0,0,0);
			enemyPivot.remove(selectedEnemyMesh);
		}
//		gameScene.dispose();
//		gameCamera.dispose();
//		sideCamera.dispose();
//		gridLine.dispose();
//		gridLineTop.dispose();
//		cubeMesh.dispose();
//		rexMesh.dispose();
//		rexPivot.dispose();
//		enemyMesh.dispose();
//		enemyPivot.dispose();
//		scoreDisplay.dispose();
//		orbitMessage.dispose();
//		resetButton.dispose();
		
		gameScene.remove();
		gameCamera.remove();
		sideCamera.remove();
		gridLine.remove();
		gridLineTop.remove();
		cubeMesh.remove();
		rexMesh.remove();
		rexPivot.remove();
		enemyMesh.position.set(0,0,-5000);
		enemyPivot.position.set(0,0,-5000);
		enemyMesh.remove();
		enemyPivot.remove();
		scoreDisplay.remove();
		orbitMessage.remove();
		resetButton.remove();
		godMode = null;
		

		setGameState("menu")
	}
	
	function setRexAlive(boolean){
		switch (boolean){
			case true:
				aliveGameOver(true);
				break;
			case false:
				aliveGameOver(false);
				break;
		}
	}
		
	////CHECK DIFFICULTY
        function checkDifficulty(time, delta) {
                ////WORLD TRANSLATION && DIFFICULTY
                ////***** LEVEL 11 *****
                if(time >= 100.0){difficulty = 2;}
                ////***** LEVEL 10 *****
                if(time >= 90.0 && time < 100.0){difficulty = 1;}
                ////***** LEVEL 9 *****
                if(time >= 80.0 && time < 90.0){difficulty = .999;}
                ////***** LEVEL 8 *****
                if(time >= 70.0 && time < 80.0){difficulty = .888;}
                ////***** LEVEL 7 *****
                if(time >= 60.0 && time < 70.0){difficulty = .777;}
                ////***** LEVEL 6 *****
                if(time >= 50.0 && time < 60.0){difficulty = .666;}
                ////***** LEVEL 5 *****
                if(time >= 40.0 && time < 50.00 ){difficulty = .555;}
                ////***** LEVEL 4 *****
                if(time >= 30.0 && time < 40.0){difficulty = .444;}
                ////***** LEVEL 3 *****
                if(time >= 20.0 && time < 30.0){difficulty = .333;}
                ////***** LEVEL 2 *****
                if (time >= 10.0 && time < 20.0){difficulty = .222;}
                ////***** LEVEL 1 *****
                if(time >= 0.0 && time < 10.0){difficulty = .111;}
                gridLine.translateZ(gridLineSpeed*difficulty*delta)
                gridLineTop.translateZ(gridLineSpeed*difficulty*delta)
                cubeMesh.translateZ(cubeMeshSpeed*difficulty*delta)
                if(gridLine.position.z < -150000){
                        gridLine.position.z += 300000;
                        gridLineTop.position.z += 300000;
                        cubeMesh.position.z += 300000;
                }
                checkForEnemies(delta)
        }

        function createExplosion(position){
                var geom = new THREE.SphereGeometry(10,8,8);
                var mat = new THREE.MeshBasicMaterial({color:0xffaa00, transparent:true});
                var mesh = new THREE.Mesh(geom, mat);
                mesh.position.copy(position);
                gameScene.add(mesh);
                var scale = 1;
                var explode = setInterval(function(){
                        scale += 0.2;
                        mesh.scale.set(scale,scale,scale);
                        mat.opacity -= 0.05;
                        if(mat.opacity <=0){
                                clearInterval(explode);
                                gameScene.remove(mesh);
                        }
                },16);
        }
        ////CHECK FOR COLLISION
	function checkForCollision() {
		for (var i = 0; i < enemyPivot.children.length; i++) {
			var rexPosition = new THREE.Box3().setFromObject(rexMesh);
			var enemyPosition = new THREE.Box3().setFromObject(enemyPivot.children[i]);
                        if (enemyPosition.isIntersectionBox(rexPosition)) {
                                createExplosion(rexMesh.position.clone());
                                setRexAlive(false)
                        }
		}
	}
	////CHECK IF ENEMIES EXIST
        function checkForEnemies(delta){
                if (typeof enemyMesh != "undefined") {
                        enemyPivot.translateZ(enemyPivotSpeed*difficulty*delta)

//			if (enemyPivot.children[0].matrixWorld.elements[14] > 200 && enemyPivot.children[0].material.opacity > 0) {
//				enemyPivot.children[0].material.opacity -= .1;
//			}
			if (enemyPivot.children[0].matrixWorld.elements[14] > 1200) {
                                scoreCounter += 1;
                                scoreDisplay.innerHTML = 'SCORE: ' + scoreCounter + ' HITS: ' + laserHits;
                                deleteEnemy()
			}
		}
	}
	////REX WOBBLE
	function rexWobble() {
		if (rexDirection === "up") {
			rexPivot.translateY(.05)
			if (rexPivot.position.y > 1) {
				rexDirection = "down"
			}
		} else if (rexDirection === "down") {
			rexPivot.translateY(-.05)
			if (rexPivot.position.y < -1) {
				rexDirection = "up"
			}
		}
	}
	//// SHIP CONTROLS - TRANSLATES REX ON KEYPRESS
	function shipControls() {
		//ARROW KEY & WASD CONTROLS
		if (Key.isDown(Key.left) || Key.isDown(Key.A)) {
			if (rexPivot.position.x > - 450) {
				rexPivot.translateX(-20), rexMesh.rotateY(Math.radians(.1)), gameScene.rotateZ(Math.radians(.1))
			}
		}
		if (Key.isDown(Key.right) || Key.isDown(Key.D)) {
			if (rexPivot.position.x < 450) {
				rexPivot.translateX(20), rexMesh.rotateY(Math.radians(-.1)), gameScene.rotateZ(Math.radians(-.1))
			}
		}
		if (Key.isDown(Key.up) || Key.isDown(Key.W)) {
			if (rexPivot.position.y < 400) {
				rexPivot.translateY(15), gameScene.translateY(-2.5), rexMesh.rotateX(Math.radians(-.1)), gameScene.rotateX(Math.radians(-.1))
			}
		}
		if (Key.isDown(Key.down) || Key.isDown(Key.S)) {
			if (rexPivot.position.y > -400) {
				rexPivot.translateY(-15), gameScene.translateY(2.5), rexMesh.rotateX(Math.radians(.1)), gameScene.rotateX(Math.radians(.1))
			}
		}
		////SHIFT KEY (VERTICAL MODE)
                if (Key.isDown(Key.shift)){
                        rexMesh.rotation.y = Math.radians(90);
                        if(cameraSwitcher === "cockpitCamera"){
                                cockpitCamera.rotation.z = Math.radians(90)
                        }
                }////SHIFT KEYUP RESET IS IN ANIMATE FUNCTION
        }

        function shootLaser(){
                var now = gameClock.getElapsedTime();
                if(now - lastShot < 0.3){return;}
                lastShot = now;
                var origin = rexMesh.getWorldPosition(new THREE.Vector3());
                var direction = new THREE.Vector3(0,0,-1).applyQuaternion(rexMesh.quaternion);
                var raycaster = new THREE.Raycaster(origin, direction);
                var intersects = raycaster.intersectObjects(enemyPivot.children);
                var beamGeometry = new THREE.CylinderGeometry(1,1,500,8);
                var beamMaterial = new THREE.MeshBasicMaterial({color:0xff0000});
                var beam = new THREE.Mesh(beamGeometry, beamMaterial);
                beam.rotation.x = Math.PI/2;
                beam.position.copy(origin.clone().add(direction.clone().multiplyScalar(-250)));
                gameScene.add(beam);
                setTimeout(function(){gameScene.remove(beam);},100);
                if(intersects.length>0){
                        var hit = intersects[0];
                        createExplosion(hit.point);
                        enemyPivot.remove(hit.object);
                        laserHits++;
                        scoreDisplay.innerHTML = 'SCORE: ' + scoreCounter + ' HITS: ' + laserHits;
                }
        }

        ////ENEMY GENERATION
	function createEnemy() {
		if (enemyPivot.children.length <= 99) {

			if (typeof enemyMesh != "undefined") {
				var lastEnemyPosition = enemyMesh.position.z;
				var newEnemyPosition = lastEnemyPosition - 200;
			} else {
				var newEnemyPosition = -5000;
			}

                        var enemyGeometry = new THREE.BoxGeometry(Math.floor(Math.random() * 50) + 50, Math.floor(Math.random() * 50) + 50, Math.floor(Math.random() * 50) + 50, 2, 2, 2)
                        var enemyMaterial = getElementMaterial();

			enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
			var enemyBox = new THREE.Box3().setFromObject(enemyMesh);
			var enemyHalfX = enemyBox.max.x
			var enemyHalfY = enemyBox.max.y

			enemyId += 1;
			enemyMesh.name = "enemy" + parseInt(enemyId);

			////PHYSI.JS
			enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
			//		enemyMesh = new Physijs.BoxMesh(enemyGeometry, enemyMaterial);

			var switchNum = Math.floor(Math.random() * 21);
			switch (switchNum) {
				case 0:
					////TOP RIGHT
					enemyMesh.position.set((Math.floor(Math.random() * 500) - enemyHalfX), (Math.floor(Math.random() * 400) - enemyHalfY), newEnemyPosition)
					break;
				case 1:
					////TOP LEFT
					enemyMesh.position.set((Math.floor(Math.random() * -500) + enemyHalfX), (Math.floor(Math.random() * 400) - enemyHalfY ), newEnemyPosition)
					break;
				case 2:
					////BOTTOM LEFT
					enemyMesh.position.set((Math.floor(Math.random() * -500) + enemyHalfX), (Math.floor(Math.random() * -400) + enemyHalfY), newEnemyPosition)
					break;
				case 3:
					////BOTTOM RIGHT
					enemyMesh.position.set((Math.floor(Math.random() * 500) - enemyHalfX), (Math.floor(Math.random() * -400) + enemyHalfY), newEnemyPosition)
					break;
				case 4:
					////CENTER
					enemyMesh.position.set(0, 0, newEnemyPosition)
					break;
				case 5:
					////TOP CENTER
					enemyMesh.position.set(0, 400 - enemyHalfY, newEnemyPosition)
					break;
				case 6:
					////BOTTOM CENTER
					enemyMesh.position.set(0, -400 + enemyHalfY, newEnemyPosition)
					break;
				case 7:
					////LEFT CENTER
					enemyMesh.position.set(-500 + enemyHalfX, 0, newEnemyPosition)
					break;
				case 8:
					////RIGHT CENTER
					enemyMesh.position.set(500 - enemyHalfX, 0, newEnemyPosition)
					break;
				case 9:
					////TOP LEFT
					enemyMesh.position.set(-500 + enemyHalfX, 400 - enemyHalfY, newEnemyPosition)
					break;
				case 10:
					////TOP RIGHT
					enemyMesh.position.set(500 - enemyHalfX, 400 - enemyHalfY, newEnemyPosition)
					break;
				case 11:
					////BOTTOM LEFT
					enemyMesh.position.set(-500 + enemyHalfX, -400 + enemyHalfY, newEnemyPosition)
					break;
				case 12:
					////BOTTOM RIGHT
					enemyMesh.position.set(500 - enemyHalfX, -400 + enemyHalfY, newEnemyPosition)
					break;
				case 13:
					////QUAD 1 BOTTOM LEFT
					enemyMesh.position.set(0 + enemyHalfX, 0 + enemyHalfY, newEnemyPosition)
					break;
				case 14:
					////QUAD 2 BOTTOM RIGHT
					enemyMesh.position.set(0 - enemyHalfX, 0 + enemyHalfY, newEnemyPosition)
					break;
				case 15:
					////QUAD 3 TOP RIGHT
					enemyMesh.position.set(0 - enemyHalfX, 0 - enemyHalfY, newEnemyPosition)
					break;
				case 16:
					////QUAD 4 TOP LEFT
					enemyMesh.position.set(0 + enemyHalfX, 0 - enemyHalfY, newEnemyPosition)
					break;
				case 17:
					////QUAD 1 CENTER
					enemyMesh.position.set(250, 200, newEnemyPosition)
					break;
				case 18:
					////QUAD 2 CENTER
					enemyMesh.position.set(-250, 200, newEnemyPosition)
					break;
				case 19:
					////QUAD 3 CENTER
					enemyMesh.position.set(-250, -200, newEnemyPosition)
					break;
				case 20:
					////QUAD 4 CENTER
					enemyMesh.position.set(250, -200, newEnemyPosition)
					break;
			}
			enemyPivot.add(enemyMesh)
		}
	}
	////DELETE ENEMY
	function deleteEnemy() {
		enemyPivot.remove(enemyPivot.children[0])
	}
	/////////////////////////////////////////////////////////////////
	
        ////CREATE SCENE
        var gameScene = new THREE.Scene();//var gameScene = new Physijs.Scene();////PHYSJS VERSION

        ////LIGHTS
        gameScene.add(new THREE.AmbientLight(0x222222));
        var directionalLight = new THREE.DirectionalLight(0xffffff,1);
        directionalLight.position.set(1,1,1);
        gameScene.add(directionalLight);

        ////SPACE BACKGROUND
        var starTexture = createStarTexture();
        var spaceGeometry = new THREE.SphereGeometry(4000,32,32);
        var spaceMaterial = new THREE.MeshBasicMaterial({map:starTexture, side:THREE.BackSide});
        var spaceMesh = new THREE.Mesh(spaceGeometry, spaceMaterial);
        gameScene.add(spaceMesh);
	
	////FOG
	gameScene.fog = new THREE.FogExp2(0x000000, 0.0005);
	renderer.setClearColor(gameScene.fog.color, 1);
	
	////GAME CAMERA (3D)
	var gameCamera = new THREE.PerspectiveCamera(55, displayWidth / displayHeight, 0.1, 2500);
	gameCamera.position.set(0, 100, 1000);
	gameCamera.lookAt(gameScene.position);

	////SIDE CAMERA (2.5D)
	var sideCamera = new THREE.PerspectiveCamera(45, displayWidth / displayHeight, 0.1, 2500);
	sideCamera.position.set(1000, 0, -300);
	sideCamera.rotateY(Math.radians(90));
	//sideCamera.lookAt(gameScene.position);
	
	////CREATE CLOCK
	var gameClock = new THREE.Clock();
	
	////REQUIRE PHYSI.JS
		//Physijs.scripts.worker = '/physijs/physijs_worker.js';
		//Physijs.scripts.ammo = '/physijs/examples/js/ammo.js';
	
	////DOM SETUP - SCORE COUNTER
        var scoreCounter = 0;
        laserHits = 0;
        lastShot = 0;
        var scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'score-display'
        scoreDisplay.innerHTML = 'SCORE: ' + scoreCounter + ' HITS: ' + laserHits;
        display.appendChild(scoreDisplay);
	
	////DOM SETUP - RESET GAME
	var resetButton = document.createElement('button');
	resetButton.id = "reset-button"
	resetButton.innerHTML = 'RESET GAME';
	
	var orbitMessage = document.createElement('div');
	orbitMessage.id = "orbit-message";
	orbitMessage.innerHTML = "<p>Click and drag your mouse to rotate the camera!  You can zoom too!</p>"

	
	////WORLD GEOMETRY
	////GRID PLANE (BOTTOM)
	var gridSize = 300000;
	var gridStep = 100;
	var gridGeometry = new THREE.Geometry();
	var gridColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
	var gridMaterial = new THREE.LineBasicMaterial({color: gridColor});
	for (var i = -gridSize; i <= gridSize; i += gridStep) {
		gridGeometry.vertices.push(new THREE.Vector3(-gridSize, -0.04, i));
		gridGeometry.vertices.push(new THREE.Vector3(gridSize, -0.04, i));
		gridGeometry.vertices.push(new THREE.Vector3(i, -0.04, -gridSize));
		gridGeometry.vertices.push(new THREE.Vector3(i, -0.04, gridSize));
	}
	var gridLine = new THREE.Line(gridGeometry, gridMaterial, THREE.LinePieces);
	var gridLineSpeed = 32;
	gridLine.position.y = -500;
	gridLine.position.z = 150000;
	////GRID PLANE (TOP)
	var gridLineTop = gridLine.clone();
	gridLineTop.position.y = 500;

	////CUBE (TUNNEL)
        var cubeGeometry = new THREE.BoxGeometry(4000, 1100, 300000, 10, 10, 1000);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0x222222, wireframe: false});
	var cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
	var cubeMeshSpeed = 32;
	cubeMesh.material.side = THREE.DoubleSide;
	
	////ADD WORLD GEOMETRY
	gameScene.add(cubeMesh);
	gameScene.add(gridLine);
	gameScene.add(gridLineTop);
	
	////ENEMY PIVOT (PARENT CONTROL - USE THIS TO MOVE BLOCKS)
	var enemyPivot = new THREE.Object3D();
	var enemyPivotSpeed = 50;
	var enemyId = 0;

	////ADD REX
	////REX (SPACESHIP) - CENTERED ON AXIS
	var rexPivot = new THREE.Object3D();
	var rexShape = new THREE.Shape();
	////REX SVG COORDINATES - CENTERED
	function rexShapeData() {
		rexShape.moveTo(0, -35);
		rexShape.lineTo(9.3, -17.7);
		rexShape.lineTo(50, 21.8);
		rexShape.lineTo(6.6, 21.8);
		rexShape.lineTo(0, 35);
		rexShape.lineTo(-6.6, 21.8);
		rexShape.lineTo(-50, 21.8);
		rexShape.lineTo(-9.3, -17.7);
	}
	rexShapeData() //GRABS SVG DATA
        var rexExtrusion = {amount: 4, bevelEnabled: false};
        var rexGeometry = new THREE.ExtrudeGeometry(rexShape, rexExtrusion);
        var rexMaterial = new THREE.MeshPhongMaterial({color: 0x000000, specular:0x000000, shininess:5});
        rexMesh = new THREE.Mesh(rexGeometry, rexMaterial);
	//var rexMesh = new Physijs.ConvexMesh(rexGeometry, rexMaterial);
	var rexDirection = "up";
	rexMesh.rotateX(Math.radians(90));
	rexPivot.translateZ(100);
	rexPivot.rotation.y = 0;
	gameScene.add(rexPivot)
        rexPivot.add(rexMesh);
        var leftLight = new THREE.PointLight(0xff0000,2,50);
        leftLight.position.set(-10,0,0);
        var rightLight = new THREE.PointLight(0xff0000,2,50);
        rightLight.position.set(10,0,0);
        rexMesh.add(leftLight);
        rexMesh.add(rightLight);
        setInterval(function(){leftLight.visible=!leftLight.visible; rightLight.visible=!rightLight.visible;},500);
	
	gameScene.add(enemyPivot);
	
	//FIRST PERSON CAMERA
	cockpitCamera = new THREE.PerspectiveCamera(80, displayWidth / displayHeight, 1, 3000);
	cockpitCamera.rotateY(90)
	cockpitCamera.lookAt(gameScene.position)
	cockpitCamera.position.set(0,0,-10)
	
	rexPivot.add(cockpitCamera)
	
	////CREATE AND DELETE OBSTACLES ON INTERVAL
	var enemyCreateInterval = setInterval(createEnemy, 10)
	//var enemyDeleteInterval = setInterval(deleteEnemy, 10)
	
	godMode = false;
	
	function aliveGameOver(boolean){
		switch(boolean){
			case true:
				cameraSwitcher = "gameCamera"
				function gameAnimate(){
					gA = requestAnimationFrame(gameAnimate);
					//gameScene.simulate() //start physics
					var delta = gameClock.getDelta()
					var time = parseInt(gameClock.getElapsedTime());
					
					////BARREL ROLL RESET
					rexMesh.rotation.y = 0;
					if(cameraSwitcher === "cockpitCamera"){
						cockpitCamera.rotation.z = 0
					}
					
                                        ////WORLD TRANSLATION && DIFFICULTY
                                        checkDifficulty(time, delta)

                                        if (godMode === false){
                                                checkForCollision();
                                                rexMesh.material.color.setHex(0x00FF00);
                                        } else if (godMode === true){
                                                ////SMOOTH COLOR MODE
                                                godHue = (godHue + 1) % 360;
                                                rexMesh.material.color.setHSL(godHue/360,1,0.5);
                                        }

                                        shipControls();
                                        rexWobble();
                                        if(Key.isDown(Key.space)){
                                                shootLaser();
                                        }

					if (Key.isDown(Key.one)) {
						cameraSwitcher = "gameCamera"
					} else if (Key.isDown(Key.two)) {
						cameraSwitcher = "sideCamera"
					} else if (Key.isDown(Key.three)) {
						cameraSwitcher = "cockpitCamera"
					} else if (Key.isDown(Key.equal)) {
						godMode = true;
					} else if (Key.isDown(Key.dash)) {
						godMode = false;
					}
					
					if (cameraSwitcher === "gameCamera") {
						renderer.render(gameScene, gameCamera);
					} else if (cameraSwitcher === "sideCamera") {
						renderer.render(gameScene, sideCamera);
					} else if (cameraSwitcher === "cockpitCamera"){
						renderer.render(gameScene, cockpitCamera)
					}
					
				};
				gameAnimate();
				break;
			case false:
				function gameOver(){
					cancelAnimationFrame(gA);
					////ORBIT CAMERA (DEATH CAM)
					var orbitCamera = new THREE.PerspectiveCamera(45, displayWidth / displayHeight, 0.1, 2500);
					orbitCamera.position.set(300, 300, 100);

					////ORBIT CONTROLS
					var orbitControls = new THREE.OrbitControls( orbitCamera, renderer.domElement );
					//orbitControls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
					orbitControls.enableDamping = true;
					orbitControls.dampingFactor = 0.25;
					orbitControls.minDistance = 300;
					orbitControls.maxDistance = 1000;
					orbitControls.enableZoom = false;

                                        ////ADD RESET BUTTON & ORBIT MESSAGE
                                        scoreDisplay.innerHTML = 'FINAL SCORE: ' + scoreCounter + ' HITS: ' + laserHits;
                                        display.appendChild(orbitMessage);
                                        display.appendChild(resetButton);
                                        resetButton.addEventListener('click',function(){killGame();})

					///ORBIT CAMERA DEATH
					rexPivot.add(orbitCamera)
					orbitCamera.lookAt(rexMesh.position);

					var gameOverAnimate = function(){
						gOA = requestAnimationFrame(gameOverAnimate);
						renderer.render(gameScene, orbitCamera);
					}
					gameOverAnimate();
				}
				gameOver();
				break;	
		}
	}
	setRexAlive(true)
}

function setGameState(gameState){
	switch (gameState){
		case "menu":
			startMenu();
			break;
		case "game":
			startGame();
			break;
	}
}
