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

var Fullscreen = true;
var BlueColor = [ 0.055/2, 0.46/2, 0.576/2, 1.0];
var OrangeColor = [ 0.4121, 0.24039, 0.02058, 1.0];
var CurvePlane = false;
var MaxLevel = 2;
var Cube;
var Tree;
var LevelStack = [];
var PreviousLevel;
var CurrentLevel;
var NbItemRange = 7;
var TextSize = 4;

var Debug = false;

var CurrentPath = "/";
var Authors = [];
var NamesRandom = [];
var DirectoryNamesRandom = [];

var TextureGenerateStamp = 0;

function getCurrentPath() {
    var path = "";
    var i = 0; 
    var l = LevelStack.length;
    for (i = 0; i < l; i++) {
        var p = LevelStack[i];
        path += Tree[p].realName +"/" ;
    }
    return path;
}

function displayHead()
{
    jQuery("#hudHead").html(getCurrentPath());
}

function displayContent(item)
{
    if (item === undefined) {
        jQuery("#hudContent").html("");
        return;
    }
    var text;
    var dir = item.getSubGraph();
    if (dir !== undefined) {
        text = "dir ";
    } else {
        text = "file ";
    }

    text += item.realName + "<br>";
    if (dir !== undefined) {
        var nbFiles = 0;
        var nbDirs = 0;
        var children = dir.getChildren()[0].children;
        var l = children.length;
        for (var i = 0; i < l; i++) {
            if (children[i].getSubGraph() !== undefined) {
                nbDirs++;
            } else {
                nbFiles++;
            }
        }

        text += "files: " + nbFiles + "  dir: " + nbDirs + "<br>"; 
    } else {
        var size = 32 + Math.floor(Math.random()*10000);
        text += "size " + size.toString() + " Ko<br>";
        text += "owner " + item.author + "<br>";
    }

    jQuery("#hudContent").html(text);
}


