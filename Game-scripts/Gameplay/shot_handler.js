let ShotHandler = pc.createScript('shotHandler');

ShotHandler.prototype.initialize = function () {

    this.cameraEntity = this.app.root.findByName("camera");
    this.balloonCounter = this.app.root.findByName("balloons_popped");
    this.root = this.app.root.findByName("level_root");

    this.star1 = this.app.root.findByName("STAR1");
    this.star2 = this.app.root.findByName("STAR2");
    this.star3 = this.app.root.findByName("STAR3");

    //HITBOX
    this.hitBoxOrigin = this.entity.parent.getLocalPosition().clone();
    this.hitBoxRot = this.entity.parent.getLocalRotation().clone();

    //ROTATION
    this.startRotation = this.entity.getLocalRotation().clone();
    this.rotationValid = true;
    this.rotHitOffset = 0; //Hit detection offset based on the rotation of the pin around the hitbox during the fall

    //ANIMATION BOOLEANS & TIMERS
    this.isFlying = false;
    this.breakAnimation = 0;
    this.stuckTimer = 0;
    this.bounceBan = 0;
    this.lightUpTimer = 0;

    //BOOM BALLOON
    this.popScheduled = false;
    this.popIterator = 0;
    this.popAmount = 0;
    this.popArray = new Array(36);
};

ShotHandler.prototype.start = function (y) {

    this.speed = Math.abs(y * 15);
    let vecX = (this.cameraEntity.forward.x) * this.speed;
    let vecY = (this.cameraEntity.forward.y - y) * this.speed;
    let vecZ = (this.cameraEntity.forward.z) * this.speed;

    this.entity.parent.rigidbody.type = pc.BODYTYPE_DYNAMIC;
    this.entity.parent.rigidbody.mass = 1;
    this.entity.parent.rigidbody.applyImpulse(vecX, vecY, vecZ);

    this.isFlying = true;

    //PIN COUNTER
    this.app.curPinCount++;
    this.app.root.findByName("pins_used").element.text = "" + (this.app.pinCount - this.app.curPinCount);

    this.app.pinAvailable = this.app.curPinCount < this.app.pinCount;
};

ShotHandler.prototype.rotateDown = function () {

    let rot = this.entity.getLocalRotation();
    rot.x -= 0.008;
    this.entity.setLocalRotation(rot);

    this.rotHitOffset -= 0.012;
};

ShotHandler.prototype.reset = function () {

    this.entity.setLocalRotation(this.startRotation);

    this.entity.parent.rigidbody.type = pc.BODYTYPE_KINEMATIC;
    this.entity.parent.setLocalPosition(this.hitBoxOrigin);
    this.entity.parent.setLocalRotation(this.hitBoxRot);

    this.rotHitOffset = 0;

    this.rotationValid = true;
    this.isFlying = false;

    //FINISHED (NO MORE PINS)
    if (!this.app.pinAvailable) {
        this.entity.enabled = false;
        this.app.root.findByName("UI MENU").enabled = true;
    }
};

ShotHandler.prototype.update = function (dt) {

    //ANIMATIONS
    if (this.pop) { this.pop.destroy(); }

    if (this.boomPop) { this.boomPop.destroy(); }

    if (this.popScheduled) {

        let popObject = this.popArray[this.popIterator];

        if (popObject.tags.has("Balloon")) { this.balloonInteraction(popObject); }
        else if (popObject.tags.has("BoomBalloon")) { this.boomBalloonInteraction(popObject); }

        this.popIterator++;

        if (this.popAmount == this.popIterator) {
            this.popIterator = 0;
            this.popScheduled = false;
        }
    }

    if (this.breakAnimation != 0) {
        this.breakAnimation--;
        if (this.breakAnimation == 0) {
            this.breakBlock.destroy();
            this.breakAnimation = false;
        }
    }

    if (this.stuckTimer != 0) {
        this.stuckTimer--;
        if (this.stuckTimer == 0) { this.reset(); }
        return;
    }

    if (this.bounceBan != 0) {
        this.bounceBan--;
    }

    if (this.lightUpTimer != 0) {
        this.lightUpTimer--;

        if (this.lightUpTimer == 0) { this.bounceblockLIGHT.destroy(); }
    }

    //FLYING
    if (this.isFlying) {

        if (this.entity.parent.getPosition().y < 0) {
            this.reset();
            return;
        }

        if (this.rotationValid) { this.rotateDown(); }

        //COLLISION
        let hitPos = this.entity.parent.getPosition().clone();
        hitPos.y += this.rotHitOffset;
        let hitString = "Level" + this.app.levelNum + " " + Math.round(hitPos.x) + " " + Math.round(hitPos.y) + " " + Math.round(hitPos.z);
        let hitObject = this.app.root.findByName(hitString);

        if (hitObject) {

            if (hitObject.tags.has("Balloon")) { this.balloonInteraction(hitObject); }

            else if (hitObject.tags.has("Block")) {
                this.entity.parent.rigidbody.linearVelocity = new pc.Vec3(0, 0, 0);
                this.entity.parent.rigidbody.mass = 0;
                this.rotationValid = false;
                this.stuckTimer = 50;
                this.entity.sound.play('stuck');
            }

            else if (hitObject.tags.has("BounceBlock")) { this.bounceBlockInteraction(hitObject); }

            else if (hitObject.tags.has("WoodBlock")) { this.woodBlockInteraction(hitObject); }

            else if (hitObject.tags.has("BoomBalloon")) { this.boomBalloonInteraction(hitObject); }
        }
    }
};

