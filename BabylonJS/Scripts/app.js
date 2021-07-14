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
            BABYLON.Tools.ToRadians(0),
            BABYLON.Tools.ToRadians(45),
            100,
            BABYLON.Vector3.Zero());

        camera.panningSensibility = 50;
        camera.panningInertia = 0;
        camera.inertia = 0;
        camera.angularSensibility = 1;
        camera.wheelPrecision = 1;

        camera.lowerRadiusLimit = 50;
        camera.upperRadiusLimit = 200;        

        camera.attachControl(canvas, true, true, 0);

        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 100, 0), scene);

        light.intensity = 1;

        advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        BABYLON.SceneLoader.ImportMesh(
            '',
            '/Content/',
            'car.glb',
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

                _drawCarNum(newCar);

                //var label = new BABYLON.GUI.TextBlock();

                //advancedTexture.addControl(label);

                //label.linkWithMesh(newCar);

                //label.linkOffsetY = -100;

                //label.text = "Carriage";

            });

        });

        scene.removeMesh(_car);
    }

    function _drawCarNum(car) {

        //var outputplane = BABYLON.Mesh.CreatePlane(
        //    "outputplane", { height: 1, width: 1, sideOrientation: BABYLON.Mesh.DOUBLESIDE });

        var panel = BABYLON.MeshBuilder.CreatePlane("plane", { width: 2, height: 1 });

        panel.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;

        panel.material = new BABYLON.StandardMaterial("outputplane", scene);

        panel.position.x = car.position.x;
        panel.position.z = car.position.z;
        panel.position.y = 3;

        var dynTexture = new BABYLON.DynamicTexture("dynamic texture", { width: 512, height: 256 }, scene, true);

        panel.material.diffuseTexture = dynTexture;

        //panel.material.diffuseTexture.hasAlpha = true;

        panel.useAlphaFromDiffuseTexture = true;

        var ctx = dynTexture.getContext();

        ctx.font = "100px Arial";

        var text = "№ 34534";

        ctx.fillStyle = 'white';

        ctx.fillText(text, (512 - ctx.measureText(text).width) / 2, 50);

        dynTexture.update();

    }

    return {
        init: _init
    }

})();