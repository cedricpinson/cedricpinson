Title: stats.js
Date: 2011-02-15 00:11
Author: Cedric Pinson
Category: blog
Slug: stats-js

I have written this afternoon a little class to manage graph, for
[osg.js](http://osgjs.org) I will need to graph the update/cull/draw
traversal and I guess more others things, so I needed a stats
functionnality a bit like in
[Three.js](https://github.com/mrdoob/three.js/) demo. I have first get
his stats.js, but it did not fit my use and I wanted to try without
redrawing the full graph. I want to get the previous result of the
canvas then shift it by a delta (new\_time - previous\_time) and draw
only one line for the delta elapsed. I have not check if it produces
better performance but it was cool to code it. You can see the result
[here](http://plopbyte.com/stats.js/) and the source code is on
[bitbucket](https://bitbucket.org/cedricpinson/stats.js/overview) . The
only problem I could see is that the line are not as clean as it could
because they are not connect from a full path, and the consequence is
that antialias can't work on the full path.

[![](http://plopbyte.com/wp-uploads/2011/02/Screenshot-12.jpg "Screenshot-12")](http://plopbyte.com/stats.js/)

