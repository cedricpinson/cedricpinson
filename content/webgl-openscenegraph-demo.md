Title: WebGL-OpenSceneGraph-demo
Date: 2010-07-14 15:17
Author: Cedric Pinson
Category: blog
Slug: webgl-openscenegraph-demo

<p>
<script type="text/javascript"><br />
function addJavaScript( js, onload )<br />
{<br />
var head, ref; head = document.getElementsByTagName('head')[0];<br />
if (!head) { return; }<br />
script = document.createElement('script');<br />
script.type = 'text/javascript';<br />
script.src = js;<br />
script.addEventListener( "load", onload, false );<br />
head.appendChild(script);<br />
}<br />
function start() { jQuery("#loading").hide(); jQuery("#OpenSceneGraph-WebGL-demo-room").show(); webGLStart(); }<br />
addJavaScript("http://portfolio.plopbyte.net/wp-uploads/2010/demo-room-osg-js/demo_room.js", start);<br />
</script>
  
<center>
![](http://portfolio.plopbyte.net/wp-uploads/2010/demo-room-osg-js/ajax-loader.gif)
</center>
  
<canvas id="OpenSceneGraph-WebGL-demo-room" style="border: none; display:hide;" width="900" height="700">
</canvas>
</p>
<div id="fps">

</div>
