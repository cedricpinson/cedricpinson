/** -*- compile-command: "jslint-cli demo.js" -*-
 *
 * Copyright (C) 2010 Cedric Pinson
 *
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Authors:
 *  Cedric Pinson <cedric.pinson@plopbyte.net>
 *
 */

var Fullscreen = false;
var BlueColor = [ 0.055/2, 0.46/2, 0.576/2, 1.0];
var OrangeColor = [ 0.4121, 0.24039, 0.02058, 1.0];

var Debug = false;

var TextureGenerateStamp = 0;

//Convert a hex value to its decimal value - the inputted hex must be in the
//	format of a hex triplet - the kind we use for HTML colours. The function
//	will return an array with three values.
function hex2num(hex) {
    if(hex.charAt(0) == "#") hex = hex.slice(1); //Remove the '#' char - if there is one.
    hex = hex.toUpperCase();
    var hex_alphabets = "0123456789ABCDEF";
    var value = new Array(4);
    var k = 0;
    var int1,int2;
    for(var i=0;i<8;i+=2) {
	int1 = hex_alphabets.indexOf(hex.charAt(i));
	int2 = hex_alphabets.indexOf(hex.charAt(i+1)); 
	value[k] = (int1 * 16) + int2;
        value[k] = value[k]/255.0;
	k++;
    }
    return(value);
}
//Give a array with three values as the argument and the function will return
//	the corresponding hex triplet.
function num2hex(triplet) {
    var hex_alphabets = "0123456789ABCDEF";
    var hex = "";
    var int1,int2;
    for(var i=0;i<4;i++) {
        var v = triplet[i] * 255.0;
	int1 = v / 16;
	int2 = v % 16;
	hex += hex_alphabets.charAt(int1) + hex_alphabets.charAt(int2); 
    }
    return(hex);
}

function MultiTouchController() {
    this.streams = {};
    this.nbStreams = 0;
}

MultiTouchController.prototype = {
    down: function(event) {
        this.streams[event.streamId] = event;
        this.nbStreams++;
    },
    up: function(event) {
        delete this.streams[event.streamId];
        this.nbStreams--;
    },

    move: function(event) {
        if (this.streams[event.streamId] === undefined) {
            osg.log("error move an non existant stream id " + event.streamId);
            return;
        }
        this.streams[event.streamId] = event;
    },

    processEvent: function(event) {
    }
};


function getWorldShader()
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
        "void main(void) {",
        "  gl_Position = ProjectionMatrix * ModelViewMatrix * vec4(Vertex,1.0);",
        "}",
        ""
    ].join('\n');

    var fragmentshader = [
        "",
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        "uniform vec4 fragColor;",
        "void main(void) {",
        "gl_FragColor = fragColor;",
        "}",
        ""
    ].join('\n');

    var program = osg.Program.create(
        osg.Shader.create(gl.VERTEX_SHADER, vertexshader),
        osg.Shader.create(gl.FRAGMENT_SHADER, fragmentshader));
    var stateset = new osg.StateSet();
    var uniform = osg.Uniform.createFloat4(BlueColor,"fragColor");
    stateset.setAttributeAndMode(program);
    stateset.addUniform(uniform);

    jQuery("#lands").val(num2hex(BlueColor));
    jQuery("#lands").change(function(data) {
        var val = jQuery("#lands").val();
        var newval = hex2num(val);
        osg.log("country color changed to " + newval);
        uniform.set(newval);
    });

    return stateset;
}




function getCountryShader()
{
    var vertexshader = [
        "",
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        "attribute vec3 Vertex;",
        "uniform mat4 ModelViewMatrix;",
        "uniform mat4 ProjectionMatrix;",
        "void main(void) {",
        "  gl_Position = ProjectionMatrix * ModelViewMatrix * vec4(Vertex,1.0);",
        "}",
        ""
    ].join('\n');

    var fragmentshader = [
        "",
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        "uniform vec4 fragColor;",
        "void main(void) {",
        "gl_FragColor = fragColor;",
        "}",
        ""
    ].join('\n');

    var program = osg.Program.create(
        osg.Shader.create(gl.VERTEX_SHADER, vertexshader),
        osg.Shader.create(gl.FRAGMENT_SHADER, fragmentshader));
    var stateset = new osg.StateSet();
    var uniform = osg.Uniform.createFloat4(OrangeColor,"fragColor");
    stateset.setAttributeAndMode(program);
    stateset.addUniform(uniform);

    jQuery("#country").val(num2hex(OrangeColor));
    jQuery("#country").change(function(data) {
        var val = jQuery("#country").val();
        var newval = hex2num(val);
        osg.log("country color changed to " + newval);
        uniform.set(newval);
    });
    
    return stateset;
}


