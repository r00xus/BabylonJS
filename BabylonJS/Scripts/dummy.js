var createScene = function () {

    var rootUrl = 'https://raw.githubusercontent.com/r00xus/files/main/';

    // Create Scene

    var scene = new BABYLON.Scene(engine);

    const axis = new BABYLON.Debug.AxesViewer(scene, 4);

    scene.clearColor = BABYLON.Color3.White();

    var camera = new BABYLON.ArcRotateCamera("Camera", BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(45), 100, BABYLON.Vector3.Zero());

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

    // Load asstes

    var templates = new BABYLON.AssetContainer(scene);

    var assets = {};

    assetsManager = new BABYLON.AssetsManager(scene);

    const addAssetToLoad = function (key) {

        var meshTask = assetsManager.addMeshTask(key, '', rootUrl, key + '.glb');

        meshTask.onSuccess = function (task) {

            var mesh = task.loadedMeshes[0];

            assets[key] = mesh;

            templates.meshes.push(mesh);
        }
    };

    addAssetToLoad('car');
    addAssetToLoad('track');

    assetsManager.onFinish = function () {
        templates.removeAllFromScene();
    };

    assetsManager.load();

    // Schema

    var schemaContainer = new BABYLON.AssetContainer(scene);

    const loadSchema = function (fileName) {
        fetch(rootUrl + fileName)
            .then((response) => {
                return response.json();
            })
            .then((schema) => {
                createSchema(schema);
            });
    }

    const createSchema = function (schema) {

        schemaContainer.dispose();

        schema.tracks.forEach(function (track, i) {

            track.cars.forEach(function (car, j) {

                var trackMesh = assets.track.clone();

                trackMesh.position = new BABYLON.Vector3(5 * i + 10, 0, j * 6);

                schemaContainer.meshes.push(trackMesh);

                var carMesh = assets.car.clone();

                carMesh.position = new BABYLON.Vector3(5 * i + 10, 0.3, j * 6);

                schemaContainer.meshes.push(carMesh);

            });
        });
    }

    // GUI

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Load schema1");
    button1.width = 0.2;
    button1.height = "40px";
    button1.color = "white";
    button1.background = "grey";
    button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    button1.onPointerClickObservable.add((event) => {
        loadSchema('schema1.json');
    });
    advancedTexture.addControl(button1);

    var button2 = BABYLON.GUI.Button.CreateSimpleButton("but2", "Load schema2");
    button2.width = 0.2;
    button2.height = "40px";
    button2.color = "white";
    button2.background = "grey";
    button2.top = 40;
    button2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
    button2.onPointerClickObservable.add((event) => {
        loadSchema('schema2.json');
    });
    advancedTexture.addControl(button2);


    return scene;
};