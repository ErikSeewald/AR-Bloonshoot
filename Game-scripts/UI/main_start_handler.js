var MainStartHandler = pc.createScript('mainStartHandler');

MainStartHandler.attributes.add("main_start_Event", {
    type: "string",
    title: "Main Start Event"
});

MainStartHandler.prototype.initialize = function () {

    this.main = this.app.root.findByName("UI MAIN");

    this.app.on(this.main_start_Event, () => {

        this.main.enabled = true;
        this.app.root.findByName("UI TUTORIAL").enabled = false;
        this.app.root.findByName("Pin").enabled = true;

    }, this);

};