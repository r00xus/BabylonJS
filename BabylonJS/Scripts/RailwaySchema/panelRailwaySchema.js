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

            this._createPropertWindow();
        },

        _createToolbar: function () {

            var that = this;

            that._btnRefresh = $('#btnRefresh', this.element);

            that._btnRefresh.linkbutton({
                onClick: function () {
                    that._loadSchema();
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

            this._schema = new BABYLON.AssetContainer(scene);

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
                that._loadSchema();
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

        _draw: function (schema) {

            var that = this;

            that._schema.dispose();

            $.each(schema.tracks, function (i, track) {

                $.each(track.cars, function (j, car) {

                    // Путь

                    for (var t = 0; t < track.maxCount; t++) {

                        var trackModel = that._assets.track.createInstance("track" + t);

                        trackModel.position = new BABYLON.Vector3(10 * i, 0, t * 6);

                        trackModel.isVisible = true;

                        trackModel.metadata = {
                            num: track.num
                        };

                        that._schema.meshes.push(trackModel);
                    }

                    // Вагон

                    car.track = { num: track.num };

                    var carModel;

                    var name = "track" + i + 'car' + j;

                    if (car.type == 'tank') {
                        carModel = that._assets.tank.createInstance(name);
                    }
                    else if (car.type == 'gondola') {
                        carModel = that._assets.car.createInstance(name);
                    }

                    carModel.metadata = car;

                    carModel.position = new BABYLON.Vector3(10 * i, 0.6, j * 6);

                    carModel.isPickable = true;

                    carModel.isVisible = true;

                    carModel.actionManager = new BABYLON.ActionManager(that._scene);

                    carModel.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger,
                            function (evt) {

                                that._loadCarPropdery(evt.source.metadata);

                            }
                        )
                    );

                    carModel.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOutTrigger, carModel, "scaling", new BABYLON.Vector3(1, 1, 1), 150));
                    carModel.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOverTrigger, carModel, "scaling", new BABYLON.Vector3(1.1, 1.1, 1.1), 150));



                    that._schema.meshes.push(carModel);
                });
            });
        },

        _loadCarPropdery: function (car) {

            var that = this;

            var data = [];

            data.push({ name: '№ вагона', value: car.num });
            data.push({ name: 'Грузоподъемность', value: car.capacity });

            if (car.type == 'tank')
                data.push({ name: 'Тип', value: 'Цистерна' })
            else if (car.type == 'gondola')
                data.push({ name: 'Тип', value: 'Полувагон' })

            data.push({ name: 'Расположение', value: 'Путь № ' + car.track.num });

            that._grid.propertygrid('loadData', data);
        },

        _loadSchema: function () {

            var that = this;

            $.ajax({
                url: '/Home/GetSchema/',
            }).done(function (schema) {

                that._draw(schema);

            });
        },

        _createPropertWindow: function () {

            var that = this;

            var window = $('<div></div>');

            window.appendTo($('body'));

            that._grid = $('<table></table>');

            that._grid.appendTo(window);

            that._grid.propertygrid({
                fit: true,
                border: false,
                scrollbarSize: 0,
                striped: true,
                emptyMsg: 'Выберите вагон'
            });

            window.window({
                title: 'Свойства вагона',
                width: 300,
                height: 400,
                collapsible: false,
                minimizable: false,
                maximizable: false,
                left: 10,
                top: 50
            });

        }

    });

})(jQuery);