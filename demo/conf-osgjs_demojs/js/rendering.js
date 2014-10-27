window.addEventListener("load", function() { start(); }, true );

var UpdateCallback = function() {};
UpdateCallback.prototype = {
    update: function(node, nv) {
        osg.log(nv.getFrameStamp().getSimulationTime());
        //node.traverse(nv);
    }
};


var UpdateCallbackPosition = function() {};
UpdateCallbackPosition.prototype = {
    update: function(node, nv) {
        var matrix = node.getMatrix();

        var s = osgAnimation.EaseOutElastic(nv.getFrameStamp().getSimulationTime()%1.0);
        osg.Matrix.makeScale(1,1,1.0 + s, matrix);
        node.traverse(nv);
    }
};


function getShader()
{
    var vertexshader = [
        "",
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        "attribute vec3 Vertex;",
        "uniform mat4 ModelViewMatrix;",
        "uniform mat4 ProjectionMatrix;",
        "uniform vec4 fragColor;",
        "varying vec4 position;",
        "void main(void) {",
        "  gl_Position = ProjectionMatrix * ModelViewMatrix * vec4(Vertex,1.0);",
        "  position = ModelViewMatrix * vec4(Vertex,1.0);",
        "}",
        ""
    ].join('\n');

    var fragmentshader = [
        "",
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        "uniform vec4 fragColor;",
        "varying vec4 position;",
        "void main(void) {",
        "  float d = 0.05;",
        "  float f = gl_FragCoord.z/gl_FragCoord.w;",
        "  f = clamp(exp2(-d*d * f*f * 1.44), 0.0, 1.0);",
        "  gl_FragColor = vec4(f, f, f, f);",
        "}",
        ""
    ].join('\n');

    var program = new osg.Program(
        new osg.Shader(gl.VERTEX_SHADER, vertexshader),
        new osg.Shader(gl.FRAGMENT_SHADER, fragmentshader));

    return program;
}



function start(){
    var canvas = document.getElementById("3DView");
    canvas.width = 1280;
    canvas.height = 720;
    var viewer = new osgViewer.Viewer(canvas);
    viewer.init();

    // create a basic braph
    var root = new osg.Node();
    root.addChild(osg.createTexturedBox(0, 0, 0,
                                        10,10,10));
    viewer.setScene(root);

    // add new group
    var group = new osg.MatrixTransform();
    root.addChild(group);

    // add another node
    var item0 = new osg.MatrixTransform();
    item0.addChild(osg.createTexturedBox(0, 0, 0,
                                         10,10,10));
    item0.setMatrix(osg.Matrix.makeTranslate(15,0,0, []));
    group.addChild(item0);

    // change material
    var material = new osg.Material();
    material.setDiffuse([1.0, 0.0, 0.0, 1.0]);
    item0.getOrCreateStateSet().setAttributeAndMode(material);


    // add another node
    var item1 = new osg.MatrixTransform();
    item1.addChild(osg.createTexturedBox(0, 0, 0,
                                         10,10,10));
    item1.setMatrix(osg.Matrix.makeTranslate(15,15,0, []));
    group.addChild(item1);

    // change material
    var material = new osg.Material();
    material.setDiffuse([0.0, 0.0, 1.0, 1.0]);
    item1.getOrCreateStateSet().setAttributeAndMode(material);


    // now add a transform to the group
    group.setMatrix(osg.Matrix.makeTranslate(0,0,15, []));


    // update callback
    group.setUpdateCallback(new UpdateCallback());
    group.setUpdateCallback(new UpdateCallbackPosition());

    group.getOrCreateStateSet().setAttributeAndMode(getShader());
    group.getOrCreateStateSet().setAttributeAndMode(new osg.BlendFunc('ONE', 'ONE_MINUS_SRC_ALPHA'));

    viewer.setupManipulator();
    viewer.run();
}