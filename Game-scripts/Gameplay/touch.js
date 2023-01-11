let Touch = pc.createScript("touch");

Touch.prototype.initialize = function () {

    this.cameraEntity = this.app.root.findByName("camera");

    //RETURN VECTOR
    this.locOrigin = this.entity.getLocalPosition().clone();
    this.returnY = 0;
    this.isReturning = true;
    this.returnSteps = 0;

    //POWER BAR
    this.uiCover = this.app.root.findByName("powerUI_cover");
    this.uiStartPos = this.uiCover.getLocalPosition().clone();

    //TOUCH
    this.initialization = true;
    this.legalTouch = false;
    this.prevScreenPosY = -1;

    let touch = this.app.touch;
    if (touch) {
        touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this);
    }

    // Only register touch events if the device supports touch
    this.on('destroy', function () {
        touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        touch.off(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this);
    }, this);
};

Touch.prototype.updateFromScreen = function (screenPos) {

    if (screenPos.y < screen.height / 2.8 || this.entity.script.shotHandler.isFlying) { this.legalTouch = false; return; }
    this.legalTouch = true;

    let yOffset = 0;
    if (this.prevScreenPosY != -1) {
        yOffset = this.prevScreenPosY - screenPos.y;
    }
    this.prevScreenPosY = screenPos.y;

    let curPos = this.entity.getLocalPosition();
    curPos.y += yOffset / (screen.height / 1.5);
    this.entity.setLocalPosition(curPos);

    //POWER BAR
    let power = this.entity.getLocalPosition().y - this.locOrigin.y;
    let uiPos = this.uiCover.getLocalPosition();
    uiPos.y = this.uiStartPos.y - power * 330;
    this.uiCover.setLocalPosition(uiPos);
};


Touch.prototype.onTouchStart = function (event) {
    // only work with the first registered touch
    if (event.touches.length === 1) {
        this.updateFromScreen(event.touches[0]);
        this.entity.setLocalPosition(this.locOrigin); //fix offset from prev screen pos
    }

    // Needs to be called to remove 300ms delay and stop 
    // browsers consuming the event for something else
    // such as zooming in
    event.event.preventDefault();
};


Touch.prototype.onTouchMove = function (event) {
    if (!this.legalTouch) { return; }

    this.updateFromScreen(event.touches[0]);
    event.event.preventDefault();
};

Touch.prototype.onTouchEnd = function (event) {
    if (!this.legalTouch) { return; }

    this.prevScreenPosY = -1;
    this.setReturnY();

    event.event.preventDefault();
};

Touch.prototype.onTouchCancel = function (event) { this.onTouchEnd(event); };

Touch.prototype.setReturnY = function () {

    this.returnY = this.entity.getLocalPosition().y - this.locOrigin.y;
    if (this.returnY < -0.8) { this.returnY = -0.8; }
    this.isReturning = true;

    //SOUND
    let volumeOffset = this.returnY + 0.2;
    this.entity.sound.slot('shoot').volume = Math.abs(this.returnY * volumeOffset);
    this.entity.sound.play('shoot');
};

// update code called every frame
Touch.prototype.update = function (dt) {

    if (this.isReturning) {

        this.entity.getLocalPosition().y -= this.returnY / 5;
        this.entity.setLocalPosition(this.entity.getLocalPosition()); //yes this is necessary

        if (this.returnSteps == 5) {

            this.isReturning = false;
            this.returnSteps = 0;

            if (this.initialization) { this.initialization = false; } //ignore the first initialization test shot

            else { this.entity.script.shotHandler.start(this.returnY); }

            this.uiCover.setLocalPosition(this.uiStartPos);
        }
        this.returnSteps++;
    }
};