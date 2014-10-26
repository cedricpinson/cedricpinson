Title: webgl-mobile-perf
Date: 2010-10-27 15:29
Author: Cedric Pinson
Category: blog
Slug: webgl-mobile-perf

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
addJavaScript("http://portfolio.plopbyte.net/wp-uploads/2010/webgl-mobile-perf/test_perf_512.js", start);<br />
</script>
</p>
<p>
<center>
![](http://portfolio.plopbyte.net/wp-uploads/2010/webgl-mobile-perf/ajax-loader.gif)
</center>
  
<canvas id="3DView" style="border: none; display:hide" width="800" height="600">
</canvas>
</p>
<div id="fps">

</div>
