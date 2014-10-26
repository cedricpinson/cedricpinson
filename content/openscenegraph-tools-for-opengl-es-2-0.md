Title: OpenSceneGraph tools for OpenGL es 2.0
Date: 2011-04-14 11:37
Author: Cedric Pinson
Category: blog
Slug: openscenegraph-tools-for-opengl-es-2-0

I have done plugins and pseudo loader for OpenSceneGraph to work with
OpenGL es 2.0 spec and webgl. The first thing you need when working with
big mesh is to split them in bunch of 65536 vertexes because opengl es
2.0 speccification limit the size of indexes to 16 bits. In order to
manage this case, I have done a [pseudo loader called
split](http://hg.plopbyte.net/osg-trunk/file/1af36d5c6fff/src/osgPlugins/split),
so you can use it like that

` osgconv hugemodel.osg.split hugemodel_splited.osg # careful about the MERGE_GEOMETRY flag in OSG_OPTIMIZATION`  
I have also done a resolve pseudo loading to re affect location of
texture filename. The problem is that when I convert models to
[osgjs](http://osgjs.org), osg is able to find the file because he can
find in a path list, but once the image loaded it does not update the
file location ( and it makes sense ) . It's not suitable for
[showwebgl](http://showwebgl.com) that converts models on server side
and need to reassign the image path before converting it to osgjs, this
plugin loader is called
[resolve](http://hg.plopbyte.net/osg-trunk/file/1af36d5c6fff/src/osgPlugins/resolve)
. And the last plugin is osgjs itself that is able to convert osg native
format to [osgjs
format](http://hg.plopbyte.net/osg-trunk/file/1af36d5c6fff/src/osgPlugins/osgjs).

