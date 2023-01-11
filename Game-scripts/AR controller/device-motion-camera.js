/* jshint esversion: 6 */
let DeviceMotionCamera = pc.createScript('deviceMotionCamera');

DeviceMotionCamera.attributes.add("startEvent", {
    type: "string",
    title: "Start Event"
});

DeviceMotionCamera.attributes.add("adjustHeading", {
    type: "boolean",
    title: "Adjust for Heading",
    default: false
});

DeviceMotionCamera.attributes.add("trackAcceleration", {
    type: "boolean",
    title: "Track Device Acceleration",
    default: false
});

/* DeviceMotionCamera.attributes.add("debugText", {
    type: "entity",
    title: "Debug Text Entity",
    default: false
}); */

const isIOS = !(
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/)
);

const LEFT90 = new pc.Quat().setFromAxisAngle(pc.Vec3.LEFT, 90);


// initialize code called once per entity
DeviceMotionCamera.prototype.initialize = function () {
    this.first = true;
    this.acc = new pc.Vec3(0, 0, 0);
    this.speed = new pc.Vec3(0, 0, 0);
    this.previousHeadingOffset = 0;
    this.currentHeadingOffset = 0;


    this.app.on(this.startEvent, this.initSensors, this);
};

DeviceMotionCamera.prototype.initSensors = function () {
    if (window.orientation === undefined) {
        console.log('Orientation could not find mobile device');
        //callback(true);
        return;
    }

    const handleDeviceOrientationChange = (evt) => {
        if (evt.alpha === null || evt.alpha === undefined) {
            return;
        }
        this.orientationData = evt;
    };

    const handleDeviceOrientationChangeAbsolute = (evt) => {
        if (evt.alpha === null || evt.alpha === undefined) {
            return;
        }
        this.absData = evt;
    };

    const handleDeviceMotionEvent = (event) => {
        if (this.trackAcceleration) {
            this.entity.translate(this.entity.forward.mulScalar(this.speed.z * event.interval));
            this.entity.translate(this.entity.right.mulScalar(-this.speed.x * event.interval));
            this.entity.translate(this.entity.up.mulScalar(-this.speed.y * event.interval));
            this.speed.add(this.acc.clone().mulScalar(event.interval));
            this.acc = new pc.Vec3(event.acceleration.x, event.acceleration.y, event.acceleration.z);
        }
    };

    const init = () => {
        this.app.permissionsGiven = true;
        if (this.adjustHeading && 'ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', handleDeviceOrientationChangeAbsolute, false);
        }

        if ('ondeviceorientation' in window) {
            window.addEventListener('deviceorientation', handleDeviceOrientationChange, false);
        }

        if (this.trackAcceleration)
            window.addEventListener('devicemotion', handleDeviceMotionEvent, false);
        //callback();
    };
    if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    init();
                } else {
                    console.error(`dosen't understand response ${response}`);
                    //callback(true);
                }
            })
            .catch((e) => {
                console.error(e);
                //callback(true);

            });
    } else {
        init();
    }
};


DeviceMotionCamera.prototype.fromOrientation = function ({ alpha, beta, gamma }, orientation) {
    const a = new pc.Quat().setFromAxisAngle(pc.Vec3.UP, alpha);
    const b = new pc.Quat().setFromAxisAngle(pc.Vec3.RIGHT, beta);
    const g = new pc.Quat().setFromAxisAngle(pc.Vec3.FORWARD, gamma);

    let rot = a.mul(b).mul(g).mul(LEFT90);
    if (orientation) {
        const dir = rot.transformVector(pc.Vec3.FORWARD);
        rot = new pc.Quat().setFromAxisAngle(dir, orientation)
            .mul(rot);
    }
    return rot;
};

DeviceMotionCamera.prototype.updateTransform = function (dt) {
    if (this.orientationData) {
        if (this.orientationData.webkitCompassHeading) {
            this.heading = this.orientationData.webkitCompassHeading;
            this.headingAvailable = true;
        } else if (this.absData) {
            this.heading = Math.abs(this.absData.alpha - 360);
            this.headingAvailable = true;
        }
        //console.log("Heading available?: " + this.headingAvailable);
        /*         this.debugText.element.text = "Heading: " + this.heading +
                    "\nAlpha: " + this.orientationData.alpha +
                    "\nBeta: " + this.orientationData.beta +
                    "\nGamma: " + this.orientationData.gamma; */
        this.alphaOffset = 0;
        this.rot = this.fromOrientation(this.orientationData, window.orientation);
        if (this.rot) {
            this.entity.setRotation(this.rot);
            if (this.headingAvailable) {
                let rot = this.entity.getRotation().clone();
                let yaw = this.getYaw(rot);
                yaw = yaw < 0 ? 360 + yaw : yaw;
                this.headingOffset = (360 - this.heading) - yaw;

                if (this.headingOffset < 0)
                    this.headingOffset = 360 + this.headingOffset;

                this.headingDiff = this.headingOffset - this.previousHeadingOffset;

                if (Math.abs(this.headingDiff) > 15)
                    this.currentHeadingOffset = this.headingOffset;
                else if (Math.abs(this.headingDiff) > 5)
                    this.currentHeadingOffset += (this.headingDiff * dt);
                /* 
                                this.debugText.element.text += "\nHeadingOffset: " + this.headingOffset +
                                    "\nYaw: " + yaw; */


                this.entity.rotate(0, this.currentHeadingOffset, 0);
                this.previousHeadingOffset = this.headingOffset;

            }

        }
    }

};
var _transformedForward = new pc.Vec3();

DeviceMotionCamera.prototype.getYaw = function (quat) {
    var transformedForward = _transformedForward;
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);

    return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
};

DeviceMotionCamera.prototype.computeCompassHeading = function (alpha, beta, gamma) {

    // Convert degrees to radians
    var alphaRad = alpha * (Math.PI / 180);
    var betaRad = beta * (Math.PI / 180);
    var gammaRad = gamma * (Math.PI / 180);

    // Calculate equation components
    var cA = Math.cos(alphaRad);
    var sA = Math.sin(alphaRad);
    var sB = Math.sin(betaRad);
    var cG = Math.cos(gammaRad);
    var sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    var rA = - cA * sG - sA * sB * cG;
    var rB = - sA * sG + cA * sB * cG;

    // Calculate compass heading
    var compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if (rB < 0) {
        compassHeading += Math.PI;
    } else if (rA < 0) {
        compassHeading += 2 * Math.PI;
    }

    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;

    return compassHeading;
};

// update code called every frame
DeviceMotionCamera.prototype.update = function (dt) {
    this.updateTransform(dt);
};

// swap method called for script hot-reloading
// inherit your script state here
// DeviceMotionCamera.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/