var TweetShader;
function getTweetShader()
{
    if (TweetShader === undefined) {
        var vertexshader = [
            "",
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",
            "attribute vec3 Vertex;",
            "attribute vec2 TexCoord0;",
            "uniform mat4 ModelViewMatrix;",
            "uniform mat4 ProjectionMatrix;",
            "varying vec2 FragTexCoord0;",
            "void main(void) {",
            "  gl_Position = ProjectionMatrix * ModelViewMatrix * vec4(Vertex,1.0);",
            "  FragTexCoord0 = TexCoord0;",
            "}",
            ""
        ].join('\n');

        var fragmentshader = [
            "",
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",
            "uniform vec4 fragColor;",
            "uniform sampler2D Texture0;",
            "varying vec2 FragTexCoord0;",
            "void main(void) {",
            "vec4 color = texture2D( Texture0, FragTexCoord0.xy);",
            "gl_FragColor = color*fragColor[0];",
            "}",
            ""
        ].join('\n');

        var program = osg.Program.create(
            osg.Shader.create(gl.VERTEX_SHADER, vertexshader),
            osg.Shader.create(gl.FRAGMENT_SHADER, fragmentshader));

        TweetShader = program;
    }
    var stateset = new osg.StateSet();
    var uniform = osg.Uniform.createFloat4([1.0,
                                            0.0,
                                            1.0,
                                            0.5],"fragColor");
    stateset.setAttributeAndMode(TweetShader);
    stateset.setAttributeAndMode(new osg.BlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA));
    stateset.addUniform(uniform);
    return stateset;
}


var TweetTagShader;
function getTweetTagShader()
{
    if (TweetShader === undefined) {
        var vertexshader = [
            "",
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",
            "attribute vec3 Vertex;",
            "attribute vec2 TexCoord0;",
            "uniform mat4 ModelViewMatrix;",
            "uniform mat4 ProjectionMatrix;",
            "varying vec2 FragTexCoord0;",
            "void main(void) {",
            "  gl_Position = ProjectionMatrix * ModelViewMatrix * vec4(Vertex,1.0);",
            "  FragTexCoord0 = TexCoord0;",
            "}",
            ""
        ].join('\n');

        var fragmentshader = [
            "",
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",
            "uniform vec4 fragColor;",
            "uniform sampler2D Texture0;",
            "varying vec2 FragTexCoord0;",
            "void main(void) {",
            "vec4 color = texture2D( Texture0, FragTexCoord0.xy);",
            "color[3] = color[0];",
            "gl_FragColor = color*fragColor[0];",
            "}",
            ""
        ].join('\n');

        var program = osg.Program.create(
            osg.Shader.create(gl.VERTEX_SHADER, vertexshader),
            osg.Shader.create(gl.FRAGMENT_SHADER, fragmentshader));

        TweetTagShader = program;
    }
    var stateset = new osg.StateSet();
    var uniform = osg.Uniform.createFloat4([1.0,
                                            0.0,
                                            1.0,
                                            0.5],"fragColor");
    stateset.setAttributeAndMode(TweetShader);
    stateset.setAttributeAndMode(new osg.BlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA));
    stateset.addUniform(uniform);
    return stateset;
}



function TweetDisplayCallback() {}

TweetDisplayCallback.prototype = {
    update: function(node, nv) {
        var currentTime = nv.getFrameStamp().getSimulationTime();
        if (node.startTime === undefined) {
            node.startTime = currentTime;
            if (node.duration === undefined) {
                node.duration = 5.0;
            }
        }
        var dt = currentTime - node.startTime;
        if (dt > node.duration) {
            node.setNodeMask(0);
            return;
        }
        var ratio = dt/node.duration;
        var value = (1.0 - osgAnimation.EaseInQuad(ratio));
        var uniform = node.uniform;
        var c = [value, value, value, value];
        uniform.set(c);
        node.traverse(nv);
    }
};

