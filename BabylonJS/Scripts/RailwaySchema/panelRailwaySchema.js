(function ($) {

    $.widget("crt.panelRailwaySchema", {

        _create: function () {

            var that = this;

            that._engine = that._createEngine();

            that._scene = that._createScene(that._engine);

            that._scene.getEngine().runRenderLoop(function () {
                that._scene.render();
            });

            this._loadAssets();

            this._createToolbar();
        },

        _createToolbar: function () {

            var that = this;

            that._btnRefresh = $('#btnRefresh', this.element);

            that._btnRefresh.linkbutton({
                onClick: function () {
                    that._draw();
                }
            });
        },

        _createEngine: function () {

            var canvas = $('#canvas', this.element)[0];

            var engine = new BABYLON.Engine(canvas, true);

            return engine;
        },

        _createScene: function (engine) {

            var scene = new BABYLON.Scene(engine);

            scene.clearColor = BABYLON.Color3.White();

            var camera = new BABYLON.ArcRotateCamera("Camera",
                BABYLON.Tools.ToRadians(0),
                BABYLON.Tools.ToRadians(45),
                100,
                BABYLON.Vector3.Zero());

            camera.panningSensibility = 50;
            camera.panningInertia = 0;
            camera.inertia = 0;
            camera.angularSensibility = 1;
            camera.wheelPrecision = 1;

            camera.lowerRadiusLimit = 30;
            camera.upperRadiusLimit = 200;

            camera.attachControl(canvas, true, true, 0);

            var light = new BABYLON.HemisphericLight("sun", new BABYLON.Vector3(0, 100, 0), scene);

            light.intensity = 1.5;

            return scene;
        },

        _loadAssets: function (scene) {

            var that = this;

            that._assets = {};

            assetsManager = new BABYLON.AssetsManager(that._scene);

            that._addAssetToLoad(assetsManager, 'car');
            that._addAssetToLoad(assetsManager, 'track');
            that._addAssetToLoad(assetsManager, 'tank');

            assetsManager.onFinish = function () {
            };

            assetsManager.load();
        },

        _addAssetToLoad: function (assetsManager, key) {

            var that = this;

            var meshTask = assetsManager.addMeshTask(key, '', '/Content/Assets/', key + '.babylon');

            var asset;

            meshTask.onSuccess = function (task) {

                asset = task.loadedMeshes[0];

                that._assets[key] = asset;

                asset.isVisible = false;
            }
        },

        _draw: function () {

            var that = this;

            for (var j = 0; j < 10; j++) {

                for (var i = -20; i < 20; i++) {

                    var track = this._assets.track.clone("track" + i);

                    track.position = new BABYLON.Vector3(-10 * j, 0, i * 6);

                    track.isVisible = true;

                    var car;

                    if (i % 2 == 0) {
                        car = this._assets.car.clone("car(" + j + "," + i + ")");
                    }
                    else {
                        car = this._assets.tank.clone("car(" + j + "," + i + ")");
                    }



                    //var car = BABYLON.MeshBuilder.CreateBox("box" + i, { size: 1 }, that._scene);

                    car.position = new BABYLON.Vector3(-10 * j, 0.6, i * 6);

                    car.isPickable = true;

                    car.isVisible = true;

                    car.actionManager = new BABYLON.ActionManager(that._scene);

                    car.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger,
                            function (bjsevt) {
                                alert('clicked');

                            }
                        )
                    );

                }
            }
        }

    });

})(jQuery);