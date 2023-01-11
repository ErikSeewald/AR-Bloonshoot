let LevelLoader = pc.createScript('levelLoader');


LevelLoader.attributes.add('next_level_Event', {
    title: 'Next Level Event Name',
    description: 'Event to listen for.',
    type: 'string'
});

LevelLoader.attributes.add('previous_level_Event', {
    title: 'Previous Level Event Name',
    description: 'Event to listen for.',
    type: 'string'
});

LevelLoader.attributes.add('restart_Event', {
    title: 'Restart Event Name',
    description: 'Event',
    type: 'string'
});

LevelLoader.prototype.initialize = function () {

    //APP GLOBAL VARIABLES
    this.app.levelNum = 1;
    this.app.pinAvailable = true;
    this.app.pinCount = 15; //amount of pins available
    this.app.curPinCount = 0; //pins used
    this.app.balloonClearCounts = [10, 20, 30]; //amount of balloons to get stars
    this.app.balloonCount = 0;

    //EVENTS
    this.app.on(this.next_level_Event, () => {
        this.app.levelNum++;
        if (this.app.levelNum > 5) { this.app.levelNum = 1; }

        this.loadLevel();
        this.app.root.findByName("Pin").script.shotHandler.reset();

    }, this);

    this.app.on(this.previous_level_Event, () => {
        this.app.levelNum--;
        if (this.app.levelNum < 1) { this.app.levelNum = 5; }

        this.loadLevel();
        this.app.root.findByName("Pin").script.shotHandler.reset();

    }, this);

    this.app.on(this.restart_Event, () => {

        this.loadLevel();
        this.app.root.findByName("Pin").script.shotHandler.reset();

    }, this);
};

LevelLoader.prototype.loadLevel = function () {

    //UI
    this.app.root.findByName("STAR1").enabled = false;
    this.app.root.findByName("STAR2").enabled = false;
    this.app.root.findByName("STAR3").enabled = false;
    this.app.root.findByName("UI MENU").enabled = false;

    //ROOT
    if (this.root) { this.root.destroy(); }
    this.root = new pc.Entity();
    this.root.name = "level_root";
    this.entity.addChild(this.root);

    //LEVEL
    let level;
    switch (this.app.levelNum) {
        case 2: level = new Level_2();
            break;
        case 3: level = new Level_3();
            break;
        case 4: level = new Level_4();
            break;
        case 5: level = new Level_5();
            break;

        default: level = new Level_1();
    }

    //GLOBAL VARIABLES
    this.app.pinAvailable = true;
    this.app.pinCount = level.pinCount;
    this.app.curPinCount = 0;
    this.app.balloonClearCounts = level.balloonClearCounts;
    this.app.balloonCount = 0;

    //COUNTERS
    this.app.root.findByName("balloons_popped").element.text = "0";
    this.app.root.findByName("pins_used").element.text = this.app.pinCount;


    //____________ LEVEL ____________//

    let templateID;

    //BALLOONS
    console.log("Balloons:");
    for (i = 0; i < level.getBalloonCount(); i++) {

        let random = (Math.floor((Math.random() * 10))) % 4;

        switch (random) {
            case 0: templateID = 117581908; //RED
                break;
            case 1: templateID = 117581904;//GREEN
                break;
            case 2: templateID = 117581983; //BLUE
                break;
            case 3: templateID = 117581913;//YELLOW
                break;
        }

        let balloonAsset = this.app.assets.get(templateID);
        let balloon = balloonAsset.resource.instantiate();

        j = i * 3;

        balloon.setPosition(new pc.Vec3(
            -level.getBalloon(j), //X -> X, flipping to line up with blender file
            level.getBalloon(j + 2), //Z -> Y
            level.getBalloon(j + 1) //Y -> Z
        ));

        balloon.name = "Level" + this.app.levelNum + " " + balloon.getPosition().x + " " + balloon.getPosition().y + " " + balloon.getPosition().z;
        console.log(balloon.name);

        balloon.tags.add("Balloon");

        switch (random) {
            case 0: balloon.tags.add("RED");
                break;
            case 1: balloon.tags.add("GREEN");
                break;
            case 2: balloon.tags.add("BLUE");
                break;
            case 3: balloon.tags.add("YELLOW");
                break;
        }

        this.root.addChild(balloon);
    }

    //OTHER TYPES OF ENTITIES
    let loopLength = 0;
    let tag = "";
    for (x = 0; x < 4; x++) {

        switch (x) {
            case 0: templateID = 117581895; loopLength = level.getBlockCount(); tag = "Block";
                break;
            case 1: templateID = 117581898; loopLength = level.getBoomBalloonCount(); tag = "BoomBalloon";
                break;
            case 2: templateID = 117581896; loopLength = level.getBounceBlockCount(); tag = "BounceBlock";
                break;
            case 3: templateID = 117581897; loopLength = level.getWoodBlockCount(); tag = "WoodBlock";
                break;
        }

        console.log(tag + "s:");
        let entityAsset = this.app.assets.get(templateID);

        for (i = 0; i < loopLength; i++) {

            let entity = entityAsset.resource.instantiate();

            j = i * 3;

            switch (x) {
                case 0: entity.setPosition(new pc.Vec3(-level.getBlock(j), level.getBlock(j + 2), level.getBlock(j + 1)));
                    break;
                case 1: entity.setPosition(new pc.Vec3(-level.getBoomBalloon(j), level.getBoomBalloon(j + 2), level.getBoomBalloon(j + 1)));
                    break;
                case 2: entity.setPosition(new pc.Vec3(-level.getBounceBlock(j), level.getBounceBlock(j + 2), level.getBounceBlock(j + 1)));
                    break;
                case 3: entity.setPosition(new pc.Vec3(-level.getWoodBlock(j), level.getWoodBlock(j + 2), level.getWoodBlock(j + 1)));
                    break;
            }

            entity.name = "Level" + this.app.levelNum + " " + entity.getPosition().x + " " + entity.getPosition().y + " " + entity.getPosition().z;
            console.log(entity.name);

            entity.tags.add(tag);

            this.root.addChild(entity);
        }
    }
};


