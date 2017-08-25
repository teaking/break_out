// TODO ball movement is in same direction make it a little bit different when it touches
//different objects e.g. walls, bricks and paddle
window.onload = function() {
  var canvas = document.getElementById("myCanvas");
  // height and width of the game will be full screen
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  // store 2d rendering context
  var ctx = canvas.getContext("2d");
  // ball geometry
  var ballRadius = 5;
  // ball initial position
  var ballX = canvas.width - 100;
  var ballY = canvas.height - 100 ;
  //draw ball
  function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "Blue";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();

  }

  //paddle geometry
  var paddleHeight = 40;
  var paddleWidth = 100;
  // find canvas middle place to start drawing
  var paddleX = canvas.width / 2;

  function drawPaddle() {
    //draw paddle
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight , paddleWidth, paddleHeight);
    ctx.fillStyle = 'rgb(66, 62, 5)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgb(36, 20, 1)";
    ctx.stroke();
    ctx.closePath();

  }


  //brick
  var brickRowCount = 5;
  var brickColCount = 11;
  var brickWidth = 50;
  var brickHeight = 50;
  var brickPadding = 10;
  var brickSidePadding = canvas.width/2 - 250 ;

  //Generate random value min 0 and max 2
  function randValue (maxVal, minVal){
    return Math.random() * (maxVal ) + minVal;
  }

    // create bricks
  function createBrick(brickxPos, brickYPos, brickWidth, brickHeight) {
    ctx.beginPath();
    ctx.rect(brickxPos, brickYPos, brickWidth, brickHeight);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.strokeStyle = 'rgb(8, 5, 7)';
    ctx.stroke();
    ctx.closePath();

  }
  //draw bricks
  function drawBricks() {
    for (var c = 0; c < brickColCount; c++) {
      for (var r = 0; r < brickRowCount; r++) {
         if (bricks[c][r].status == 1) {
          // x position to lay the bricks
          var brickx = (c * (brickWidth + brickPadding)) + brickSidePadding;
          // y position to lay the bricks
          var bricky = (r * (brickHeight + brickPadding));
          bricks[c][r].x = brickx;
          bricks[c][r].y = bricky;
          // creating createBrick
          createBrick(brickx, bricky, brickWidth, brickHeight);

         }
      }
    }
  }
  // brick status to check if the ball made contact with the brick
  /** javascript does not have special syntax creating multidimesional array
    * A common workaround is to create an array of array in nested loops.
    * the same method is used below.
   **/
  var bricks = [];
  for (let col = 0; col < brickColCount; col++) {
     bricks[col] = [];
    for (let row = 0; row < brickRowCount; row++) {
      bricks[col][row] = {
        // setting the bricks status to 1 which means that the brick has not been in
        // contact with the ball
        status: 1
      };
    }
  }
    //ball movement speed
  var ballSpeedX = 3;
  var ballSpeedY = -3;
    // keyboard button pressed
  var rightKeyPressed = false;
  var leftKeyPressed = false;
  var pauseKeyPressed = false;
  var startTimer = false;

  //sound
  var brickImpact = new Audio("impacts.mp3");
  var paddleImpact = new Audio("paddlempact.mp3");

  var score = 0;
  var scorePosition = canvas.height - 30;
    //to pause screen
  var pauseScreen = false;


  var playerName;

  var lowTime = localStorage.getItem("lowTime");
  var name = localStorage.getItem("pName");
  var highScore = localStorage.getItem("highScore");

  var gameOverStatus = false;

  var gameTimeSec;
  var gameStartTime;
  var menuTime;

  var timer = 0;
  //keys listner
  window.addEventListener("keydown", keyPressed);
  window.addEventListener("keyup", keyNotPressed);

  //mouse listner
  canvas.addEventListener("mousemove", mouseMoveHandler, false);
  canvas.addEventListener("mousedown", mouseClickHandler, false);

  //start game
  //counts time
  var timeTracker = setInterval(timerTrack, 1000);

  // function will be called every 10 milliseconds
  var id = setInterval(draw, 10);

  var showMenu = true;

  function timerTrack() {
    timer += 1;
  }
  //main function

  function draw() {

    if (showMenu) {
      ctx.font = "45px Frijole";
      ctx.fillText("CLICK TO Start", canvas.width/2-200, canvas.height/2);
      return;

    }
    //  else if (gameOverStatus) {
    //    scoreStats();
    //   //show the scores
    //  }
    else {

      clearPreviousState();
      //clearing the circle trail
      ctx.font = "80px Cabin Sketch";
      ctx.fillText("Timer " + timer, canvas.width/2 - 50, canvas.height/2 +70);
      drawBricks();
      drawBall();
      //TODO make the paddle smaller as takes longer
      drawPaddle();
      collisionDetect();
      displayScore();

      if (ballX + ballSpeedX -ballRadius <= 0 || ballX + ballSpeedX + ballRadius > canvas.width) {

        //if the ball move out of the canvas left and right
        // instead of calculating the collision
        // with the centre of the ball we calculate with its
        //circumference, so that ball bounce right after it touches the
        //wall
        //make the ball goes random ways to make the user difficult to play
        ballSpeedX = -ballSpeedX * randValue(0.2,0.8);
        //bounce the ball in opposite direction

      }
      //if the ball move out of the canvas up
      if (ballY + ballSpeedY - ballRadius< 0) {
        // move to the opposite direction
        ballSpeedY = -ballSpeedY;
        ballSpeedX = -ballSpeedX * randValue(0.1,0.8);

      }
      //  else if (ballY + ballRadius >= canvas.height) { //check if the ball has made
        // (ballY + ballSpeedY > canvas.height - paddleHeight - ballRadius)
        //contact with the paddle in y directon
        let b = ballY + ballRadius;
        //ball is inside the paddle horizontal surface
        var canvasHeight = canvas.height;


        if ( ballX + ballRadius>= paddleX  && ballX - ballRadius <= paddleX + paddleWidth &&
          ballY + ballRadius >= (canvas.height - paddleHeight)
        ) {
          console.log("paddle height: " + (canvasHeight - paddleHeight));
          console.log("Canvas height: " + canvas.height);
          console.log("BallY: " + ballY);
          console.log("ballY with radius: " + (ballY + ballRadius));
          console.log("ballY - radius: " + (ballY - ballRadius));
          paddleImpact.play();
          console.log("ballspeed " + ballSpeedY);
          ballSpeedY = -ballSpeedY;
          //if came in contact with the sides of the paddle then goes to same
          //direction it came from
          //TODO speed up the ball to allow user to clear the tile faster
          if(  ballY + ballRadius >= (canvas.height - paddleHeight) +5){

                ballSpeedX= -ballSpeedX;
                // ballSpeedY = -ballSpeedY;
          }

          //direction of the ball depends on where you ball hits the paddle
            var deltaX = ballX - (paddleX + paddleWidth / 2);
              ballSpeedX = deltaX * 0.25;
        }else if(ballY + ballRadius >= canvas.height){
           clearInterval(timeTracker);
          //ball went down outside of the canvas
          // playerName = prompt("Please enter your name", "Name");
          // if (playerName != null) {
          //   playerName = playerName;
          // } else {
          //   playerName = "Anon";
          // }
          //clearing the canvas to provide  user scores
          canvas.addEventListener("mousemove", mouseMoveHandler, false);

          ctx.clearRect(0,0,canvas.width, canvas.height);
          ctx.font = "45px Frijole";
          ctx.fillText("Taken time " + timer + " Scored " + score, canvas.width/2 -300, canvas.height/2);

          // gameTimeSec = timer;
           gameOverStatus = true;
          // scoreStats();

          ballSpeedX = 0;
          ballSpeedY = 0;
          //TODO make this better currently the checking if the ball is below the
          //canvas height to gameover
           ballX =  0;
           ballY = canvas.height + 10;
        }

      // }
      //keyboard events

      if (rightKeyPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
      } else if (leftKeyPressed && paddleX > 0) {
        paddleX -= 7;
      }

      ballX += ballSpeedX;
      ballY += ballSpeedY;
      //move ball changing x and y position
      return;
    }
  }

  function mouseClickHandler(e) {
    if (showMenu === true) {
      showMenu = false;
      timer = 0;
      gameStartTime = new Date().getTime();
    }
    if (showMenu === false && gameOverStatus === true) {
      window.location.reload();
    }
  }
  function displayScore() {

    ctx.font = "40px Cabin Sketch";
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, canvas.width / 7, canvas.height -100);
  }

  function clearPreviousState() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //clear the previous state canvas
  }

  function block() {
    ctx.beginPath();
    ctx.rect(20, 40, 50, 50);
    ctx.fillStyle = "Black";
    ctx.fill();
    ctx.closePath();
  }


  function speedupBall(ballSpeed) {
    //increase ball speed
    ballSpeedY = ballSpeed * 4;
  }


  //check the keys pressed on keyboard left and right keys, keys down status
  function keyPressed(e) {
    if (e.keyCode == 39) {

      rightKeyPressed = true;
    } else if (e.keyCode == 37) {
      leftKeyPressed = true;
    }

  }
  //not pressed keys up status
  function keyNotPressed(e) {
    if (e.keyCode == 39) {
      rightKeyPressed = false;
    } else if (e.keyCode == 37) {
      leftKeyPressed = false;
    }
  }


  //save scores
  function localStoreItem() {
    localStorage.setItem("pName", playerName);
    localStorage.setItem("lowTime", gameTimeSec);
    localStorage.setItem("highScore", score);
  }
  //new scores
  function printNewHighScore() {
    ctx.fillText("You Score the highest!", 10, 400);
    ctx.fillText("Player : " + playerName, 10, 450);
    ctx.fillText("Score:" + score, 10, 500);
    ctx.fillText("Time: " + gameTimeSec, 10, 550);
  }
  //old scores
  function printOldHighScore() {
    ctx.fillText("You fail to score highest score!", 10, 400);
    ctx.fillText("Player: " + name, 10, 450);
    ctx.fillText("Score:" + highScore, 10, 500);
    ctx.fillText("Time: " + lowTime, 10, 550);
  }

  function scoreStats() {

    ctx.fillStyle = "Black";
    if (highScore == null && name == null && lowTime == null) {
      localStoreItem();
      printNewHighScore();
    } else {
      if (highScore <= score && lowTime >= gameTimeSec) {
        localStoreItem();
        printNewHighScore();
      } else {
        printOldHighScore();

      }
    }

  }
  //TODO check the collison of ball with the bricks
  //collision
  function collisionDetect() {
    /** looping through the bricks that are inside the array to check the position
     * of the bricks and comparing them with the balls to check if collison has
     * taken place
     */
    for (let col = 0; col < brickColCount; col++) {
      for (let row = 0; row < brickRowCount; row++) {
        let brick = bricks[col][row];
        //check the status of the brick to see the brick has previously made contact
        //with the ball
        if (brick.status == 1) { //brick has not made contact with the ball
          let insideBrickSurface = ballX + ballRadius >= brick.x && ballX  - ballRadius <= brick.x + brickWidth &&
				ballY +ballRadius >= brick.y && ballY-ballRadius <= brick.y + brickHeight;
           if (insideBrickSurface) { //  brick came in contact with the ball
            //  user score
            console.log("insideBrickSurface " + insideBrickSurface);
            score++;
            brickImpact.play();
            // move ball to opposite direction after it came in contact with the
            //brick
            ballSpeedY = -ballSpeedY;
            //random movement
            ballSpeedX = -ballSpeedX * randValue(0.1,0.8);
            brick.status = 0;
            //make the impact change the status to 0
            noBrickLeft(score);

          }
        }
      }
    }
  }
  //smaller paddle
  function shrinkPaddle(){
    ctx.clearRect(paddleX - 3,(canvas.height - paddleHeight )- 3,(paddleWidth + 5),paddleHeight + 5);
    console.log("paddleWidth " + paddleWidth);
    paddleWidth = paddleWidth - 2;
    console.log("paddleWidth " + paddleWidth);
    drawPaddle();
  }

    //all bricks gone
    function noBrickLeft(score) {

      if (score == brickRowCount * brickColCount) {
        playerName = prompt("Please enter your name", "Name");
        if (playerName != null) {
          playerName = playerName;
        } else {
          playerName = "Anon";
        }
        gameTimeSec = timer;
        gameOverStatus = true;
        scoreStats();

      }
    }

  function mouseMoveHandler(e) {
    //handle mouse movement
    var x = e.clientX - canvas.offsetLeft;
    if (x > 0 && x < canvas.width) {
      paddleX = x - paddleWidth / 2;
      //update the new mouse positin / paddle position

    }
  }

}