function DraggerController() {
    this.distance = 25;
    this.target = [ 0,0, 0];
    this.eye = [ 0, this.distance, 0];
    this.rotation = osg.Matrix.makeRotate(-Math.PI/3.0, 1,0,0); // osg.Quat.makeIdentity();
    this.up = [0, 0, 1];
    this.time = 0.0;
    this.dx = 0.0;
    this.dy = 0.0;
    this.buttonup = true;
    this.scale = 1.0;
    this.targetDistance = this.distance;
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
                this.panModel(dx/this.scale, dy/this.scale);
            } else {
                this.computeRotation(dx, dy);
            }
        }
    },
    releaseButton: function() {
        this.buttonup = true;
        var hit = this.getIntersection();
        if (hit !== undefined && this.pushHit !== undefined && this.pushHit.name !== undefined && this.pushHit.name === hit.name) {

            var item = hit.item;
            if (Debug)
                osg.log("hit " + hit.name );
            if (this.currentSelectedItem === item) { // go into
                this.changeLevel(hit.name, item);
                if (this.currentSelectedItem !== undefined) {
                    this.currentSelectedItem.selected = false;
                }
                this.currentSelectedItem = undefined;
                this.update(1.0,0.0);
                
                displayHead();
            } else {

                var position = item.globalPosition;
                //var position = osg.Matrix.getTrans(item.getMatrix());

                if (this.timeMotion !== undefined) { // it means not finished
                    this.target = this.targetMotion;
                    this.distance = this.targetDistance;
                } else {
                    var l = Math.random() < 0.5;
                    var dx;
                    if (l)
                        dx = .5;
                    else
                        dx = -.5;

                    var eye = osg.Vec3.add(this.target, osg.Matrix.transformVec3([0, 0, this.distance], osg.Matrix.inverse(this.rotation)));
                    var itemScale;
                    itemScale = item.scaleSize;
                    itemScale = item.getItemBase().getItem().getUpdateCallback().sz;
                    var top = itemScale/item.parentNode.scaleLevel;
                    if (Debug === true)
                        osg.log("top " + top + " item " + itemScale + " eye " + eye[2]);
                    var topItem = osg.Vec3.add(position, [0,0,top]);
                    var eyeToItem = osg.Vec3.sub(topItem, eye);
                    var eyeAltitude = eye[2]-topItem[2];
                    var le2i = osg.Vec3.length2(eyeToItem);
                    var dy = 0;
                    if (le2i !== 0.0) {
                        var angle = Math.asin(eyeAltitude/Math.sqrt(le2i));
                        if (eyeAltitude < 0)
                            angle = -angle;

                        var diff = Math.PI/4 - angle;
                        dy = diff * 0.3;
                        if (Debug === true)
                            osg.log("angle " + angle + " diff " + diff + " dy " + dy);
                        if (false) {
                            var limit = 22.0 * Math.PI/180.0;
                            if (angle < limit) {
                                dy = 0.2;
                            } else if (angle > Math.PI/4 + limit) {
                                dy = -0.2;
                            }
                        }
                    }

                    this.update(dx,dy);
                }
                this.timeMotion = (new Date()).getTime();

                this.targetMotion = position;
                this.targetDistance = 10*1.0/item.parentNode.scaleLevel;
                if (this.currentSelectedItem !== undefined) {
                    this.currentSelectedItem.fadeOutItemsChildren();
                    this.currentSelectedItem.selected = false;
                }
                
                this.currentSelectedItem = item;
                this.currentSelectedItem.fadeInItemsChildren();
                item.selected = true;

                displayContent(item);
            }
        } else {
            if (this.currentSelectedItem !== undefined) {
                this.currentSelectedItem.fadeOutItemsChildren();
                this.currentSelectedItem.selected = false;
            }
            if (hit)
                hit.item.selected = false;
            this.currentSelectedItem = undefined;
        }
    },

    unselect: function() {
        if (this.currentSelectedItem !== undefined) {
            this.currentSelectedItem.fadeOutItemsChildren();
            this.currentSelectedItem.selected = false;
            this.currentSelectedItem = undefined;
        }
    },

    getIntersection: function() {
        //osg.log("intersect " + this.clientX + " " + this.clientY);
        var hits = root.computeIntersections(this.clientX, this.clientY, 1);
        var l = hits.length;
        if (l === 0 ) {
            return undefined;
        }
        hits.sort(function(a,b) {
            return a.ratio - b.ratio;
        });

        // use the first hit
        var hit = hits[0].nodepath;
        var l2 = hit.length;
        var itemSelected;
        var name;
        while (l2-- >= 0) {
            if (hit[l2].itemToIntersect !== undefined) {
                name = hit[l2].getName();
                //itemSelected = hit[l2].children[0].getUpdateCallback();
                itemSelected = hit[l2];
                break;
            }
        }

        return { 'name': name, 
                 'item': itemSelected };
    },

    changeScale: function(d) {
        if (Debug === true)
            osg.log("before change scale " + d + " , distance " + this.distance + " target " + this.targetDistance);

        var curd = this.distance;
        var scaleChange = this.scale/d;
        this.scale = d;
        this.distance = this.targetDistance;
        this.targetDistance = this.distance * scaleChange;
        this.timeMotion = (new Date()).getTime();
        if (Debug === true)
            osg.log("after change scale " + d + " , distance " + this.distance + " target " + this.targetDistance);
    },
    distanceIncrease: function() {
        this.distance = this.targetDistance;
        this.targetDistance += 10/this.scale;
        this.timeMotion = (new Date()).getTime();
    },
    distanceDecrease: function() {
        this.distance = this.targetDistance;
        this.targetDistance -= 10/this.scale;
        this.timeMotion = (new Date()).getTime();
    },

    changeLevel: function(name, itemSelected) {
        //selectLevel2(name, CurrentLevel, itemSelected);
        pushLevel(name);
        levelDown(name, CurrentLevel, itemSelected);
        PreviousLevel = CurrentLevel;
        CurrentLevel = name;
    },

    pushButton: function() {
        this.dx = this.dy = 0;
        if (Debug === true)
            osg.log("push distance " + this.distance + " target " + this.distance);
        // need to fix here if during animation
//        if (this.timeMotion) {
//            this.targetMotion = this.target;
//            this.timeMotion = undefined;
//        }

        var hit = this.getIntersection();
        this.pushHit = hit;
        this.buttonup = false;
    },
    getInverseMatrix: function () {
        this.updateWithDelay();

        var target = this.target;
        var distance = this.distance;

        if (this.timeMotion !== undefined) { // we have a camera motion event
            var dt = ((new Date()).getTime() - this.timeMotion)/1000.0;
            var motionDuration = 1.0;
            if (dt < motionDuration) {
                var r = osgAnimation.EaseOutQuad(dt/motionDuration);
                if (this.targetMotion)
                    target = osg.Vec3.add(this.target, osg.Vec3.mult(osg.Vec3.sub(this.targetMotion, this.target), r));
                if (this.targetDistance)
                    distance = this.distance + (this.targetDistance - this.distance) * r;
            } else {
                if (this.targetMotion) {
                    this.target = this.targetMotion;
                    target = this.targetMotion;
                }
                if (this.targetDistance) {
                    this.distance = this.targetDistance;
                    distance = this.targetDistance;
                }
                this.timeMotion = undefined;
            }
        }
        
        //this.targetMotion
        var inv;
        var eye = osg.Matrix.transformVec3([0, 0, distance], osg.Matrix.inverse(this.rotation));
        inv = osg.Matrix.makeLookAt(osg.Vec3.add(target,eye), target, [0,0,1]);

        return inv;
    },

};

function getPreviousLevel() {
    if (LevelStack.length <= 1)
        return undefined;
    return LevelStack[LevelStack.length-2];
}
function pushLevel(name) { LevelStack.push(name);}
function popLevel() {
    var p = getPreviousLevel();
    if (p === undefined)
        return;

    CurrentLevel = p;
    LevelStack.pop();
    PreviousLevel = getPreviousLevel();
}
function getCurrentLevel() { return LevelStack[LevelStack.length-1]; }