//______________________________________________________________________________________________________________________________//
//______________________________________________________________________________________________________________________________//
//______________________________________________________________________________________________________________________________//
//______________________________________________________________________________________________________________________________//
//______________________________________________________________________________________________________________________________//
//__________________________________________________________LEVEL DATA__________________________________________________________//
//______________________________________________________________________________________________________________________________//
//______________________________________________________________________________________________________________________________//
//______________________________________________________________________________________________________________________________//
//______________________________________________________________________________________________________________________________//




class Level_1 {

    constructor() {

        this.pinCount = 15;
        this.balloonClearCounts = [5, 20, 30];

        this.Balloon_Count = 46;

        this.Balloons =
            [
                4, 5, 1,
                4, 5, 2,
                4, 6, 1,
                4, 6, 2,
                5, 5, 1,
                5, 5, 2,
                5, 6, 1,
                5, 6, 2,

                19, 9, 6,
                19, 10, 6,
                19, 11, 6,
                19, 12, 6,
                20, 9, 6,
                20, 10, 6,
                20, 11, 6,
                20, 12, 6,
                24, 5, 6,
                24, 6, 6,
                25, 5, 6,
                25, 6, 6,
                26, 5, 6,
                26, 6, 6,
                27, 5, 6,
                27, 6, 6,

                20, 25, 6,
                20, 26, 7,
                21, 27, 8,
                23, 21, 3,
                24, 22, 2,
                25, 23, 1,

                5, 17, 1,
                5, 17, 2,
                5, 17, 3,
                5, 17, 4,
                5, 18, 1,
                5, 18, 2,
                5, 18, 3,
                5, 18, 4,
                11, 23, 1,
                11, 23, 2,
                11, 23, 3,
                11, 23, 4,
                12, 23, 1,
                12, 23, 2,
                12, 23, 3,
                12, 23, 4,
            ];
    }

    getBalloonCount() { return this.Balloon_Count; }
    getBalloon(i) { return this.Balloons[i]; }

    getBlockCount() { }
    getBlock(i) { }

    getBoomBalloonCount() { }
    getBoomBalloon(i) { }

    getBounceBlockCount() { }
    getBounceBlock(i) { }

