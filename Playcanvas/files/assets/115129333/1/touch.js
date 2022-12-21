// http://developer.playcanvas.com/en/api/pc.Touch.html

let Touch = pc.createScript("touch");

// initialize code called once per entity
Touch.prototype.initialize = function () {

    this.prevScreenPosY = -1;

    this.locOrigin = new pc.Vec3();
    this.locOrigin.x = this.entity.getLocalPosition().x;
    this.locOrigin.y = this.entity.getLocalPosition().y;
    this.locOrigin.z = this.entity.getLocalPosition().z;

    this.hitBoxOrigin = new pc.Vec3();
    this.hitBoxOrigin.x = this.entity.parent.getLocalPosition().x;
    this.hitBoxOrigin.y = this.entity.parent.getLocalPosition().y;
    this.hitBoxOrigin.z = this.entity.parent.getLocalPosition().z;

    this.hitBoxRot = new pc.Quat();
    this.hitBoxRot.x = this.entity.parent.getLocalRotation().x;
    this.hitBoxRot.y = this.entity.parent.getLocalRotation().y;
    this.hitBoxRot.z = this.entity.parent.getLocalRotation().z;

    this.returnVec = new pc.Vec3();
    this.isReturning = true;
    this.returnSteps = 0;

    this.initialization = true;
    this.legalTouch = false;

    this.cameraEntity = this.app.root.findByName("camera");

    // Only register touch events if the device supports touch
    let touch = this.app.touch;
    if (touch) {
        touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this);
    }

    this.on('destroy', function () {
        touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        touch.off(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this);
    }, this);
};


Touch.prototype.updateFromScreen = function (screenPos) {

    if (screenPos.y < screen.height / 2.5 || this.entity.script.shotHandler.isFlying) { this.legalTouch = false; return; }
    this.legalTouch = true;

    let yOffset = 0;
    if (this.prevScreenPosY != -1) {
        yOffset = this.prevScreenPosY - screenPos.y;
    }

    this.prevScreenPosY = screenPos.y;

    let curPos = new pc.Vec3();
    curPos = this.entity.getLocalPosition();
    curPos.y += yOffset / (screen.height / 1.5);
    this.entity.setLocalPosition(curPos);
};


Touch.prototype.onTouchStart = function (event) {
    // only work with the first registered touch
    if (event.touches.length === 1) {
        this.updateFromScreen(event.touches[0]);
    }

    // Needs to be called to remove 300ms delay and stop 
    // browsers consuming the event for something else
    // such as zooming in
    event.event.preventDefault();
};


Touch.prototype.onTouchMove = function (event) {
    // Use only the first touch screen x y position to move the entity
    this.updateFromScreen(event.touches[0]);
    event.event.preventDefault();
};


Touch.prototype.onTouchEnd = function (event) {
    if (!this.legalTouch) { return; }

    this.prevScreenPosY = -1;
    this.setReturnVec();

    event.event.preventDefault();
};


Touch.prototype.onTouchCancel = function (event) {
    if (!this.legalTouch) { return; }

    this.prevScreenPosY = -1;
    this.setReturnVec();
    event.event.preventDefault();
};

Touch.prototype.setReturnVec = function () {

    this.returnVec.x = this.entity.getLocalPosition().x - this.locOrigin.x;
    this.returnVec.y = this.entity.getLocalPosition().y - this.locOrigin.y;
    this.returnVec.z = this.entity.getLocalPosition().z - this.locOrigin.z;
    this.isReturning = true;
};

// update code called every frame
Touch.prototype.update = function (dt) {

    if (this.isReturning) {

        let newPos = new pc.Vec3();
        newPos.x = this.entity.getLocalPosition().x - this.returnVec.x / 5;
        newPos.y = this.entity.getLocalPosition().y - this.returnVec.y / 5;
        newPos.z = this.entity.getLocalPosition().z - this.returnVec.z / 5;

        this.entity.setLocalPosition(newPos);

        if (this.returnSteps == 5) {

            this.isReturning = false;
            this.returnSteps = 0;


            if (this.initialization) { this.initialization = false; } //ignore the first initialization test shot

            else { this.entity.script.shotHandler.start(this.returnVec); }

        }

        this.returnSteps++;
    }
};