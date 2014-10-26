Title: webgl-gallery-models
Date: 2010-11-09 18:50
Author: Cedric Pinson
Category: blog
Slug: webgl-gallery-models

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
function start() { jQuery("#loading").hide(); jQuery("#3DView").show(); webGLStart(); }<br />
addJavaScript("http://portfolio.plopbyte.net/wp-uploads/2010/webgl-gallery-models/gallery.js", start);<br />
</script>
</p>
<p>
<center>
![](http://portfolio.plopbyte.net/wp-uploads/2010/webgl-gallery-models/loadinfo.net.gif)
</center>
  
<canvas id="3DView" style="border: none; display:hide" width="900" height="700">
</canvas>
</p>
<div id="fps">

</div>