    getWoodBlockCount() { }
    getWoodBlock(i) { }
}

class Level_2 {
    constructor() {

        this.pinCount = 15;
        this.balloonClearCounts = [25, 32, 40];

        this.Balloon_Count = 72;
        this.Balloons = [
            9, 7, 1,
            9, 7, 2,
            9, 7, 3,
            9, 7, 4,
            10, 7, 1,
            10, 7, 2,
            10, 7, 3,
            10, 7, 4,
            11, 7, 1,
            11, 7, 2,
            11, 7, 3,
            11, 7, 4,
            12, 7, 1,
            12, 7, 2,
            12, 7, 3,
            12, 7, 4,

            24, 5, 1,
            24, 6, 1,
            25, 5, 1,
            25, 6, 1,
            26, 5, 1,
            26, 6, 1,
            27, 5, 1,
            27, 6, 1,

            20, 21, 1,
            20, 21, 2,
            20, 22, 1,
            20, 22, 2,
            21, 21, 1,
            21, 21, 2,
            21, 22, 1,
            21, 22, 2,
            25, 26, 1,
            25, 26, 2,
            25, 26, 3,
            25, 26, 4,
            25, 27, 1,
            25, 27, 2,
            25, 27, 3,
            25, 27, 4,
            26, 26, 1,
            26, 26, 2,
            26, 26, 3,
            26, 26, 4,
            26, 27, 1,
            26, 27, 2,
            26, 27, 3,
            26, 27, 4,

            5, 17, 1,
            5, 17, 2,
            5, 17, 3,
            5, 17, 4,
            5, 18, 1,
            5, 18, 2,
            5, 18, 3,
            5, 18, 4,
            7, 21, 6,
            7, 22, 6,
            7, 23, 6,
            7, 24, 6,
            8, 21, 6,
            8, 22, 6,
            8, 23, 6,
            8, 24, 6,
            9, 21, 6,
            9, 22, 6,
            9, 23, 6,
            9, 24, 6,
            10, 21, 6,
            10, 22, 6,
            10, 23, 6,
            10, 24, 6,
        ];

        this.Block_Count = 30;
        this.Blocks = [
            12, 11, 3,
            12, 11, 5,
            13, 10, 3,
            13, 10, 5,
            13, 11, 3,
            13, 11, 5,

            20, 10, 3,
            21, 11, 5,
            24, 9, 4,
            23, 11, 3,

            21, 24, 1,
            21, 24, 2,
            21, 24, 3,
            21, 24, 4,
            23, 22, 1,
            23, 22, 2,
            23, 22, 3,
            23, 22, 4,

            7, 23, 7,
            7, 24, 7,
            8, 23, 7,
            8, 24, 7,
            9, 19, 1,
            9, 19, 2,
            9, 19, 3,
            9, 19, 4,
            10, 18, 1,
            10, 18, 2,
            10, 18, 3,
            10, 18, 4,
        ];
    }

    getBalloonCount() { return this.Balloon_Count; }
    getBalloon(i) { return this.Balloons[i]; }

    getBlockCount() { return this.Block_Count; }
    getBlock(i) { return this.Blocks[i]; }

    getBoomBalloonCount() { }
    getBoomBalloon(i) { }

    getBounceBlockCount() { }
    getBounceBlock(i) { }

    getWoodBlockCount() { }
    getWoodBlock(i) { }
}

