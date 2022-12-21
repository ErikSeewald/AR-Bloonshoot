let ShotHandler = pc.createScript('shotHandler');

// initialize code called once per entity
ShotHandler.prototype.initialize = function () {

    this.cameraEntity = this.app.root.findByName("camera");

    this.startRotation = this.entity.getLocalRotation().clone();

    this.isFlying = false;
};

// update code called every frame
ShotHandler.prototype.update = function (dt) {

    if (this.isFlying) {

        if (this.entity.parent.getPosition().y < 0) {

            this.entity.setLocalRotation(this.startRotation);

            this.entity.parent.rigidbody.type = pc.BODYTYPE_KINEMATIC;
            this.isFlying = false;

            this.entity.parent.setLocalPosition(this.entity.script.touch.hitBoxOrigin);
            this.entity.parent.setLocalRotation(this.entity.script.touch.hitBoxRot);

            return;
        }

        this.rotateDown();

        let hitPos = this.entity.parent.getPosition();
        let hitString = "Level" + this.app.levelNum + " " + Math.floor(hitPos.x) + " " + Math.floor(hitPos.y) + " " + Math.floor(hitPos.z);
        let hitObject = this.app.root.findByName(hitString);
        if (hitObject) { hitObject.destroy(); }

    }
};

ShotHandler.prototype.rotateDown = function () {

    let rot = this.entity.getLocalRotation();
    rot.x -= 0.008;

    this.entity.setLocalRotation(rot);

};


ShotHandler.prototype.start = function (locVec) {

    this.speed = Math.abs(locVec.y * 15);
    let vecX = (this.cameraEntity.forward.x * this.speed) - locVec.x * this.speed;
    let vecY = (this.cameraEntity.forward.y * this.speed) - locVec.y * this.speed;
    let vecZ = (this.cameraEntity.forward.z * this.speed) - locVec.z * this.speed;

    this.entity.parent.rigidbody.type = pc.BODYTYPE_DYNAMIC;
    this.entity.parent.rigidbody.applyImpulse(vecX, vecY, vecZ);


    this.isFlying = true;
};