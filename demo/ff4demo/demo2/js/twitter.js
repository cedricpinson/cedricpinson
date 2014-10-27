/** -*- compile-command: "jslint-cli twitter.js" -*-
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

var FakeTweet = true;

function generateFakeTweet()
{
    var t = {};
    t.profile_image_url = "http://a0.twimg.com/profile_images/612907596/glasses_Fond_disco_normal.jpg";
    var value = Math.random()*3.0;
    osg.log(value);
    if (value > 1.5) {
        t.text = "asdfasdf asjfdlk jsadfka dsjfa;ds jf ";
    } else {
        t.text = "asdfasdf asjfdlk jsadfka dsjfa;ds jf asdfasdf asjfdlk jsadfka dsjfa;ds jf asdfasdf asjfdlk jsadfka dsjfa;ds jf asdfasdf asjfdlk jsadfka dsjfa;ds jf";
    }
    t.from_user = "trigrou";
    t.created_at = new Date().toString();
    return t;
}



var TwitterUpdateCallback = function(stream) {
    this.stream = stream;
    this.lastDraw = 0;
};

TwitterUpdateCallback.prototype = {
    update: function(node, nv) {

        var t = nv.getFrameStamp().getSimulationTime();
        if (t - this.lastDraw  > 1.0) {

            if (this.stream.tweetToProcess.length > 0) {
                this.stream.consumeTweet(1, t );
            }
            this.lastDraw = t;

        }

        node.traverse(nv);
    }
};


var TweetUpdateCallback = function() {};

TweetUpdateCallback.prototype = {
    update: function(node, nv) {
        var t = nv.getFrameStamp().getSimulationTime();

        if (node.startTime === undefined) {
            node.startTime = t;
            node.originalMatrix = node.getMatrix();
            node.moving = true;
        }
        if (t < node.startTime) {
            node.traverse(nv);
            return;
        }
        var duration = 0.75;
        var r = (t-node.startTime)/duration;
        if (r > 1.0) {
            r = 1.0;
            node.moving = false;
            node.alreadyScaled = true;
        }
        r = osgAnimation.EaseOutCubic(r);
        
        var current = osg.Vec3.add(osg.Vec3.mult(node.endPosition, r), osg.Vec3.mult(node.startPosition, 1.0-r));
        if (node.alreadyScaled === undefined) {
            node.setMatrix(osg.Matrix.mult(osg.Matrix.makeScale(r,r,r) , osg.Matrix.makeTranslate(current[0], current[1], current[2])));
        } else {
            node.setMatrix(osg.Matrix.makeTranslate(current[0], current[1], current[2]));
        }

        node.traverse(nv);
    }
};


var TwitterStream = function() {
    this.url = 'http://search.twitter.com/search.json?geocode=48.85667,2.35099,20km&callback=?';
    this.geometry = [];
    this.items = new osg.Node();
    this.itemCallback = new TweetUpdateCallback();
    this.tweetList = [];
    this.tweetToProcess = [];
};

TwitterStream.prototype = {

    consumeTweet: function(number, t) {
        this.currentTime = t;
        if (this.tweetToProcess.length < number) {
            number = this.tweetToProcess.length;
        }
        for (var i = 0, l = number; i < l; i++) {
            this.displayTweetToCanvas(this.tweetToProcess[i]);
        }
        this.tweetToProcess = this.tweetToProcess.splice(number);
    },

    start: function() {
        var canvas = document.getElementById("3DView");
        this.canvasSize = [canvas.width, canvas.height];
        this.heightOffset = 10.0;
        this.tweetWidth = 500;
        this.maxColumn = Math.floor(this.canvasSize[0]/this.tweetWidth);
        this.widthOffset = (this.canvasSize[0] - (this.tweetWidth * this.maxColumn) ) / 4.0;
        this.currentHeight = canvas.height - this.heightOffset;
        this.poll();
    },

    addTweet: function(tweet) {
        var t = this.currentTime;
        this.items.addChild(tweet);
        var nb = this.items.children.length;
        var currentColumn = 0;
        var currentHeight = this.heightOffset;

        for (var i = 0, l = this.items.children.length; i < l; i++) {
            var item = this.items.children[l-i-1];
            if (item.height + currentHeight > this.canvasSize[1]) {
                if (currentColumn === this.maxColumn-1) {
                    // need to move items
                    currentHeight += item.height;
                } else {
                    currentColumn++;
                    currentHeight = this.heightOffset;
                }
            }
            var x = (currentColumn+1)*this.widthOffset + currentColumn*this.tweetWidth + this.tweetWidth/2.0;
            var y = this.canvasSize[1] - currentHeight - item.height/2.0;
            item.startPosition = item.endPosition;
            if (item.moving === false) {
                if (t !== undefined) {
                    item.startTime = t + ( 0.5 - 0.5*(i+1)/this.items.children.length );
                    //osg.log("start time " + item.startTime + " current time " + t );
                    //node.moving = true;
                } else {
                    item.startTime = undefined;
                }
            }
            item.endPosition = [ x, y ,0];
            currentHeight += this.heightOffset + item.height;
            //osg.log("position item " + i + " " + tweet.endPosition);
        }
    },

    displayTweetToCanvas: function ( tweet, callback) {
        osg.log(tweet);

        // tweet max size = 500/91
        // 
        var twitterRendering = document.getElementById("TwitterRendering");
        var textureSizeX = twitterRendering.width;
        var textureSizeY = twitterRendering.height;

        var ctx = twitterRendering.getContext("2d");
        var that = this;
        var img = new Image();
        img.onload = function() {
            ctx.save();
            var originalSizeX = 500;
            var originalSizeY = 91;
            var originalRatio = originalSizeY/originalSizeX;
            
            var scale = textureSizeX/originalSizeX;
            var invScale = 1.0/scale;
            var borderOffset = 4.0*invScale;

            ctx.scale(scale, scale);

            var maxWidth = originalSizeX - 2.0*borderOffset;
            var offsetWidthText = 58 + borderOffset;
            var sizeAuthor = 16;
            var offsetAuthor = 2;
            var nextLineAuthor = sizeAuthor + offsetAuthor;
            var sizeText = 18;
            var offsetText = 2;
            var nextLineText = sizeText + offsetText;
            var currentHeight = sizeAuthor + offsetAuthor;
            var sizeDate = 12;
            var textFont = "Arial"; //BPmono
            var authorFont = "Arial";
            var dateFont = "Arial";


            var lines = [];
            lines.push( { 'height' : currentHeight, 'author': tweet.from_user} );
            currentHeight += nextLineAuthor;
            ctx.font = sizeText + "px " + textFont;

            // compute and put text in multiline
            var text = tweet.text;
            var w = ctx.measureText(text); 
            var currentChar = 0;
            var maxWidthForTextInPixels = (maxWidth - offsetWidthText);
            var charSize = w.width/tweet.text.length;
            var lineSizeInChar = maxWidthForTextInPixels/charSize;
            while ( w.width > 0) {
                var diff = w.width - maxWidthForTextInPixels;
                if (diff > 0 ) {
                    var nbChars = lineSizeInChar;
                    if (nbChars > text.length)
                        nbChars = text.length;
                    subText = text.slice(0, nbChars);
                    text = text.slice(nbChars);
                    lines.push({ 'height':currentHeight, 'text' : subText});
                    //ctx.fillText(subText, offsetWidthText, currentHeight);
                    currentHeight += nextLineText;
                    w = ctx.measureText(text);
                } else {
                    lines.push({ 'height':currentHeight, 'text' : text});
                    //ctx.fillText(text, offsetWidthText, currentHeight);
                    break;
                }
            }

            currentHeight += nextLineText;
            ctx.font = sizeDate + "px " + dateFont;
            lines.push({ 'height':currentHeight, 'date' : tweet.created_at});
            currentHeight += sizeDate;
            osg.log("height " + currentHeight);
            ctx.restore();


            ctx.save();
            ctx.clearRect (0, 0, textureSizeX, textureSizeY);
            ctx.scale(scale, scale);
            ctx.drawImage(img, borderOffset, 3 + borderOffset);
            ctx.strokeStyle = "rgba(255, 255, 255, 1.0)";

            // draw it
            ctx.font = sizeAuthor + "px " + authorFont;
            ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
            ctx.fillText(lines[0].author, offsetWidthText, lines[0].height);

            ctx.font = sizeText + "px " + textFont;
            for (var t = 1, l = lines.length-1; t < l; t++) {
                ctx.fillText(lines[t].text, offsetWidthText, lines[t].height);
            }
            
            ctx.font = sizeDate + "px " + dateFont;
            ctx.fillText(lines[lines.length-1].date, offsetWidthText, lines[lines.length-1].height);
            ctx.restore();

            ctx.globalCompositeOperation = "destination-atop";
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect (0, 0, textureSizeX, textureSizeY);
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = "rgba(255, 169, 45, 1.0)";
            ctx.strokeRect (0, 0, textureSizeX, currentHeight);

            if (true) {
                var t = osg.Texture.createFromCanvas(document.getElementById("TwitterRendering"));
            } else {
                var t = new osg.Texture();
                t.setMinFilter(gl.NEAREST);
                t.setMagFilter(gl.NEAREST);
                t.setFromCanvas(document.getElementById("TwitterRendering"));
            }

            t.tweet = tweet;
            that.createQuadFromTexture(t, 500, currentHeight, 512, 128);

        };
        img.src = tweet.profile_image_url;
    },

    createQuadFromTexture: function(t, sizex, sizey, texturex, texturey) {
        var canvas = document.getElementById("3DView");
        var w = sizex;
        var h = sizey;
        //h = ratio;
        //osg.log("sizey " + sizey);
        var q;
        //default camera
        v = sizey/texturey;
        q = osg.createTexuredQuad(-w/2.0, -h/2.0, 0,
                                  w, 0, 0,
                                  0, h, 0,
                                  0, 1.0-v,
                                  1.0, 1.0);

        var stateset = createTextRenderingProgram();
        stateset.addUniform(osg.Uniform.createInt1(0,"TexUnit0"));
        stateset.setTextureAttributeAndMode(0, t);
        q.setStateSet(stateset);
        
        var mt = new osg.MatrixTransform();
        mt.addChild(q);

        mt.startPosition = [this.canvasSize[0]*0.5, this.canvasSize[1]*0.5, -1];
        mt.endPosition = mt.startPosition;
        mt.height = h;
        this.addTweet(mt);
        mt.setUpdateCallback(this.itemCallback);
        this.geometry.push(q);
    },

    poll: function() {
        var that = this;
        if (FakeTweet) {
            for (var i = 0, l = 30; i < l; i++) {
                //that.displayTweetToCanvas(generateFakeTweet());
                this.tweetToProcess.push(generateFakeTweet());
            }
        } else {
            jQuery.getJSON(this.url, function(data) {
                osg.log(data);
                if (data.results.length > 3)
                    data.results.length = 3;
                for (var i = 0, l = data.results.length; i < l; i++) {
                    that.displayTweetToCanvas(data.results[i]);
                }
            });
        }
    }
};