class Level_3 {
    constructor() {

        this.pinCount = 20;
        this.balloonClearCounts = [40, 50, 55];

        this.Balloon_Count = 81;
        this.Balloons = [
            4, 4, 2,
            4, 4, 3,
            4, 5, 2,
            4, 6, 2,
            4, 6, 3,
            4, 7, 2,
            4, 7, 3,
            5, 4, 2,
            5, 4, 3,
            5, 5, 2,
            5, 5, 3,
            5, 6, 2,
            5, 6, 3,
            5, 7, 2,
            5, 7, 3,
            6, 4, 2,
            6, 4, 3,
            6, 5, 2,
            6, 5, 3,
            6, 6, 2,
            6, 6, 3,
            6, 7, 2,
            6, 7, 3,
            7, 4, 2,
            7, 4, 3,
            7, 5, 2,
            7, 5, 3,
            7, 6, 2,
            7, 6, 3,
            7, 7, 2,
            7, 7, 3,

            22, 5, 1,
            22, 6, 1,
            23, 3, 1,
            23, 4, 1,
            23, 5, 1,
            23, 6, 1,
            24, 3, 1,
            24, 4, 1,
            24, 5, 1,
            24, 6, 1,
            25, 3, 1,
            25, 4, 1,
            25, 5, 1,
            26, 3, 1,
            26, 4, 1,
            26, 5, 1,
            26, 6, 1,
            27, 3, 1,
            27, 4, 1,

            21, 23, 2,
            21, 23, 3,
            21, 23, 4,
            22, 22, 2,
            22, 22, 3,
            22, 22, 4,
            22, 24, 2,
            22, 24, 3,
            22, 24, 4,
            23, 23, 2,
            23, 23, 3,
            23, 23, 4,
            23, 25, 2,
            23, 25, 3,
            23, 25, 4,
            24, 24, 2,
            24, 24, 3,
            24, 24, 4,

            4, 22, 5,
            5, 25, 6,
            5, 26, 7,
            6, 20, 6,
            6, 21, 7,
            6, 22, 6,
            6, 26, 5,
            6, 27, 8,
            7, 22, 6,
            7, 26, 6,
            8, 23, 5,
        ];

        this.Block_Count = 10;
        this.Blocks = [
            19, 11, 1,
            19, 11, 2,
            20, 12, 1,
            20, 12, 2,

            7, 23, 3,
            8, 24, 8,
            9, 24, 6,
            10, 25, 3,
        ];

        this.BounceBlock_Count = 47;
        this.BounceBlocks = [
            3, 4, 1,
            3, 4, 2,
            3, 4, 3,
            3, 5, 1,
            3, 5, 2,
            3, 5, 3,
            3, 6, 1,
            3, 6, 2,
            3, 6, 3,
            4, 3, 1,
            4, 3, 2,
            4, 3, 3,
            5, 3, 1,
            5, 3, 2,
            5, 3, 3,
            6, 3, 1,
            6, 3, 2,
            6, 3, 3,
            4, 4, 0,
            4, 5, 0,
            5, 4, 0,
            5, 5, 0,

            22, 6, 5,
            22, 7, 5,
            23, 6, 5,
            23, 7, 5,

            20, 24, 2,
            20, 24, 3,
            20, 24, 4,
            21, 25, 2,
            21, 25, 3,
            21, 25, 4,
            22, 26, 2,
            22, 26, 3,
            22, 26, 4,
            23, 21, 2,
            23, 21, 3,
            23, 21, 4,
            24, 22, 2,
            24, 22, 3,
            24, 22, 4,
            25, 23, 2,
            25, 23, 3,
            25, 23, 4,

            4, 25, 5,
            6, 25, 9,
            9, 26, 4,
        ];
    }

    getBalloonCount() { return this.Balloon_Count; }
    getBalloon(i) { return this.Balloons[i]; }

    getBlockCount() { return this.Block_Count; }
    getBlock(i) { return this.Blocks[i]; }

    getBoomBalloonCount() { }
    getBoomBalloon(i) { }

    getBounceBlockCount() { return this.BounceBlock_Count; }
    getBounceBlock(i) { return this.BounceBlocks[i]; }

    getWoodBlockCount() { }
    getWoodBlock(i) { }
}


