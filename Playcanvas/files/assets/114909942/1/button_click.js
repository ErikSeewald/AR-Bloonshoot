let ButtonClick = pc.createScript('buttonClick');

// initialize code called once per entity
ButtonClick.prototype.initialize = function () {
  this.entity.button.on('click', function (event) {
    this.app.fire(this.initEvent, () => this.update());

  }, this);

};

ButtonClick.attributes.add("initEvent", {
  type: "string",
  title: "Init Event"
});

// update code called every frame
ButtonClick.prototype.update = function (dt) {

};