var App = (function () {

    var scene;
    var engine;
    var cars;
    var advancedTexture;

    function _init() {

        _load();
    }

    function _initBabylon() {

        var canvas = document.getElementById('canvas');

        engine = new BABYLON.Engine(canvas, true);

        scene = _createScene();

        engine.runRenderLoop(function () {
            scene.render();
        });

    }

    function _load() {

        $.ajax({
            url: '/Content/cars.json'
        })
            .done(function (_cars) {
                cars = _cars;
                _initBabylon();
            });
    }


    function _createScene() {

        var scene = new BABYLON.Scene(engine);

        scene.clearColor = BABYLON.Color3.White();

        var camera = new BABYLON.ArcRotateCamera("Camera",
            BABYLON.Tools.ToRadians(-45),
            BABYLON.Tools.ToRadians(45),
            100,
            BABYLON.Vector3.Zero());

        camera.panningSensibility = 50;

        camera.attachControl(canvas, true);

        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 100, 0), scene);

        light.intensity = 1;
        
        advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        BABYLON.SceneLoader.ImportMesh(
            '',
            '/Content/',
            'car_no_texture.glb',
            scene,
            function (newMeshes) {

                var car = newMeshes[0];

                _drawCars(car);

            });

        return scene;
    }

    function _drawCars(_car) {

        $.each(cars.ways, function (wayIndex, way) {

            $.each(way.cars, function (carIndex, car) {

                var newCar = _car.clone('car' + wayIndex + carIndex);

                newCar.position.x = wayIndex * 10;
                newCar.position.z = carIndex * 6;               

                var label = new BABYLON.GUI.TextBlock();

                advancedTexture.addControl(label);

                label.linkWithMesh(newCar);

                //label.linkOffsetY = -100;

                label.text = "Вагон";



            });

        });

        scene.removeMesh(_car);
    }

    return {
        init: _init
    }

})();