function displayTweetSource(lat, lng, texture)
{
    var matrix = computeLocalToWorldTransformFromLatLongHeight(lat*Math.PI/180.0, lng*Math.PI/180.0, 1000);

    var w = 500000;
    var h = 500000;
    var node = new osg.MatrixTransform();
    node.setMatrix(matrix);
    q = osg.createTexturedQuad(-w/2.0, -h/2.0, 0,
                               w, 0, 0,
                               0, h, 0);
    node.addChild(q);
    //osg.log(matrix);
    var st = getTweetShader();
    st.setTextureAttributeAndMode(0, texture);

    var uniform = osg.Uniform.createInt1(0.0, "Texture0");

    q.setStateSet(st);
    node.uniform = st.getUniformMap()['fragColor'];
    node.setUpdateCallback(new TweetDisplayCallback());
    return node;
}

function displayTweetTag(lat, lng, texture)
{
    var matrix = computeLocalToWorldTransformFromLatLongHeight(lat*Math.PI/180.0, lng*Math.PI/180.0, 1000);

    var ratio = texture.getHeight()*1.0/texture.getWidth();
    var w = 2500000;
    var h = w*ratio;
    var node = new osg.MatrixTransform();
    node.setMatrix(matrix);
    q = osg.createTexturedQuad(-w/2.0, -h/2.0, 0,
                               w, 0, 0,
                               0, h, 0);
    node.addChild(q);
    var st = getTweetShader();
    st.setTextureAttributeAndMode(0, texture);
    var uniform = osg.Uniform.createInt1(0.0, "Texture0");

    q.setStateSet(st);
    node.uniform = st.getUniformMap()['fragColor'];
    node.setUpdateCallback(new TweetDisplayCallback());
//    node.duration = 10.0;

    return node;
}



function cleanExpiredTweets(scene)
{
    // clean old items
    var toRemove = [];
    var childs = scene.getChildren();
    for (var i = 0, l = childs.length; i < l; ++i) {
        var child = childs[i];
        if (child.children[0].getNodeMask() === 0) {
            toRemove.push(child);
        }
    }
    while (toRemove.length > 0) {
        scene.removeChild(toRemove.pop());
    }
}

function createScene()
{

    jQuery("#background").val(num2hex([0,0,0,1]));
    jQuery("#background").change(function(data) {
        var val = jQuery("#background").val();
        var newval = hex2num(val);
        osg.log("background color changed to " + newval);
        Viewer.view.setClearColor(newval);
    });


    var canvas = document.getElementById("3DView");
    var twitter = new osg.Camera();
    var ratio = canvas.width/canvas.height;
    twitter.getOrCreateStateSet().setAttributeAndMode(new osg.BlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA));
    twitter.setReferenceFrame(osg.Transform.ABSOLUTE_RF);
    twitter.setClearMask(0);
//    twitter.setProjectionMatrix(osg.Matrix.makeOrtho(-ratio, ratio, -1.0, 1.0, -1,1));
    twitter.setProjectionMatrix(osg.Matrix.makeOrtho(0, canvas.width, 0, canvas.height, -1,1));
    twitter.setRenderOrder(osg.Camera.NESTED_RENDER,0);
    twitter.setName("twitter");
    twitter.setNodeMask(2);

    var twitterStream = new osg.Node();
    twitterStream.stream = new TwitterStream();
    twitterStream.addChild(twitterStream.stream.items);
    //twitterStream.stream.start();
    twitterStream.setUpdateCallback(new TwitterUpdateCallback(twitterStream.stream));
    twitter.addChild(twitterStream);

    var scene = new osg.Node();

    var world = osg.ParseSceneGraph(getWorld());
    var country = osg.ParseSceneGraph(getCountry());
    var coast = osg.ParseSceneGraph(getCoast());

    var orangeMaterial = new osg.Material();
    orangeMaterial.diffuse = [ 0.0, 0.0, 0.0, 0.0];
    orangeMaterial.specular = [ 0.0, 0.0, 0.0, 0.0];
    orangeMaterial.ambient = [ 0.0, 0.0, 0.0, 0.0];
    orangeMaterial.emission = osg.Vec4.copy(OrangeColor);

    var blueMaterial = new osg.Material();
    blueMaterial.diffuse = [ 0.0, 0.0, 0.0, 0.0];
    blueMaterial.specular = [ 0.0, 0.0, 0.0, 0.0];
    blueMaterial.ambient = [ 0.0, 0.0, 0.0, 0.0];
    blueMaterial.emission = osg.Vec4.copy(BlueColor);

    world.setStateSet(getWorldShader());