class Level_4 {
    constructor() {

        this.pinCount = 20;
        this.balloonClearCounts = [30, 38, 45];

        this.Balloon_Count = 74;
        this.Balloons = [
            4, 5, 2,
            4, 6, 2,
            4, 6, 3,
            5, 4, 2,
            5, 4, 3,
            5, 5, 2,
            5, 5, 3,
            5, 6, 2,
            5, 6, 3,
            5, 7, 2,
            5, 7, 3,
            6, 4, 2,
            6, 4, 3,
            6, 6, 2,
            6, 6, 3,
            6, 7, 2,
            6, 7, 3,
            7, 4, 2,
            7, 4, 3,
            7, 5, 2,
            7, 5, 3,
            7, 6, 2,
            7, 6, 3,

            23, 3, 3,
            23, 4, 3,
            23, 5, 3,
            24, 3, 3,
            24, 4, 3,
            24, 6, 3,
            25, 3, 3,
            25, 5, 3,
            25, 6, 3,
            26, 4, 3,
            26, 5, 3,
            26, 6, 3,

            17, 27, 4,
            17, 28, 5,
            18, 27, 3,
            18, 28, 4,
            19, 28, 4,
            22, 22, 2,
            22, 22, 3,
            22, 22, 4,
            22, 23, 2,
            22, 23, 3,
            22, 23, 4,
            23, 16, 4,
            23, 22, 2,
            23, 22, 3,
            23, 22, 4,
            24, 16, 4,
            26, 16, 4,

            5, 22, 2,
            5, 22, 3,
            5, 23, 2,
            5, 23, 3,
            5, 24, 2,
            5, 24, 3,
            6, 22, 2,
            6, 22, 3,
            6, 23, 2,
            6, 23, 3,
            6, 24, 2,
            6, 24, 3,
            7, 21, 2,
            7, 21, 3,
            7, 22, 2,
            7, 22, 3,
            7, 23, 2,
            7, 23, 3,
            7, 24, 2,
            7, 24, 3,
            8, 22, 2,
            8, 22, 3,
        ];

        this.Block_Count = 10;
        this.Blocks = [
            17, 26, 3,
            19, 27, 5,

            6, 19, 2,
            6, 19, 3,
            7, 20, 2,
            7, 20, 3,
            9, 22, 2,
            9, 22, 3,
            10, 23, 2,
            10, 23, 3,
        ];

        this.BounceBlock_Count = 11;
        this.BounceBlocks = [
            21, 4, 3,
            22, 5, 3,
            23, 6, 3,
            24, 7, 3,
            25, 8, 3,

            21, 23, 2,
            21, 23, 3,
            21, 23, 4,
            23, 21, 2,
            23, 21, 3,
            23, 21, 4,
        ];

        this.WoodBlock_Count = 29;
        this.WoodBlocks = [
            5, 8, 2,
            5, 8, 3,
            6, 8, 2,
            6, 8, 3,
            7, 8, 2,
            7, 8, 3,
            8, 5, 2,
            8, 5, 3,
            8, 6, 2,
            8, 6, 3,
            8, 7, 2,
            8, 7, 3,

            23, 3, 4,
            23, 4, 4,
            23, 5, 4,
            24, 3, 4,
            24, 4, 4,
            24, 5, 4,
            24, 6, 4,
            25, 3, 4,
            25, 4, 4,
            25, 5, 4,
            25, 6, 4,
            26, 4, 4,
            26, 5, 4,
            26, 6, 4,

            22, 16, 4,

            8, 21, 2,
            8, 21, 3,
        ];
    }

    getBalloonCount() { return this.Balloon_Count; }
    getBalloon(i) { return this.Balloons[i]; }

    getBlockCount() { return this.Block_Count; }
    getBlock(i) { return this.Blocks[i]; }

    getBoomBalloonCount() { }
    getBoomBalloon(i) { }

    getBounceBlockCount() { return this.BounceBlock_Count; }
    getBounceBlock(i) { return this.BounceBlocks[i]; }

    getWoodBlockCount() { return this.WoodBlock_Count; }
    getWoodBlock(i) { return this.WoodBlocks[i]; }
}