//INTERACTION HANDLERS
ShotHandler.prototype.balloonInteraction = function (balloon) {

    this.entity.sound.play('pop');

    //POP
    let templateID;
    if (balloon.tags.has("RED")) { templateID = 117581950; }
    else if (balloon.tags.has("GREEN")) { templateID = 117581949; }
    else if (balloon.tags.has("BLUE")) { templateID = 117581948; }
    else if (balloon.tags.has("YELLOW")) { templateID = 117581951; }

    if (this.pop) { this.pop.destroy(); }
    let popAsset = this.app.assets.get(templateID);
    this.pop = popAsset.resource.instantiate();
    this.pop.setPosition(balloon.getPosition());

    this.root.addChild(this.pop);

    balloon.destroy();

    //BALLOON POP COUNT & STARS
    this.app.balloonCount++;
    this.balloonCounter.element.text = "" + this.app.balloonCount;

    if (this.app.balloonCount >= this.app.balloonClearCounts[2]) { this.star3.enabled = true; }
    else if (this.app.balloonCount >= this.app.balloonClearCounts[1]) { this.star2.enabled = true; }
    else if (this.app.balloonCount >= this.app.balloonClearCounts[0]) { this.star1.enabled = true; }
};

ShotHandler.prototype.bounceBlockInteraction = function (bounceBlock) {

    this.entity.sound.play('bounce');

    if (this.bounceBan != 0) { return; }
    this.bounce(0.9);
    this.bounceBan = 25;

    //LIGHT UP
    let bounceblockLIGHTAsset = this.app.assets.get(117581953);
    this.bounceblockLIGHT = bounceblockLIGHTAsset.resource.instantiate();
    this.bounceblockLIGHT.setLocalPosition(bounceBlock.getLocalPosition().clone());

    this.root.addChild(this.bounceblockLIGHT);
    this.lightUpTimer = 20;
};

ShotHandler.prototype.bounce = function (factor) {

    let reflectVec = new pc.Vec3();
    reflectVec.x = -this.entity.parent.rigidbody.linearVelocity.x * factor;
    reflectVec.y = -this.entity.parent.rigidbody.linearVelocity.y * factor;
    reflectVec.z = -this.entity.parent.rigidbody.linearVelocity.z * factor;

    this.entity.parent.rigidbody.linearVelocity = reflectVec;
};

ShotHandler.prototype.woodBlockInteraction = function (woodBlock) {

    this.entity.sound.play('break');

    if (this.breakBlock) { this.breakBlock.destroy(); }

    let breakAsset = this.app.assets.get(117581958);
    this.breakBlock = breakAsset.resource.instantiate();
    this.breakBlock.setPosition(woodBlock.getPosition());

    this.root.addChild(this.breakBlock);
    this.breakAnimation = 3;

    woodBlock.destroy();
    this.bounce(0.4);
};

ShotHandler.prototype.boomBalloonInteraction = function (boomBalloon) {

    //BOOM BALLOON
    let popAsset = this.app.assets.get(117581963);
    this.boomPop = popAsset.resource.instantiate();
    this.boomPop.setPosition(boomBalloon.getPosition());

    this.root.addChild(this.boomPop);
    boomBalloon.destroy();

    //OTHER BALLOONS
    this.popIterator = 0;
    this.popAmount = 0;

    let hitPos = boomBalloon.getPosition().clone();
    hitPos.y += this.rotHitOffset;

    let xOffsets = [0, 1, 0, -1, 2, 1, 0, -1, -2, 1, 0, -1, 0];
    let yOffset = 0;
    let zOffsets = [2, 1, 1, 1, 0, 0, 0, 0, 0, -1, -1, -1, -2];

    for (j = 0; j < 39; j++) {

        yOffset = Math.floor(j / 13) - 1;

        let hitString = "Level" + this.app.levelNum + " " + (Math.round(hitPos.x) + xOffsets[j % 13]) + " " + (Math.round(hitPos.y) + yOffset) + " " + (Math.round(hitPos.z) + zOffsets[j % 13]);
        let hitObject = this.app.root.findByName(hitString);

        if (hitObject) {
            if (hitObject.tags.has("Balloon") || hitObject.tags.has("BoomBalloon")) {
                this.popArray[this.popAmount] = hitObject;
                this.popAmount++;
            }
        }
    }
    this.popScheduled = true;
};