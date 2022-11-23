//Setting a sprite lifespan and visibility
//click on the canvas to create self destructing sprite and toggle visibility

var cloud;

function setup() {
  createCanvas(800, 400);

  cloud = createSprite(400, 200);
  cloud.addAnimation('normal', 'assets/cloud_breathing0001.png', 'assets/cloud_breathing0009.png');
  cloud.velocity.x = 3;
  
   circle = createSprite(400, 200);
  //compact way to add an image
  circle.addImage(loadImage('assets/plain_circle.png'));
  circle.scale = 0.1;
}

function draw() {
  background(255, 255, 255);
  
  circle.position.x = mouseX;
  circle.position.y = mouseY;

  //sprites' visibility can be turned on an off
  //and invisible sprite is still updating normally
  if(mouseIsPressed)
    cloud.visible = false;
  else
    cloud.visible = true;

  if(cloud.position.x > width){
    cloud.position.x = 0;
  }
  if(cloud.position.x < 0){
    cloud.position.x = width;
  }
  if(cloud.position.y > height){
    cloud.position.y = 0;
  }
  if(cloud.position.y < 0){
    cloud.position.y = height;
  }
 
  //  if(mouseY > cloud.position.y-10 && mouseY < cloud.position.y+10 && mouseX > cloud.position.x-10 && mouseX < cloud.position.x+10){
   if(cloud.overlap(circle)){
        //mousePressed();
        var s = createSprite(mouseX, mouseY, 30, 30);
        s.velocity.x = random(-5, 5);
  s.velocity.y = random(-5, 5);
        
           cloud.velocity.x = random(-3, 3);
            cloud.velocity.y = random(-3, 3);

    }
        

  //draw the sprites
  drawSprites();
}

//every mouse press
function mousePressed() {

  //create a sprite
  var splat = createSprite(mouseX, mouseY);
  splat.addAnimation('normal', 'assets/asterisk_explode0001.png', 'assets/asterisk_explode0011.png');

  //set a self destruction timer (life)
  splat.life = 10;
}