function levelUp(newlevel, oldlevel, itemSelected)
{
    if (Tree[newlevel] !== undefined) {
        t = updateVisitor.getFrameStamp().getSimulationTime();

        var t;
        var l;
        var item;
        var c;
        var previousScale = 1.0;
        if (oldlevel !== undefined) {
            if (Tree[oldlevel] !== undefined) {
                previousScale = Tree[oldlevel].scaleLevel;
                l = Tree[oldlevel].children.length;
                for (c = 0; c < l; c++) {
                    item = Tree[oldlevel].children[c];
                    if (Debug === true)
                        osg.log("level up hide item " + item.getName());
                    //item.getItemBase().setNodeMask(0);
                    //item.getItemOnly().setNodeMask(0);
                    item.getItemBase().getItem().itemFadeOutAndHide();
                }
            }
        }

        // update camera distance
        var scale = Tree[newlevel].scaleLevel;
        if (Debug === true) {
            osg.log("previous " + previousScale + " new scale " + scale);
        }
        root.manipulator.changeScale(scale);

        l = Tree[newlevel].children.length;
        if (Debug === true) {
            osg.log("new level " + newlevel);
        }
        for (c = 0; c < l; c++) {
            item = Tree[newlevel].children[c];
            item.setNodeMask(~0);
            item.getItemBase().setNodeMask(~0);
            item.getItemOnly().setNodeMask(0);
            item.getItemBase().getItem().itemFadeIn();
            if (Debug === true) {
                osg.log("new level item " + item.getName());
            }
        }
        displayHead();
        displayContent();
    }
}

function levelDown(newlevel, oldlevel, itemSelected)
{
    if (Tree[newlevel] !== undefined) {
        t = updateVisitor.getFrameStamp().getSimulationTime();

        var t;
        var l;
        var item;
        var c;
        var previousScale = 1.0;
        if (oldlevel !== undefined) {
            if (Tree[oldlevel] !== undefined) {
                previousScale = Tree[oldlevel].scaleLevel;
                l = Tree[oldlevel].children.length;
                for (c = 0; c < l; c++) {
                    item = Tree[oldlevel].children[c];
                    item.getItemBase().getItem().itemFadeOutWithoutScale();
                }
            }
        }

        // update camera distance
        var scale = Tree[newlevel].scaleLevel;
        if (Debug === true) {
            osg.log("previous " + previousScale + " new scale " + scale);
        }
        root.manipulator.changeScale(scale);

        l = Tree[newlevel].children.length;
        if (Debug === true) {
            osg.log("new level " + newlevel);
        }
        //Tree[newlevel].fadeInItemsChildren();
        if (true) {
            for (c = 0; c < l; c++) {
                item = Tree[newlevel].children[c];
                item.setNodeMask(~0);
                item.getItemBase().setNodeMask(~0);
                item.getItemOnly().setNodeMask(0);
                if (item.getSubGraph())
                    item.getSubGraph().setNodeMask(0);
                //item.getItemBase().getItem().itemFadeIn();
                if (Debug === true) {
                    osg.log("new level item " + item.getName());
                }
            }
        }
        Tree[newlevel].setNodeMask(~0);

        displayHead();
        displayContent();
    }
}



