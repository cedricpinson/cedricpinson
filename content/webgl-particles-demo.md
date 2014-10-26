Title: WebGL-Particles-Demo
Date: 2010-08-17 01:24
Author: Cedric Pinson
Category: blog
Slug: webgl-particles-demo

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
function start() { jQuery("#loading").hide(); jQuery("#OpenSceneGraph-WebGL-demo-particles").show(); webGLStart(); }<br />
addJavaScript("http://plopbyte.net/wp-uploads/2010/demo-particles-osg-js/demo_particles.js", start);<br />
</script>
</p>
<p>
<center>
Click to perturb particles
</center>
  
<center>
![](http://plopbyte.net/wp-uploads/2010/demo-particles-osg-js/ajax-loader.gif)
</center>
  
<canvas id="OpenSceneGraph-WebGL-demo-particles" style="border: none; display:hide" width="900" height="768">
</canvas>
</p>
<div id="fps">

</div>
