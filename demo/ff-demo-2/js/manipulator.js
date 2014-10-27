osgGA.OrbitManipulator2 = function () {
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
    this.currentMode = "rotate";

    this.measureDeltaX = 0;
    this.measureDeltaY = 0;
    this.measureClientY = 0;
    this.measureClientX = 0;
    this.measureTime = 0;
}

osgGA.OrbitManipulator2.prototype = {
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
        
        var scale = 1.0/10.0;

        var of = osg.Matrix.makeRotate(dx * scale, 0,0,1);
        var r = osg.Matrix.mult(of, this.rotation);

        of = osg.Matrix.makeRotate(dy * scale, 1,0,0);
        var r2 = osg.Matrix.mult(r, of);

        // test that the eye is not too up and not too down to not kill
        // the rotation matrix
        var eye = osg.Matrix.transformVec3([0, 0, this.distance], osg.Matrix.inverse(r2));
        if (eye[2] > 0.99*this.distance || eye[2] < -0.99*this.distance) {
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
        var direction = 0;
        if (this.dx < 0) {
            direction = -1;
        } else if (this.dx > 0) {
            direction = 1;
        }
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
                dx = min*direction;
                this.dx = dx;
            }

        } else {
            this.dx = 0;
            this.dy = 0;
        }

        if (Math.abs(dx) + Math.abs(dy) > 0.0) {
            this.computeRotation(dx, dy);
        }
    },

    mouseup: function(ev) {
        this.buttonup = true;
        
        var time = (new Date()).getTime()/1000.0;
        if (time - this.lastMotion > 0.05) {
            this.dx = 0;
            this.dy = 0;
        } else {
            this.dx = this.lastDeltaX;
            this.dy = this.lastDeltaY;
        }
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

        if (false &&  (time - this.measureTime) > 0.05) {
            this.measureDeltaX = (this.measureClientX - curX)/scaleFactor;
            this.measureDeltaY = (this.measureClientY - curY)/scaleFactor;
            this.measureClientX = curX;
            this.measureClientY = curY;
            this.measureTime = time;
            osg.log("x " + this.measureDeltaX + " y " + this.measureDeltaY);
        }

        this.update(deltaX, deltaY);
    },
    mousedown: function(ev) {
        var pos = this.convertEventToCanvas(ev);
        this.clientX = pos[0];
        this.clientY = pos[1];
        this.pushButton();
        this.measureTime = (new Date()).getTime()/1000.0;
    },

    setDistance: function(d) {
        this.distance = d;
        this.targetDistance = this.distance;
    },

    changeScale: function(d) {
        var curd = this.distance;
        var scaleChange = this.scale/d;
        this.scale = d;
        this.distance = this.targetDistance;
        this.targetDistance = this.distance * scaleChange;
        this.timeMotion = (new Date()).getTime();
    },
    distanceIncrease: function() {
        this.distance = this.targetDistance;
        this.targetDistance += this.distance/10;
        this.timeMotion = (new Date()).getTime();
    },
    distanceDecrease: function() {
        this.distance = this.targetDistance;
        this.targetDistance -= this.distance/10;
        this.timeMotion = (new Date()).getTime();
    },

    pushButton: function() {
        this.dx = this.dy = 0;
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

