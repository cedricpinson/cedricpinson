/** -*- compile-command: "jslint-cli init.js" -*-
 *
 * Copyright (C) 2010 Cedric Pinson
 *
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * any later version.
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

function DraggerController() {
    this.distance = 8;
    this.target = [ 0,0, 0];
    this.eye = [ 0, this.distance, 0];
    this.rotation = osg.Matrix.makeRotate(-Math.PI/3.0, 1,0,0); // osg.Quat.makeIdentity();
    this.up = [0, 0, 1];
    this.time = 0.0;
    this.dx = 0.0;
    this.dy = 0.0;
    this.buttonup = true;
}

DraggerController.prototype = {
    panModel: function(dx, dy) {

        var inv = osg.Matrix.inverse(this.rotation);
        var x = [ osg.Matrix.get(inv, 0,0), osg.Matrix.get(inv, 0,1), 0 ];
        x = osg.Vec3.normalize(x);
        var y = [ osg.Matrix.get(inv, 1,0), osg.Matrix.get(inv, 1,1), 0 ];
        y = osg.Vec3.normalize(y);

        osg.Vec3.add(this.target, osg.Vec3.mult(x, -dx), this.target);
        osg.Vec3.add(this.target, osg.Vec3.mult(y, -dy), this.target);
    },

    computeRotation: function(dx, dy) {
        var of = osg.Matrix.makeRotate(dx / 10.0, 0,0,1);
        var r = osg.Matrix.mult(of, this.rotation);

        of = osg.Matrix.makeRotate(dy / 10.0, 1,0,0);
        var r2 = osg.Matrix.mult(r, of);

        // test that the eye is not too up and not too down to not kill
        // the rotation matrix
        var eye = osg.Matrix.transformVec3([0, 0, this.distance], osg.Matrix.inverse(r2));
        if (eye[2] > 0.9*this.distance || eye[2] < 0.0) {
            //discard rotation on y
            this.rotation = r;
            return;
        }
        this.rotation = r2;
    },

    update: function(dx, dy) {
        this.dx = dx;
        this.dy = dy;

        if (Math.abs(dx) + Math.abs(dy) > 0.0) {
            this.time = (new Date()).getTime();
        }

    },

    updateWithDelay: function() {
        var f = 1.0;
        var dt;
        var max = 2.0;
        var dx = this.dx;
        var dy = this.dy;
        if (this.buttonup) {
            f = 0.0;
            dt = ((new Date()).getTime() - this.time)/1000.0;
            if (dt < max) {
                f = 1.0 - osgAnimation.EaseOutQuad(dt/max);
            }
            dx *= f;
            dy *= f;
        } else {
            this.dx = 0;
            this.dy = 0;
        }

        if (Math.abs(dx) + Math.abs(dy) > 0.0) {
            if (this.currentMode === "drag") {
                this.panModel(dx, dy);
            } else {
                this.computeRotation(dx, dy);
            }
        }
    },
    releaseButton: function() {
        this.buttonup = true;
    },
    pushButton: function() {
        this.buttonup = false;
    },
    getInverseMatrix: function () {
        this.updateWithDelay();
        var inv;
        var eye = osg.Matrix.transformVec3([0, 0, this.distance], osg.Matrix.inverse(this.rotation));
        inv = osg.Matrix.makeLookAt(osg.Vec3.add(this.target,eye), this.target, [0,0,1]);

        return inv;
    },
};


function setupManipulator() {
    var view = root;
    view.manipulator = new DraggerController();
    view.manipulator.currentMode === "drag";

    convertEventToCanvas = function(e) {
        var myObject = document.getElementById("CarEditor");
        var posx,posy;
	if (e.pageX || e.pageY) {
	    posx = e.pageX;
	    posy = e.pageY;
	}
	else if (e.clientX || e.clientY) {
	    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

        var divGlobalOffset = function ElementPosition(obj) {
            var x=0, y=0;
            x = obj.offsetLeft;
            y = obj.offsetTop;
            var body = document.getElementsByTagName('body')[0];
            while (obj.offsetParent && obj!=body){
                x += obj.offsetParent.offsetLeft;
                y += obj.offsetParent.offsetTop;
                obj = obj.offsetParent;
            }
            return [x,y];
        };
	// posx and posy contain the mouse position relative to the document
	// Do something with this information
        var globalOffset = divGlobalOffset(myObject);
        posx = (posx - globalOffset[0]);
        posy = myObject.width-(posy - globalOffset[1]);
        return [posx,posy];
    };

    jQuery(document.getElementById("CarEditor")).bind( {
        mousedown: function(ev) {
            view.manipulator.panning = true;
            view.manipulator.dragging = true;
            var pos = convertEventToCanvas(ev);
            view.manipulator.clientX = pos[0];
            view.manipulator.clientY = pos[1];
            view.manipulator.pushButton();
        },
        mouseup: function(ev) {
            view.manipulator.dragging = false;
            view.manipulator.panning = false;
            view.manipulator.releaseButton();
        },
        mousemove: function(ev) {
            var scaleFactor;
            var curX;
            var curY;
            var deltaX;
            var deltaY;
            var pos = convertEventToCanvas(ev);
            curX = pos[0];
            curY = pos[1];

            scaleFactor = 10.0;
            deltaX = (view.manipulator.clientX - curX) / scaleFactor;
            deltaY = (view.manipulator.clientY - curY) / scaleFactor;
            view.manipulator.clientX = curX;
            view.manipulator.clientY = curY;

            if (view.manipulator.dragging || view.manipulator.panning) {
                view.manipulator.update(deltaX, deltaY);
            }
        },
        dblclick: function(ev) {
           view.manipulator.currentMode === "drag";
        }
    });
}

var state;
function webGLStart() {

    var canvas = document.getElementById("CarEditor");
    osg.initGL(canvas);
    state = osg.State.create();

    var ratio = canvas.width/canvas.height;

    root = new osg.View();
    root.light = new osg.Light();
    var dir = osg.Vec3.normalize([1,1,2]);
    root.light.setDirection(dir);
//    root.light.
//    mainNode.addChild(o);
//    var stateset = osg.StateSet.create();

    root.setViewport(new osg.Viewport(0,0,canvas.width,canvas.height));
    root.setViewMatrix(osg.Matrix.makeLookAt([0,0,-10], [0,0,0], [0,1,0]));
    root.setProjectionMatrix(osg.Matrix.makePerspective(90, ratio, 0.1, 100.0));


    //root.addChild();

    setupManipulator();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    //gl.blendFunc(gl.ONE, gl.ONE);
    gl.depthFunc(gl.LEQUAL);
    gl.lineWidth(2.0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    setInterval(frame, 16);
    startEditor();
}

var numberFrame = 0;
var startTime;
var enableStats = true;
function frame() {
    var cullTime;
    var frameTime;
    var drawTime;

    if (enableStats){
        frameTime = (new Date()).getTime();
    }

    if (numberFrame === 0) {
        startTime = (new Date()).getTime();
    }

    if (root.manipulator) {
        root.setViewMatrix(root.manipulator.getInverseMatrix());
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (enableStats){
        cullTime = (new Date()).getTime();
    }
    var cull = new osg.CullVisitor();
    cull.apply(root);

    if (enableStats){
        cullTime = (new Date()).getTime() - cullTime;
        //jQuery("#cullTime").text(cullTime/1000.0);
    }

    if (enableStats){
        drawTime = (new Date()).getTime();
    }
    cull.renderBin.drawImplementation(state);
    if (enableStats){
        drawTime = (new Date()).getTime() - drawTime;
        //jQuery("#drawTime").text(drawTime/1000.0);
    }
    numberFrame++;

    if (numberFrame % 60 === 0.0) {
        /* Run a test. */
        var nd = (new Date()).getTime();
        var diff = nd - startTime;

        jQuery("#fps").text(numberFrame/(diff/1000));
        startTime = nd;
        numberFrame = 0;
    }

    frameTime = (new Date()).getTime() - frameTime;
    //jQuery("#frameTime").text(frameTime/1000.0);
}
