var App = (function () {

    var scene;
    var engine;
    var assetsManager;


    function _init() {

        _initBabylon();

    }

    function _initBabylon() {

        var canvas = document.getElementById('canvas');

        engine = new BABYLON.Engine(canvas, true);

        scene = _createScene();

        assetsManager = new BABYLON.AssetsManager(scene);

        // Load car model
        var meshTask = assetsManager.addMeshTask('loadCar', '', '/Content/', 'car.glb');

        var carTmp;

        meshTask.onSuccess = function (task) {
            carTmp = task.loadedMeshes[0];
            carTmp.isVisible = false;
        }

        assetsManager.onFinish = function () {

            // Arrange the cars on the scene
            for (var i = -10; i < 10; i++) {

                var carNew = carTmp.clone("car" + i);

                carNew.position = new BABYLON.Vector3(0, 0, i * 6);

                carNew.isVisible = true;
            }            

            engine.runRenderLoop(function () {
                scene.render();
            });
        };

        assetsManager.load();

    }

    function _createScene() {

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

        light.intensity = 1;

        return scene;
    }

    return {
        init: _init
    }

})();