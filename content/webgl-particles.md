Title: WebGL Particles
Date: 2010-08-17 01:24
Author: Cedric Pinson
Category: blog
Slug: webgl-particles

I have played with render to texture to generate particles with physics,
the idea is to compute particles position on the gpu and use it as input
to render them. For this I have use the firefox logo in 512x512 so we
have 262144 particles animated even if somes are invisibles. You can
find some useful information from this articles
<http://directtovideo.wordpress.com/2009/10/06/a-thoroughly-modern-particle-system/>
Ideally It would be great to have render to texture that support
floating point for webGL, but without that I did a 16 bits precision
with two textures ( high bits and low bits). It's a bit boring, in fact
It breaks me to try more effects, I would really like to have render to
texture with floating point support.

To get a WebGL Implementation have look to Khronos instructions
<http://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation>

You need a browser able to run webGL to try the [realtime version](demo/webgl-particles-demo/)
or use youtube

[![](media/2010/08/screen2.jpg "Screenshot-2")](http://www.youtube.com/watch?v=ShrUOL1V-xc)

[![](media/2010/08/screen0.jpg "Screenshot-0")](http://www.youtube.com/watch?v=ShrUOL1V-xc)