class Level_5 {
    constructor() {

        this.pinCount = 15;
        this.balloonClearCounts = [80, 100, 111];

        this.Balloon_Count = 132;
        this.Balloons = [
            4, 5, 2,
            4, 6, 2,
            4, 6, 3,
            5, 4, 2,
            5, 4, 3,
            5, 5, 2,
            5, 5, 3,
            5, 6, 2,
            5, 6, 3,
            5, 7, 2,
            5, 7, 3,
            6, 4, 2,
            6, 4, 3,
            6, 6, 2,
            6, 7, 2,
            6, 7, 3,
            7, 4, 2,
            7, 4, 3,
            7, 5, 2,
            7, 5, 3,
            7, 6, 2,
            7, 6, 3,

            24, 4, 3,
            24, 5, 3,
            24, 6, 3,
            24, 7, 3,
            25, 4, 3,
            25, 5, 3,
            25, 6, 3,
            25, 7, 3,
            26, 5, 3,
            26, 6, 3,
            26, 7, 3,

            19, 23, 6,
            19, 24, 6,
            20, 20, 4,
            20, 21, 4,
            20, 22, 2,
            20, 23, 2,
            20, 24, 2,
            21, 22, 2,
            21, 23, 2,
            21, 24, 2,
            22, 22, 2,
            22, 23, 2,
            22, 24, 2,

            4, 24, 2,
            4, 24, 3,
            4, 24, 4,
            4, 25, 2,
            4, 25, 3,
            4, 25, 4,
            5, 23, 2,
            5, 23, 3,
            5, 23, 4,
            5, 24, 2,
            5, 24, 3,
            5, 24, 4,
            5, 25, 2,
            5, 25, 3,
            5, 25, 4,
            5, 26, 2,
            5, 26, 3,
            5, 26, 4,
            6, 22, 2,
            6, 22, 3,
            6, 22, 4,
            6, 23, 2,
            6, 23, 3,
            6, 23, 4,
            6, 24, 2,
            6, 24, 3,
            6, 24, 4,
            6, 25, 2,
            6, 26, 2,
            6, 26, 3,
            6, 26, 4,
            7, 21, 2,
            7, 21, 3,
            7, 21, 4,
            7, 22, 2,
            7, 22, 3,
            7, 22, 4,
            7, 23, 2,
            7, 24, 2,
            7, 24, 3,
            7, 24, 4,
            7, 25, 2,
            7, 25, 3,
            7, 25, 4,
            8, 21, 2,
            8, 21, 3,
            8, 21, 4,
            8, 22, 2,
            8, 22, 3,
            8, 22, 4,
            8, 23, 2,
            8, 23, 3,
            8, 23, 4,
            8, 24, 2,
            8, 24, 3,
            8, 24, 4,
            8, 25, 2,
            9, 22, 2,
            9, 22, 3,
            9, 22, 4,
            9, 23, 2,
            9, 24, 2,
            9, 24, 3,
            9, 24, 4,
            9, 25, 2,
            9, 25, 3,
            9, 25, 4,
            9, 26, 2,
            9, 26, 3,
            9, 26, 4,
            10, 23, 2,
            10, 23, 3,
            10, 23, 4,
            10, 24, 2,
            10, 24, 3,
            10, 24, 4,
            10, 25, 2,
            10, 26, 2,
            10, 26, 3,
            10, 26, 4,
            11, 24, 2,
            11, 24, 3,
            11, 24, 4,
            11, 25, 2,
            11, 25, 3,
            11, 25, 4,
        ];

        this.Block_Count = 2;
        this.Blocks = [
            22, 8, 2,
            22, 8, 3,
        ];

        this.BoomBalloon_Count = 8;
        this.BoomBalloons = [
            6, 6, 3,

            26, 4, 3,

            21, 23, 3,

            6, 25, 3,
            7, 23, 3,
            8, 25, 3,
            9, 23, 3,
            10, 25, 3,
        ];

        this.BounceBlock_Count = 3;
        this.BounceBlocks = [
            23, 7, 6,


            19, 25, 6,
            20, 19, 4,
        ];

        this.WoodBlock_Count = 6;
        this.WoodBlocks = [
            24, 8, 2,
            24, 8, 3,
            25, 8, 2,
            25, 8, 3,
            26, 8, 2,
            26, 8, 3,
        ];
    }

    getBalloonCount() { return this.Balloon_Count; }
    getBalloon(i) { return this.Balloons[i]; }

    getBlockCount() { return this.Block_Count; }
    getBlock(i) { return this.Blocks[i]; }

    getBoomBalloonCount() { return this.BoomBalloon_Count; }
    getBoomBalloon(i) { return this.BoomBalloons[i]; }

    getBounceBlockCount() { return this.BounceBlock_Count; }
    getBounceBlock(i) { return this.BounceBlocks[i]; }

    getWoodBlockCount() { return this.WoodBlock_Count; }
    getWoodBlock(i) { return this.WoodBlocks[i]; }
}