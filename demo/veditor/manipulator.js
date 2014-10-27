/** -*- compile-command: "jslint-cli manipulator.js" -*-
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

osgGA.AutomaticOrbitManipulator = function () {
    osgGA.OrbitManipulator.call(this);

    this.measureDeltaX = 0;
    this.measureDeltaY = 0;
    this.measureClientY = 0;
    this.measureClientX = 0;
    this.measureTime = 0;
    this.direction = 0.0;

    this.scale = 1.0;

    this.motionWhenRelease = 1.0;

    this.goToLocationRunning = false;

    this.contactsIntialDistance =1.0;
    this.nbContacts = 0;
    this.contacts = [];
    this.contactsPosition = [];
    this.zoomModeUsed = false;

    this.targetTarget = this.target;
    this.goToLocationDuration = 2.0;
};

osgGA.AutomaticOrbitManipulator.prototype = osg.objectInehrit(osgGA.OrbitManipulator.prototype, {

    getScaleFromDistance: function(eye) {
        return 0.05*(0.2 + 0.8 * (this.distance / (this.maxDistance-this.minDistance)));
    },

    computeRotation: function(dx, dy) {
        
        var scale = this.scale;

        var of = osg.Matrix.makeRotate(dx * scale, 0,0,1);
        var r = osg.Matrix.mult(of, this.rotation);

        of = osg.Matrix.makeRotate(dy * scale, 1,0,0);
        var r2 = osg.Matrix.mult(r, of);

        // test that the eye is not too up and not too down to not kill
        // the rotation matrix
        var eye = osg.Matrix.transformVec3([0, 0, this.distance], osg.Matrix.inverse(r2));
        if (eye[2] > 0.99*this.distance || eye[2] < -0.0*this.distance) {
            //discard rotation on y
            this.rotation = r;
            return;
        }
        this.rotation = r2;
    },

    
    setCameraMotion: function (eye, distance, center) {
        if (eye === undefined) {
            eye = this.eye;
        }

        if (distance === undefined) {
            distance = this.targetDistance;
        }

        if (center === undefined) {
            center = this.targetTarget;
        }

        // already running switch to new location
        var lookat = osg.Matrix.makeLookAt(eye, center, [0,0,-1]);
        var q = osg.Matrix.getRotate(lookat);

        if (this.goToLocationRunning) {
            var motion = this.getCurrentCameraMotion();
            var qStart = motion.rotation;
            var dStart = motion.distance;
            var cStart = motion.center;

            this.rotation = osg.Matrix.makeRotateFromQuat(osg.Quat.conj(qStart));
            this.distance = dStart;
            this.target = cStart;
        }
        this.targetRotation = q;
        this.targetDistance = distance;
        this.targetTarget = center;

        this.goToLocationTime = (new Date()).getTime();
        this.goToLocationRunning = true;

        this.disableAutomaticMotion(8.0);
    },

    getCurrentCameraMotion: function() {
        var goToLocationDuration = this.goToLocationDuration;

        var t = ((new Date()).getTime() - this.goToLocationTime)/1000.0;

        // manage rotation
        var q0 = osg.Matrix.getRotate(this.rotation);
        var q1 = this.targetRotation;

        if (t > goToLocationDuration) {
            t = 1.0;
            this.goToLocationRunning = false;
            this.rotation = osg.Matrix.makeRotateFromQuat(q1);
            this.distance = this.targetDistance;
            this.target = this.targetTarget;
            this.dx = 0;
            this.dy = 0;

        } else {
            t = osgAnimation.EaseOutCubic(t/goToLocationDuration);
        }

        var qCurrent = osg.Quat.slerp(t, q0, q1);
        osg.Quat.conj(qCurrent, qCurrent);

        var target = osg.Vec3.lerp(t, this.target, this.targetTarget);
        var distance = this.distance * (1.0-t) + t*this.targetDistance;

        return { 'rotation': qCurrent, 'distance': distance, 'center': target};
    },

    update: function(dx, dy) {
        if (dx > 0) {
            this.direction = 1.0;
        } else if (dx < 0) {
            this.direction = -1.0;
        }
        this.dx += dx;
        this.dy += dy;

        if (Math.abs(dx) + Math.abs(dy) > 0.0) {
            this.time = (new Date()).getTime();
        }
    },

    dblclick: function() {
        return false;
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

            var min = 0.015;
            if (Math.abs(dx) < min) {
                dx = min*this.direction * this.motionWhenRelease;
                this.dx = dx;
            }

            var val = Math.abs(this.dx) + Math.abs(this.dy);

        } else {
            this.dx = 0;
            this.dy = 0;
        }

        if (Math.abs(dx) + Math.abs(dy) > 0.0) {
            this.computeRotation(dx, dy);
        }
    },

    disableAutomaticMotion: function(duration) {
        var min = 0.015;
        this.motionWhenRelease = 0.0;
        if (this.timeout === undefined) {
            var that = this;
            this.timeout = true;
            window.setTimeout(function() {
                if (Math.abs(that.dx) + Math.abs(that.dy) === 0.0) {
                    that.motionWhenRelease = 1.0;
                    that.update(min+0.0001,0);
                }
                delete that.timeout;
            }, duration * 1000);
        }
    },

    mouseup: function(ev) {
        this.buttonup = true;
        
        var time = (new Date()).getTime()/1000.0;
        if (time - this.lastMotion > 0.05) {
            this.dx = 0;
            this.dy = 0;
            this.disableAutomaticMotion(4.0);
        } else {
            this.dx = this.lastDeltaX;
            this.dy = this.lastDeltaY;
            this.motionWhenRelease = 1.0;
        }

        if (this.pushHit !== undefined) {
            var hit = this.getIntersection();
            if (hit !== undefined) {
                if (hit.name === this.pushHit.name) {
                    //osg.log(hit.name + " intersected");
                    displayHtmlTweetContent(hit.item.tweet);
                }
            }
        }
        //osg.log(this.dx + " " + this.dy);
    },
    mousemove: function(ev) {

        if (this.buttonup === true) {
            return;
        }

        var scaleFactor;
        var curX;
        var curY;
        var deltaX;
        var deltaY;
        var pos = this.convertEventToCanvas(ev);
        curX = pos[0];
        curY = pos[1];

        scaleFactor = 10.0;
        deltaX = (this.clientX - curX) / scaleFactor;
        deltaY = (this.clientY - curY) / scaleFactor;
        this.clientX = curX;
        this.clientY = curY;

        var time = (new Date()).getTime()/1000.0;
        this.lastMotion = time;
        this.lastDeltaX = deltaX;
        this.lastDeltaY = deltaY;

        this.update(deltaX, deltaY);
    },
    mousedown: function(ev) {
        var pos = this.convertEventToCanvas(ev);
        this.clientX = pos[0];
        this.clientY = pos[1];
        this.pushButton();
        this.measureTime = (new Date()).getTime()/1000.0;
    },

    touchDown: function(ev) {
        if (this.nbContacts >= 2 || (this.nbContacts < 2 && this.zoomModeUsed === true)) {
            return;
        }
        this.contacts[this.nbContacts] = ev.streamId;
        if (this.contactsPosition[this.nbContacts] === undefined) {
            this.contactsPosition[this.nbContacts] = {};
        }
        this.contactsPosition[this.nbContacts].x = ev.clientX;
        this.contactsPosition[this.nbContacts].y = ev.clientY;
        this.nbContacts++;
        if (this.nbContacts === 1) {
            this.mousedown(ev);
        } else {

            var x1 = this.contactsPosition[0].x;
            var x2 = this.contactsPosition[1].x;
            var y1 = this.contactsPosition[0].y;
            var y2 = this.contactsPosition[1].y;
            var dist = Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) );
            this.contactsIntialDistance = dist;
	    //osg.log("2 contacts " + this.contactsIntialDistance);
	}
    },
    touchUp: function(ev) {
        if (this.zoomModeUsed === false && this.nbContacts === 1) {
	    //osg.log("use a mouse up ");
            this.mouseup(ev);
        }
        this.nbContacts--;
	if (this.nbContacts === 0) {
	    this.zoomModeUsed = false;
	}
    },
    touchMove: function(ev) {
        if (this.nbContacts === 2) {
            // zoom mode
	    this.zoomModeUsed = true;
            if (this.contacts[0] === ev.streamId) {
                if (this.contactsPosition[0] === undefined) {
                    this.contactsPosition[0] = {};
                }
                this.contactsPosition[0].x = ev.clientX;
                this.contactsPosition[0].y = ev.clientY;
            } else if (this.contacts[1] === ev.streamId) {
                if (this.contactsPosition[1] === undefined) {
                    this.contactsPosition[1] = {};
                }
                this.contactsPosition[1].x = ev.clientX;
                this.contactsPosition[1].y = ev.clientY;
            } else {
                osg.log("dont find the contact something weird");
            }
            var x1 = this.contactsPosition[0].x;
            var x2 = this.contactsPosition[1].x;
            var y1 = this.contactsPosition[0].y;
            var y2 = this.contactsPosition[1].y;
            var dist = Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) );
            var ratio = this.contactsIntialDistance/dist;
	    //osg.log("2 cts " + ratio);
            this.contactsIntialDistance = dist;
            var h = this.distance;
            //this.distance = this.targetDistance;
            this.targetDistance += (ratio - 1.0) * this.scale * this.maxDistance;
	    if (this.maxDistance !== 0.0 && this.targetDistance > this.maxDistance) {
		this.targetDistance = this.maxDistance;
	    }
	    if (this.minDistance !== 0.0 && this.targetDistance < this.minDistance) {
		this.targetDistance = this.minDistance;
	    }
	    this.distance = this.targetDistance;
	    //osg.log("target distance " + this.targetDistance);
            this.timeMotion = (new Date()).getTime();
            
        } else {
            // rotation
	    if (this.zoomModeUsed === false) {
		this.mousemove(ev);
	    }
        }
    },

    pushButton: function() {
        this.dx = this.dy = 0;
        this.buttonup = false;

        var hit = this.getIntersection();
        this.pushHit = hit;
    },

    getIntersection: function() {
        return undefined;
        var hits = this.view.computeIntersections(this.clientX, this.clientY, 1);
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


    getInverseMatrix: function () {
        var inv;
        var target;
        var distance;
        var eye;
        if (this.goToLocationRunning === true ) {

            var params = this.getCurrentCameraMotion();
            distance = params.distance;
            target = params.center;
            var qCurrent = params.rotation;
            eye = osg.Matrix.transformVec3([0, 0, distance], osg.Matrix.makeRotateFromQuat(qCurrent));
            this.eye = eye;
            inv = osg.Matrix.makeLookAt(osg.Vec3.add(target,eye), target, [0,0,1]);

        } else {

            this.updateWithDelay();

            target = this.target;
            distance = this.distance;
            
            eye = osg.Matrix.transformVec3([0, 0, distance], osg.Matrix.inverse(this.rotation));
            this.eye = eye;
            inv = osg.Matrix.makeLookAt(osg.Vec3.add(target,eye), target, [0,0,1]);
        }

        this.scale = this.getScaleFromDistance();
        return inv;
    }

});

