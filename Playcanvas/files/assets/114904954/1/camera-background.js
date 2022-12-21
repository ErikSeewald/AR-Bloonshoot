var CameraBackground = pc.createScript('cameraBackground');
/* 
CameraBackground.attributes.add("debugText", {
    type: 'entity'
}); */

CameraBackground.attributes.add('permissionEvent', {
    title: 'Camera Permission Event Name',
    description: 'Event to listen for.',
    type: 'string'
});

CameraBackground.attributes.add('startEvent', {
    title: 'Start Event Name',
    description: 'Event to listen for.',
    type: 'string'
});

// initialize code called once per entity
CameraBackground.prototype.initialize = function () {
    var self = this;

    this.app.on(this.permissionEvent, (callback) => {
        // let options = {
        //     enableHighAccuracy: true,
        //     maximumAge: 0,
        //     timeout: 27000
        // };
        // navigator.geolocation.watchPosition((position) => {
        //     var text = "latitude: " + position.coords.latitude +
        //         "\n" + "longitude: " + position.coords.longitude +
        //         "\n" + "altitude: " + position.coords.altitude +
        //         "\n" + "accuracy: " + position.coords.accuracy;
        //     /* this.debugText.element.text = text; */
        //     this.originCoords = position.coords;
        //     console.log(text);
        // }, (e) => console.log(e), options);

        var constraints = {
            audio: false,
            video: {
                // Prefer the rear camera
                facingMode: "environment",
                advanced: [{
                    zoom: 2.0,
                    focusMode: "continuous"
                }]
            }
        };
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            self.app.cameraAccess = true;
            self.videoPlaying = false;

            // Create the video element to receive the camera stream
            var video = document.createElement('video');

            video.setAttribute('autoplay', '');
            video.setAttribute('muted', '');
            // This is critical for iOS or the video initially goes fullscreen
            video.setAttribute('playsinline', '');
            video.srcObject = stream;

            self.video = video;

            // Check for both video and canvas resizing
            // Changing screen orientation on mobile can change both!
            self.app.graphicsDevice.on('resizecanvas', function () {
                //self.onResize();
            });
            video.addEventListener('resize', function () {
                //self.onResize();
            });

            // Only play the video when it's actually ready
            video.addEventListener('canplay', function () {
                self.canplay = true;

                callback();
            });
            // iOS needs a user action to start the video
            // if (pc.platform.mobile) {
            //     window.addEventListener('touchstart', function (e) {
            //         e.preventDefault();
            //         if (!self.videoPlaying) {
            //             self.startVideo();
            //             self.videoPlaying = true;
            //         }
            //     });
            // }
        }).catch(function (e) {
            if (e) console.error("ERROR: Unable to acquire camera stream");
            self.app.cameraAccess = false;
            callback(e);
        });
    }, this);

    this.app.on(this.startEvent, () => {
        self.startVideo();
        self.videoPlaying = true;
        console.log("Starting Video...");

    }, this);
};

// update code called every frame
CameraBackground.prototype.update = function (dt) {

};

CameraBackground.prototype.startVideo = function () {
    // Create a video element that is full tab and centered
    // CCS taken from: https://slicejack.com/fullscreen-html5-video-background-css/
    var style = this.video.style;
    style.position = 'absolute';
    style.top = '50%';
    style.left = '50%';
    style.width = 'auto';
    style.height = 'auto';
    style.minWidth = '100%';
    style.minHeight = '100%';
    style.backgroundSize = 'cover';
    style.overflow = 'hidden';
    style.transform = 'translate(-50%, -50%)';
    style.zIndex = '0';
    document.body.appendChild(this.video);

    // Z-order for page is:
    //   0: Video DOM element
    //   1: PlayCanvas canvas element
    this.app.graphicsDevice.canvas.style.zIndex = '1';

};
// swap method called for script hot-reloading
// inherit your script state here
// CameraBackground.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/