(function ($) {

    $.widget("crt.panelRailwaySchema", {

        _create: function () {

            var that = this;

            that._schema = { tracks: [] };

            that._engine = that._createEngine();

            that._scene = that._createScene(that._engine);

            that._advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

            that._scene.getEngine().runRenderLoop(function () {
                that._scene.render();
            });

            that._schemaContainer = new BABYLON.AssetContainer(that._scene);

            that._loadAssets();

            that._createToolbar();

            that._createPropertWindow();
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

            var that = this;

            var scene = new BABYLON.Scene(engine);

            scene.clearColor = BABYLON.Color3.White();

            var camera = new BABYLON.ArcRotateCamera("Camera",
                BABYLON.Tools.ToRadians(0),
                BABYLON.Tools.ToRadians(45),
                100,
                BABYLON.Vector3.Zero());

            camera.panningSensibility = 30;
            camera.panningInertia = 0;
            camera.inertia = 0;
            camera.angularSensibility = 1;
            camera.wheelPrecision = 1;
            camera.panningAxis = new BABYLON.Vector3(1, 0, 1);

            camera.lowerRadiusLimit = 30;
            camera.upperRadiusLimit = 200;
            camera.upperBetaLimit  = BABYLON.Tools.ToRadians(85);

            camera.attachControl(canvas, true, true, 0);

            var light = new BABYLON.HemisphericLight("sun", new BABYLON.Vector3(0, 100, 0), scene);

            light.intensity = 1.5;

            return scene;
        },

        _loadAssets: function () {

            var that = this;

            that._assets = {};

            assetsManager = new BABYLON.AssetsManager(that._scene);

            that._addAssetToLoad(assetsManager, 'car');
            that._addAssetToLoad(assetsManager, 'track');
            that._addAssetToLoad(assetsManager, 'tank');
            that._addAssetToLoad(assetsManager, 'hopper');

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

        _draw: function () {

            var that = this;

            $.each(that._schema.tracks, function (i, track) {

                // Путь
                for (var j = 0; j < track.maxCount; j++) {

                    var model = that._assets.track.createInstance("track" + j);

                    model.position = new BABYLON.Vector3(15 * i, 0, j * 6);

                    model.isVisible = true;

                    that._schemaContainer.meshes.push(model);
                }

                $.each(track.cars, function (j, car) {

                    // Вагон

                    car.track = track;

                    car.model = null;

                    var name = "track" + i + 'car' + j;

                    if (car.type == 'tank') {
                        car.model = that._assets.tank.createInstance(name);
                    }
                    else if (car.type == 'gondola') {
                        car.model = that._assets.car.createInstance(name);
                    }
                    else if (car.type == 'hopper') {
                        car.model = that._assets.hopper.createInstance(name);
                    }

                    car.model.metadata = car;

                    car.model.position = new BABYLON.Vector3(15 * i, 0.3, j * 6);

                    car.model.isPickable = true;

                    car.model.isVisible = true;

                    car.model.actionManager = new BABYLON.ActionManager(that._scene);

                    car.model.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger,
                            function (evt) {

                                that._loadCarPropdery(evt.source.metadata);

                            }
                        )
                    );

                    car.model.actionManager.registerAction(
                        new BABYLON.InterpolateValueAction(
                            BABYLON.ActionManager.OnPointerOutTrigger, car.model, "scaling", new BABYLON.Vector3(1, 1, 1), 150));

                    car.model.actionManager.registerAction(
                        new BABYLON.InterpolateValueAction(
                            BABYLON.ActionManager.OnPointerOverTrigger, car.model, "scaling", new BABYLON.Vector3(1.1, 1.1, 1.1), 150));

                    that._schemaContainer.meshes.push(car.model);

                    // Label

                    car.label = BABYLON.MeshBuilder.CreatePlane("plane", { width: 2, height: 1 });

                    car.label.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;

                    car.label.material = new BABYLON.StandardMaterial("outputplane");
                    car.label.material.specularColor = new BABYLON.Color3(0, 0, 0);

                    var outputplaneTexture = new BABYLON.DynamicTexture("dynamic texture", { width: 512, height: 256 });

                    car.label.material.diffuseTexture = outputplaneTexture;

                    outputplaneTexture.drawText(car.num, null, 140, "140px arial", "white", "#000000");

                    var ctx = outputplaneTexture.getContext();

                    ctx.fillStyle = 'blue';

                    ctx.fillRect(0, 180, 512, 256);

                    outputplaneTexture.update();


                    car.label.position.x = car.model.position.x;
                    car.label.position.y = 3.5;
                    car.label.position.z = car.model.position.z;



                });
            });
        },

        _clear: function () {

            var that = this;

            that._schemaContainer.dispose();

            that._schema.tracks.forEach(function (track) {

                track.cars.forEach(function (car) {

                    car.label.dispose();

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
            else if (car.type == 'hopper')
                data.push({ name: 'Тип', value: 'Хоппер-вагон' })

            data.push({ name: 'Расположение', value: 'Путь № ' + car.track.num });

            that._grid.propertygrid('loadData', data);
        },

        _loadSchema: function () {

            var that = this;

            $.ajax({
                url: '/Home/GetSchema/',
            }).done(function (schema) {

                that._clear();

                that._schema = schema;

                that._draw();

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