function setupManipulator() {
    var view = root;
    view.manipulator = new DraggerController();
    view.manipulator.currentMode === "drag";

    convertEventToCanvas = function(e) {
        var myObject = document.getElementById("3DView");
        var posx,posy;
	if (e.pageX || e.pageY) {
	    posx = e.pageX;
	    posy = e.pageY;
	}
	else if (e.clientX || e.clientY) {
	    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

        var divGlobalOffset = function(obj) {
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
        posx = posx - globalOffset[0];
        posy = myObject.height-(posy - globalOffset[1]);
        return [posx,posy];
    };

    jQuery(document.getElementById("3DView")).bind( {
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
            if (view.manipulator.currentMode === "drag") {
                view.manipulator.currentMode = "pan";
            } else {
                view.manipulator.currentMode = "drag";
            }
        }
    });

    if (true) {
        jQuery(document).mousewheel(function(objEvent, intDelta) {
	    if (intDelta < 0){
                view.manipulator.distanceIncrease();
                return false
	    } else if (intDelta > 0){
                view.manipulator.distanceDecrease();
                return false;
	    }
	});
    }

    if (true) {
        jQuery(document).bind({'keydown' : function(event) {
            if (Debug === true)
                osg.log("keycode " + event.keyCode);
            if (event.keyCode === 13) { // enter to debug
                var hit  = view.manipulator.getIntersection();
                if (hit !== undefined) {
                    var item = hit.item;
                    if (item.selected === true) {
                        if (Debug === true)
                            osg.log("Item " + item.getName() + " is selected");
                    } else {
                        if (Debug === true)
                            osg.log("Item " + item.getName() + " is not selected");
                    }
                    if (view.manipulator.currentSelectedItem !== undefined)
                        if (Debug === true)
                            osg.log("Dragger reference " + view.manipulator.currentSelectedItem.getName());
                    item.reportState();
                }
                return false;
            } else if (event.keyCode === 33) { // pageup
                view.manipulator.distanceIncrease();
                return false;
            } else if (event.keyCode === 34) { //pagedown
                view.manipulator.distanceDecrease();
                return false;
            } else if (event.keyCode === 8) { // backspace

                var previous = getPreviousLevel();
                var current = getCurrentLevel();
                if (Debug === true) {
                    osg.log("up previous " + previous + " current " + current);
                }
                view.manipulator.unselect();
                if (previous !== undefined) {
                    LevelStack.pop();
                    levelUp(previous, current);
                    CurrentLevel = previous;
                    PreviousLevel = current;
                }
                return false;
            }
        }});
    }
}





function BaseCallback() {
    this.moveOut = -1e4;
    this.moveIn = 0;
};
 
BaseCallback.prototype = {
    update: function(node, nv) {

        var stime = nv.getFrameStamp().getSimulationTime();
        var duration = 1;
        var ratio;
        var scale;
        if (stime >= this.moveIn && stime < this.moveIn + duration) {
            ratio = (stime - this.moveIn)/duration;
        } else if (stime >= this.moveOut && stime < this.moveOut + duration) {
            ratio = (stime - this.moveOut)/duration;
        }

        node.traverse(nv);
    },
};


function createTextRenderingProgram()
{
    var vertexshader = [
        "",
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        "attribute vec3 Vertex;",
        "attribute vec2 TexCoord0;",
        "varying vec2 FragTexCoord0;",
        "uniform mat4 ModelViewMatrix;",
        "uniform mat4 ProjectionMatrix;",
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
        "uniform sampler2D TexUnit0;",
        "varying vec2 FragTexCoord0;",
        "void main(void) {",
        "vec4 c;",
        "c = texture2D(TexUnit0, FragTexCoord0);",
        "gl_FragColor = c;",
        "}",
        ""
    ].join('\n');

    var program = osg.Program.create(
        osg.Shader.create(gl.VERTEX_SHADER, vertexshader),
        osg.Shader.create(gl.FRAGMENT_SHADER, fragmentshader));
    var stateset = new osg.StateSet();
    stateset.setAttributeAndMode(program);
//    stateset.addUniform(osg.Uniform.createInt1(0,"TexUnit0"));
    return stateset;
}

var BackgroundCallback = function(viewRoot) { this.view = viewRoot;}
BackgroundCallback.prototype = {
    update: function(node, nv) {
        var sinDuration = 220.0;
        var stime = nv.getFrameStamp().getSimulationTime();
        var start = 0.0;
        var end = start + sinDuration;
        var cur = (stime-end) * 2.0*Math.PI / sinDuration;
        cur = cur % (2.0*Math.PI);
        osg.log(cur);
        node.setMatrix(osg.Matrix.makeRotate(cur, 0,0,1));
        //node.setMatrix
        node.traverse(nv);
    }
};

function createBackgroundRenderingProgram()
{
    var vertexshader = [
        "",
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        "attribute vec3 Vertex;",
        "attribute vec3 Normal;",
        "uniform mat4 ModelViewMatrix;",
        "uniform mat4 ProjectionMatrix;",
        "uniform mat4 NormalMatrix;",
        "uniform vec3 CameraDirection;",
        "varying vec4 fragColor;",
        "vec3 computeNormal() {",
        "   return vec3(NormalMatrix * vec4(Normal, 0.0));",
        "}",
        "vec3 computeEyeDirection() {",
        "   return vec3(ModelViewMatrix * vec4(Vertex,1.0));",
        "}",
        "void main(void) {",
        "  vec3 eyeVector = -computeEyeDirection();",
        "  float dist = eyeVector[2];",
        "  //vec3 eyeVector = CameraDirection;",
        "  eyeVector = normalize(eyeVector);",
        "  vec3 normal = computeNormal();",
        "  float r = dot(eyeVector, normal);",
        "  if (r < 0.0)",
        "     r = 0.0;",
        "  r = r * (30.0-dist)/30.0;",
        "  fragColor = vec4(0.2, 0.2, 0.2, 0.20) * r;",
        "  gl_Position = ProjectionMatrix * ModelViewMatrix * vec4(Vertex,1.0);",
        "}",
        ""
    ].join('\n');

    var fragmentshader = [
        "",
        "#ifdef GL_ES",
        "precision highp float;",
        "#endif",
        "varying vec4 fragColor;",
        "void main(void) {",
        "gl_FragColor = fragColor;",
        "}",
        ""
    ].join('\n');

    var program = osg.Program.create(
        osg.Shader.create(gl.VERTEX_SHADER, vertexshader),
        osg.Shader.create(gl.FRAGMENT_SHADER, fragmentshader));
    var stateset = new osg.StateSet();
    stateset.setAttributeAndMode(program);
    return stateset;
}


var ItemUpdateCallback = function(sx, sy, sz, activity, color, name, parentLevel, parentNode) {
    this.sinDuration = 20.0*(1.0-activity);
    this.sx = sx;
    this.sy = sy;
    this.sz = sz;
    this.colorSource = color;
    this.moveOut = -1e4;
    this.moveIn = 0;
    this.name = name;
    this.parentLevel = parentLevel;
    this.parentNode = parentNode;
};

ItemUpdateCallback.prototype = {
    setPosition: function(pos) {
        this.position = pos;
    },
    update: function(node, nv) {
        if (Debug === true) {
            //osg.log("name " + this.name + " parent " + this.parentLevel + " in " + this.moveIn + " out " + this.moveOut);
        }
        var stime = nv.getFrameStamp().getSimulationTime();
        var duration = 1;
        var start = 0.0;
        var end = start + duration;
        var s;
        var ratio = 1.0;
        var scaleRatio = 1.0;
        var dir;
        if (node.fadeIn) {
            if (stime >= this.moveIn && stime < this.moveIn + duration) {
                ratio = (stime - this.moveIn)/duration;
                ratio = osgAnimation.EaseOutCubic(ratio);
                scaleRatio = ratio;
            }

        } else if (node.fadeOut) {
            if (stime >= this.moveOut && stime < this.moveOut + duration) {
                ratio = (stime - this.moveOut)/duration;
                ratio = 1.0 - osgAnimation.EaseOutQuad(ratio);
            }
            if (stime > (this.moveOut + duration)) {
                var b = node.base;
                b.getItemBase().setNodeMask(0);
                b.getItemOnly().setNodeMask(0);
            }
            scaleRatio = ratio;
        } else if (node.fadeOutAndHide) {
            //osg.log("fade out and hide " + node.getName());
            if (stime >= this.moveOut && stime < this.moveOut + duration) {
                ratio = (stime - this.moveOut)/duration;
                ratio = 1.0 - osgAnimation.EaseOutQuad(ratio);
            }
            if (stime > (this.moveOut + duration)) {
                var b = node.base;
                b.getItemBase().setNodeMask(0);
                b.getItemOnly().setNodeMask(0);
                if (b.getSubGraph())
                    b.getSubGraph().setNodeMask(0);
            }
            scaleRatio = ratio;

        } else if (node.fadeOutWithoutScale) {
            if (stime >= this.moveOut && stime < this.moveOut + duration) {
                ratio = (stime - this.moveOut)/duration;
                ratio = 1.0 - osgAnimation.EaseOutQuad(ratio);
            }
            if (stime > (this.moveOut + duration)) {
                var b = node.base;
                b.getItemBase().setNodeMask(0);
                b.getItemOnly().setNodeMask(0);
            }
            scaleRatio = 1.0;
        }
        var cur = (stime-end) * 2.0*Math.PI / this.sinDuration;
        cur = cur % (2.0*Math.PI);
        s = osg.Matrix.makeScale( this.sx, this.sy, this.sz * scaleRatio + ( 0.3 * Math.sin(cur)));
        node.setMatrix(s);
        var color = osg.Vec4.mult(this.colorSource, ratio);
        node.stateset_used.getAttributeMap().Material.emission = color;

        node.traverse(nv);
    }
};

var AutoRotateCallback = function(viewRoot) { 
    this.view = viewRoot;
    this.moveOut = -1e4;
    this.moveIn = 0;
};
AutoRotateCallback.prototype = {
    setText: function(stateset, text) {
        this.stateset = stateset;
        this.text = text; 
        this.needToBuild = true;
    },
    setPosition: function(position) { this.position = position;},
    setScale: function(scale) { this.scale = scale;
                                this.preMatrix = osg.Matrix.makeRotate(Math.PI/2, 1,0,0);
                                this.postMatrix = osg.Matrix.makeScale(1/this.scale, 1.0/this.scale, 1);
                              },
    update: function(node, nv) {
        var currentTime = nv.getFrameStamp().getSimulationTime();

        if (currentTime > TextureGenerateStamp && this.needToBuild === true && this.text !== undefined) {
            TextureGenerateStamp = currentTime + 0.2;
            var texture = createTextureText(this.text);
            this.stateset.setTextureAttribute(0, texture);
            this.needToBuild = false;
        }

        var m = this.view.getViewMatrix();
        var f = [];
        var s = [];
        var u = [];
        minv = osg.Matrix.inverse(m);

        osg.Matrix.transform3x3(m, [0,1,0], u);
        osg.Matrix.transform3x3(m, [0,0,1], f);
        osg.Vec3.normalize(u);
        osg.Vec3.normalize(f);
        osg.Vec3.cross(u,f, s);
        osg.Vec3.normalize(s);
        osg.Vec3.cross(s,u, f);
        osg.Vec3.normalize(f);

        var result = [];
        result[0]=s[0]; result[4]=u[0]; result[8]=-f[0]; result[3]=0.0;
        result[1]=s[1]; result[5]=u[1]; result[9]=-f[1]; result[7]=0.0;
        result[2]=s[2]; result[6]=u[2]; result[10]=-f[2];result[11]=0.0;
        result[12]=  0; result[13]=  0; result[14]=  0;  result[15]=1.0;

        
        node.setMatrix(osg.Matrix.mult(osg.Matrix.mult( this.preMatrix ,result),this.postMatrix));

        var ratio = 1.0;
        var stime = nv.getFrameStamp().getSimulationTime();
        var duration = 1;
        var start = 0.0 + (this.sz)*0.03;
        var end = start + duration;
        var s;
        var ratio = 1.0;

        if (stime >= this.moveOut && stime < this.moveOut + duration) {
            ratio = (stime - this.moveOut)/duration;
            ratio = 1.0 - osgAnimation.EaseOutQuad(ratio);
        } else if (stime >= this.moveIn && stime < this.moveIn + duration) {
            ratio = (stime - this.moveIn)/duration;
            ratio = osgAnimation.EaseOutCubic(ratio);
        }

        //node.getOrCreateStateSet().getAttributeMap().Material.emission = osg.Vec4.mult(this.colorSource, ratio);

        node.traverse(nv);
    }
};


function createScene()
{
    var scene = new osg.Node();
    //Cube = new osg.Node();
    Cube = osg.ParseSceneGraph(cube_regular);
    //Cube.addChild(osg.ParseSceneGraph(cube_wire));
    var bg;
    if (false) {
        if (false) {
            bg = osg.ParseSceneGraph(Scene);
            var material = new osg.Material();
            material.diffuse = [ 0.0, 0.0, 0.0, 0.0];
            material.specular = [ 0.0, 0.0, 0.0, 0.0];
            material.ambient = [ 0.0, 0.0, 0.0, 0.0];
            material.emission = osg.Vec4.copy(OrangeColor);
            material.emission[3] = 0.3;
            material.shininess = 12.5;
            bg.getOrCreateStateSet().setAttributeAndMode(material);
        }
        bg = new osg.Node();
    } else {
        bg = osg.ParseSceneGraph(getBackground());
        //bg.setStateSet(createBackgroundRenderingProgram());
        var scale = 1.0;
        var bb = new osg.MatrixTransform();
        bb.addChild(bg);

        var material = new osg.Material();
        material.diffuse = [ 0.0, 0.0, 0.0, 0.0];
        material.specular = [ 0.0, 0.0, 0.0, 0.0];
        material.ambient = [ 0.0, 0.0, 0.0, 0.0];
        material.emission = osg.Vec4.copy(OrangeColor);
        material.emission = [ 0.14, 0.14, 0.14, 0.14];
        bg.getOrCreateStateSet().setAttributeAndMode(material);
        bg.getOrCreateStateSet().addUniform(new osg.Uniform.createInt1(0,"TexUnit0"));
        var texture = osg.Texture.create("line.png");
        bg.getOrCreateStateSet().setTextureAttribute(0, texture);
        bg = bb;
        bg.setMatrix(osg.Matrix.makeScale(scale, scale, scale));

        var bbr = new osg.MatrixTransform();
//        bbr.setUpdateCallback(new BackgroundCallback(root));
        bbr.addChild(bg);
        bg = bbr;

    }
    bg.setNodeMask(2);

    scene.addChild(bg);
    scene.getOrCreateStateSet().setAttributeAndMode(new osg.BlendFunc(gl.ONE, gl.ONE));

    var deep = 3;
    var tree = {};

    var level = 0;
    var nbx = NbItemRange;
    var nby = NbItemRange;
    if (Debug === true) {
        nbx = 2;
        nby = 1;
    }
    var r = createSceneLevel(tree, level, nbx, nby, "root", 1.0, osg.Matrix.makeIdentity());

    tree.root = r;
    tree.root.realName = "";
    Tree = tree;
    scene.addChild(tree.root);
    tree.root.scaleLevel = 1.0;

    for (var key in tree) {
        //osg.log("add " + key);
        //scene.addChild(tree[key]);
        var item = tree[key];
//        item.setUpdateCallback( new RootCallback());
        //tree[key].setNodeMask(0);
        tree[key].setName(key);
    }
    r.setNodeMask(0);
    //CurrentLevel = "root";

    setupManipulator();

    pushLevel("root");
    PreviousLevel = undefined;
    CurrentLevel = "root";

    setTimeout(function() {
        r.setNodeMask(~0);
        root.manipulator.update(1, 0);
        levelDown("root"); },
               2000);
    return scene;
}


function setupItemFunction(item) {
    item.itemFadeIn = function() {
        this.fadeIn = true;
        this.fadeOut = false;
        this.fadeOutAndHide = false;
        this.fadeOutWithoutScale = false;
        this.getUpdateCallback().moveIn = updateVisitor.getFrameStamp().getSimulationTime();
    };

    item.itemFadeOut = function() {
        this.fadeIn = false;
        this.fadeOut = true;
        this.fadeOutAndHide = false;
        this.fadeOutWithoutScale = false;
        this.getUpdateCallback().moveOut = updateVisitor.getFrameStamp().getSimulationTime();
    };

    item.itemFadeOutWithoutScale = function() {
        this.fadeIn = false;
        this.fadeOut = false;
        this.fadeOutAndHide = false;
        this.fadeOutWithoutScale = true;
        this.getUpdateCallback().moveOut = updateVisitor.getFrameStamp().getSimulationTime();
    };

    item.itemFadeOutAndHide = function() {
        this.fadeIn = false;
        this.fadeOut = false;
        this.fadeOutAndHide = true;
        this.fadeOutWithoutScale = false;
        this.getUpdateCallback().moveOut = updateVisitor.getFrameStamp().getSimulationTime();
    };
}

function setupBaseFunction(base) {
    base.getItemBase = function() {
        return base.children[0];
    };
    base.getItemOnly = function() {
        return base.children[1];
    };
    base.getSubGraph = function() {
        return base.children[2];
    };

    base.reportState = function() {
        osg.log("item id " + base.getName() + " name " + base.realName);
        if (base.getSubGraph() === undefined) {
            return;
        }
        var rootChild = base.getSubGraph().getChildren()[0];
        osg.log("subgraph " + rootChild.getName() + " nodemask " + rootChild.getNodeMask());
        var children = rootChild.getChildren();
        var l = children.length;
        for (var c = 0; c < l; c++) {
            var child = children[c];
            if (child.getSubGraph()!== undefined) {
                osg.log("child " + child.getName() + " ItemBase " + child.getItemBase().getNodeMask() + " SubGraph " + child.getSubGraph().getNodeMask() + " ItemOnly " + child.getItemOnly().getNodeMask() + " Item " + child.getItemBase().getItem().getNodeMask() + " info " + child.getItemBase().getInfo().getNodeMask());
            } else {
                osg.log("child " + child.getName() + " ItemBase " + child.getItemBase().getNodeMask() + " ItemOnly " + child.getItemOnly().getNodeMask() + " Item " + child.getItemBase().getItem().getNodeMask() + " info " + child.getItemBase().getInfo().getNodeMask());
            }
            osg.log("state " + child.getItemBase().getItem().fadeOutWithoutScale + " " + child.getItemBase().getItem().fadeIn + " " + child.getItemBase().getItem().fadeOutAndHide + "  " + child.getItemBase().getItem().fadeOut);
        }
    };

    base.fadeInItemsChildren = function() {
        if (base.getSubGraph() === undefined) {
            return;
        }
        base.getSubGraph().setNodeMask(~0);
        var rootChild = base.getSubGraph().getChildren()[0];
        rootChild.setNodeMask(~0);
        var children = rootChild.getChildren();
        var l = children.length;
        for (var c = 0; c < l; c++) {
            var child = children[c];
            child.getItemBase().setNodeMask(0);
            if (child.getSubGraph()) {
                child.getSubGraph().setNodeMask(0);
            }
            child.getItemOnly().setNodeMask(2);
            child.getItemBase().getItem().itemFadeIn();
        }
    };

    base.fadeOutItemsChildren = function() {
        if (base.getSubGraph() === undefined) {
            return;
        }
        var rootChild = base.getSubGraph().getChildren()[0];
        rootChild.setNodeMask(~0);
        var children = rootChild.getChildren();
        var l = children.length;
        for (var c = 0; c < l; c++) {
            var child = children[c];
            if (base.selected) {
                child.getItemBase().setNodeMask(0);
                child.getItemOnly().setNodeMask(2);
            } else {
                child.getItemBase().setNodeMask(2);
                child.getItemOnly().setNodeMask(0);
            }
            child.getItemBase().getItem().itemFadeOut();
        }
    };
}


function setupItemBaseFunction(itemBase)
{
    itemBase.getItem = function() {
        return itemBase.children[0];
    };
    itemBase.getInfo = function() {
        return itemBase.children[1];
    };
}
var InstanceItem = 0;

function createSceneLevel(tree, level, sizex, sizey, parentLevel, parentScale, parentMatrix)
{
    var scene = new osg.MatrixTransform();
    var stepx = 5;
    var stepy = 5;
    var blueGroup = new osg.Node();
    var orangeGroup = new osg.Node();
    for (var x = 0 ; x < sizex; x++) {
        for (var y = 0 ; y < sizey; y++) {
            
            var base = new osg.MatrixTransform();
            var itemBase = new osg.Node();
            var item = new osg.MatrixTransform();

            var onlyItems = new osg.Node();
            

            var posx = -stepx*(sizex-1)/2 + x*stepx;
            var posy = -stepy*(sizey-1)/2 + y*stepy;
            var scaleRandom = 1 + Math.floor(Math.random()*7);
            var translate;
            var name = "node_" + level + "_" + y + "_" + x + "_" + InstanceItem;
            InstanceItem++;
            base.setName(name);
            base.author = Authors[Math.floor(Math.random()*Authors.length)];
            
            item.setName("item_"+name);
            itemBase.setName("itemBase_"+name);
            var maxActivity = 2;
            var itemActivity = (1 + Math.floor(Math.random()*maxActivity)) / (maxActivity + 1);

            var scaleSize = 0.2 + itemActivity*3.0;
            //scaleSize = 2.0;

            if (CurvePlane) {
                var sphereRadius = 0;
                //var angle = 180;
                var stepAngleX = 30/sizex;
                var stepAngleY = 30/sizey;
                var qx = osg.Quat.makeRotate(((-sizex*0.5 + x) * stepAngleX) * Math.PI/180.0, 0,1,0);
                var qy = osg.Quat.makeRotate(((-sizey*0.5 + y) * stepAngleY) * Math.PI/180.0, 1,0,0);
                translate = osg.Matrix.mult( osg.Matrix.makeTranslate(posx,posy, sphereRadius), osg.Matrix.makeRotateFromQuat(osg.Quat.mult(qx,qy)));
            } else {
                var radius = 2;
                posx += -radius*0.5 + Math.floor(Math.random()*(radius+1));
                posy += -radius*0.5 + Math.floor(Math.random()*(radius+1));
                translate = osg.Matrix.makeTranslate( posx, posy, 0);
            }

            base.setMatrix(osg.Matrix.mult(osg.Matrix.makeScale(scaleSize,scaleSize,1), translate));

            setupBaseFunction(base);
            setupItemFunction(item);
            setupItemBaseFunction(itemBase);

            itemBase.addChild(item);
            base.addChild(itemBase);
            base.addChild(onlyItems);
            onlyItems.setNodeMask(0);
            onlyItems.addChild(item);

            item.base = base;


            var isFile = false;

            if (level === MaxLevel) {
                isFile = true;
            } else if ( Math.floor(Math.random()*7) === 5) {
                isFile = true;
            }

            if (isFile) {
                base.realName = NamesRandom[Math.floor(Math.random()*NamesRandom.length)];
            } else {
                base.realName = DirectoryNamesRandom[Math.floor(Math.random()*DirectoryNamesRandom.length)];
            }

            if (true) {
                var info = new osg.MatrixTransform();
                info.setNodeMask(2);
                itemBase.addChild(info);

                textRenderingCanvas = document.getElementById("TextRendering");
                var aspect = textRenderingCanvas.height/ textRenderingCanvas.width;
                var h = TextSize*aspect;
                var geom = osg.createTexuredQuad(-TextSize/2.0, 0, -h/2.0, 
                                                 TextSize, 0, 0,
                                                 0, 0 , h,
                                                 1,1);
                geom.setName("geom");
                geom.setStateSet(createTextRenderingProgram());

                // disable texture to avoid big slow down at start
                // anyway it's still slow

                //var texture = createTextureText(base.realName);
                //geom.getOrCreateStateSet().setTextureAttribute(0, texture);
                geom.getOrCreateStateSet().addUniform(osg.Uniform.createInt1(0, "TexUnit0"));
                var vu = osg.Uniform.createMatrix4(osg.Matrix.copy(root.getViewMatrix()), "ViewMatrix");
                var autocb = new AutoRotateCallback(root);
                info.setUpdateCallback(autocb);
                autocb.setPosition([posx, posy, 0]);
                autocb.setText(geom.getOrCreateStateSet(), base.realName);
                autocb.setScale(scaleSize);

                info.addChild(geom);
                info.setMatrix(osg.Matrix.makeScale(0.5,0.5,0.5));
            }

            item.addChild(Cube);

            var material;
            var st = new osg.StateSet();
            material = new osg.Material();
            material.diffuse = [ 0.0, 0.0, 0.0, 0.0];
            material.specular = [ 0.0, 0.0, 0.0, 0.0];
            material.ambient = [ 0.0, 0.0, 0.0, 0.0];

            st.setAttributeAndMode(material);
            //base.setStateSet(st);
            item.stateset_used = st;
            item.setStateSet(st);

            base.itemToIntersect = true;
            base.scaleSize = scaleSize;


            
            // simulate file or directory
                //material.emission = osg.Vec4.mult(BlueColor, 1.0itemActivity);
            var color;
            if (Debug)
                osg.log(item.getName() + " intensity " + itemActivity);
            if (isFile) {
                color = osg.Vec4.mult(BlueColor, itemActivity);
            } else {
                color = osg.Vec4.mult(OrangeColor, itemActivity);
            }
            material.emission = color;
            
            var cb = new ItemUpdateCallback(1, 1, scaleRandom, itemActivity, osg.Vec4.copy(material.emission), name, parentLevel, base);
            item.setUpdateCallback( cb );
            cb.setPosition([posx, posy, 0]);
         
            var globalMatrix = osg.Matrix.mult(base.getMatrix(),parentMatrix);
            base.globalPosition = osg.Matrix.getTrans(globalMatrix);
            base.parentNode = scene;

            if (!isFile) {
                var l2 = level+1;
                var nbx = 1+Math.floor(Math.random()*NbItemRange);
                var nby = 1+Math.floor(Math.random()*NbItemRange);
                if (Debug === true) {
                    nbx = 2;
                    nby = 1;
                }

                var childrenScale = itemActivity;
                if (nbx*stepx > childrenScale)
                    childrenScale = nbx*stepx;
                if (nby*stepy > childrenScale)
                    childrenScale = nby*stepy;

                var childrenScaleMatrix = osg.Matrix.makeScale(1.0/childrenScale, 1.0/childrenScale, 1/childrenScale);

                var globalScale = parentScale*childrenScale;

                var subgraph = createSceneLevel(tree, l2, nbx, nby, name, globalScale, osg.Matrix.mult(childrenScaleMatrix,globalMatrix));
                subgraph.scaleLevel = globalScale;
                tree[name] = subgraph;
                subgraph.realName = base.realName;
                var tr = new osg.MatrixTransform();
                tr.setMatrix(childrenScaleMatrix);
                base.addChild(tr);
                tr.addChild(subgraph);
                subgraph.setNodeMask(0);
            }
            scene.addChild(base);
        }
    }
    return scene;
}


