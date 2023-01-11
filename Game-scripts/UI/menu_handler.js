var MenuHandler = pc.createScript('menuHandler');

MenuHandler.attributes.add("menu_open_Event", {
    type: "string",
    title: "Menu Open Event"
});

MenuHandler.prototype.initialize = function () {

    this.menu = this.app.root.findByName("UI MENU");

    this.app.on(this.menu_open_Event, () => {

        this.menu.enabled = !this.menu.enabled;

    }, this);
};