//    world.getOrCreateStateSet().setAttributeAndMode(blueMaterial);
    //country.getOrCreateStateSet().setAttributeAndMode(orangeMaterial);
    world.setNodeMask(2);

    country.addChild(coast);

    scene.addChild(world);
    scene.addChild(country);


    //scene.addChild(qq);

    world.getOrCreateStateSet().setAttributeAndMode(new osg.BlendFunc(gl.ONE, gl.ZERO));

    country.setStateSet(getCountryShader());
    country.getOrCreateStateSet().setAttributeAndMode(new osg.BlendFunc(gl.ONE, gl.ONE));
    country.getOrCreateStateSet().setAttributeAndMode(new osg.Depth('ALWAYS', 0, 1.0, false));

//    scene.light = new osg.Light();

    //scene.addChild(twitter);

    var pollTimeLine = function() {
        cleanExpiredTweets(scene);
        getPublicTimeline(
            function(location, tweet) {

                var lat = location.lat;
                var lng = location.lng;
                if (lat !== 0.0 && lng !== 0.0) {
                    var img = new Image();
                    img.onload = function() {
                        osg.log(location);
                        scene.addChild(displayTweetSource(lat, lng, displayTweetPictureToCanvas(img)));

                        // for test
                        if (false && tweet.entities.hashtags.length === 0) {
                            tweet.entities.hashtags.push({'text': "firefox"});
                        }
                        if (tweet.entities !== undefined && tweet.entities.hashtags.length > 0) {
                            var tags = tweet.entities.hashtags;
                            for (var i = 0, l = tags.length; i < l; i++) {
                                var hash = tags[i];
                                if (hash.text.length > 0 ) {
                                    var range = 10.0;
                                    var angle = 3.0;
                                    var lat2 = lat - tags.length*angle/2.0 + i*angle;
                                    var lng2 = lng - range/2.0 + Math.random()*range;
                                    var texture = createTextureText("#" +hash.text);
                                    var n = displayTweetTag(lat2, lng2, texture);
                                    scene.addChild(n);
                                }
                            }
                        }
                    };
                    img.src = tweet.user.profile_image_url;
                    //img.src = "http://plopbyte.net/tmp/ff-demo/line.png";
                }
            });
        window.setTimeout(pollTimeLine, 5*1000);
    };


    var trendsList = [];
    var pollTrends = function() {
        getTrends(
            function(data) {
                // discard old list if not possible to process it
                if (trendsList.length > 5) {
                    trendsList.length = 0;
                }
                for (var i = 0, l = data.length; i < l; i++) {
                    trendsList.push(data[i]);
                }
            });
        window.setTimeout(pollTrends, 121*1000);
    };


    var pollTrendsTweets = function() {
        var subject = "firefox";
        if (trendsList.length > 0) {
            subject = trendsList.pop().query;
        }

        // clean old items
        var toRemove = [];
        var childs = scene.getChildren();
        for (var i = 0, l = childs.length; i < l; ++i) {
            var child = childs[i];
            if (child.children[0].getNodeMask() === 0) {
                toRemove.push(child);
            }
        }
        while (toRemove.length > 0) {
            scene.removeChild(toRemove.pop());
        }
        getTweets(subject, function(location) {
            var lat = location.lat;
            var lng = location.lng;
            if (lat !== 0.0 && lng !== 0.0) {
                osg.log(location);
                scene.addChild(displayTweetSource(lat, lng));
            }
        });
        window.setTimeout(pollTrendsTweets, 31*1000);
    };

//    pollTrends();
//    setTimeout(pollTrendsTweets, 3 * 1000);

    pollTimeLine();

    Viewer.manipulator.update(-2.0, 0);

    gl.disable(gl.CULL_FACE);

    return scene;
}



