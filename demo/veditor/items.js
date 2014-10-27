/** -*- compile-command: "jslint-cli Items.js" -*-
 * Authors:
 *  Cedric Pinson <cedric.pinson@plopbyte.net>
 *
 */
var DATA_URL;

var debug = {
    log: function(str) {
        if (window.console !== undefined) {
            window.console.log(str);
        } else {
            jQuery("#debug").append("<li> + " + str + "</li>");
        }
    }
};

var FindItemAnchor = function(search) {
    osg.NodeVisitor.call(this);
    this.search = search
    this.result = [];
}
FindItemAnchor.prototype = osg.objectInehrit(osg.NodeVisitor.prototype, {
    apply: function( node ) {
        debug.log(node);
        if (node.getName !== undefined) {
            var name = node.getName();
            if (name !== undefined && name === this.search) {
                this.result.push(node);
            }
        }
        this.traverse(node);
    }
});

var getMultiJSON = function(map, callback) {
    var count = 0;
    var result = [];
    var nbUrls = 0;
    jQuery.each(map, function(url, cb) {
        nbUrls++;
    });

    jQuery.each(map, function(url, cb) {
        debug.log("try to get json file " + url );
        jQuery.getJSON(url, function(data) {
            if (cb !== undefined) {
                result.push(cb(data));
            } else {
                result.push(data);
            }
            count++;
            if (count === nbUrls) {
                if (callback)
                    callback(result);
            }
        });
    }
               );
};


var getRootURL = function() {
    var u = DATA_URL;
    return u;
};

var getChassisPathURL = function(base) {
    return base + "chassis/";
};
var getItemPathURL = function(base) {
    return base + "items/";
};

var getChassisObjectURL = function(base, element) {
    return getChassisPathURL(base) + element +".json";
};
var getChassisURL = function(base, element) {
    return getChassisPathURL(base) + element +"_meta.json";
};

var getItemURL = function(base, element) {
    return getItemPathURL(base) + element + "_meta.json";
};
var getItemObjectURL = function(base, element) {
    return getItemPathURL(base) + element + ".json";
};

var Chassis;

function ParentDisplayCallback() {}

ParentDisplayCallback.prototype = {
    update: function(node, nv) {
        var rem = [];
        for (var i = 0, l = node.children.length; i < l; i++) {
            var child = node.children[i];
            child.accept(nv);
            if (child.removeNow === true) {
                rem.push(child);
            }
            child.removeNow = false;
        }
        for (var i = 0, l = rem.length; i < l; i++) {
            node.removeChild(rem[i]);
        }
    }
};

var GlobalParentDisplayCallback = new ParentDisplayCallback();

function DisplayCallback() {
}

DisplayCallback.prototype = {
    
    update: function(node, nv) {
        var ratio = 0;
        var currentTime = nv.getFrameStamp().getSimulationTime();
        if (node.startTime === undefined) {
            node.startTime = currentTime;
            node.removeNow = false;
            if (node.duration === undefined) {
                node.duration = 5.0;
            }
        }
        if (node.startItem === true) {
            node.startTime = currentTime;
            node.startItem = false;
            node.removeNow = false;
        }

        if (node.removeItem === true) {
            node.removing = true;
            node.removeItem = false;
            node.endTime = currentTime;
            node.removeNow = false;
        }
        
        var dt;
        var scale;

        if (node.removing === true) {
            dt = currentTime - node.endTime;

            if (dt > 1.0) {
                node.removing = false;
                node.removeNow = true;
                return;
            } else {
                scale = osgAnimation.EaseOutQuart(dt);
            }

        } else {

            dt = currentTime - node.startTime;
            //dt /= 2.0;
            if (dt > 1.0) {
                scale = 0.0;
            } else {
                scale = 1.0 - osgAnimation.EaseOutQuart(dt);
            }
        }

        var v = osg.Vec3.mult(node.vectorMotion, scale * 10.0);
        node.setMatrix(osg.Matrix.makeTranslate(v[0], v[1], v[2]));

        node.traverse(nv);
    }
};

var ItemDisplayCallback;
function getOrCreateItemDisplayCallback() {
    if (ItemDisplayCallback === undefined) {
        ItemDisplayCallback = new DisplayCallback();
    }
    return ItemDisplayCallback;
}




osgViewer.Viewer.prototype = osg.objectInehrit(osgViewer.Viewer.prototype, {
    initEditor: function() {
        Chassis = new ChassisList(getRootURL(), "chassis/Chassis_meta.json");
        var r = new osg.Node();
        this.setScene(r);
        r.light = new osg.Light();
        var dir = osg.Vec3.normalize([1,-1,1.5]);
        r.light.direction = dir;

        Chassis.root = r;
        Chassis.attachChassisTransform();
        Chassis.display();
    }
});


var ShaderCar = undefined;
var ShaderCarUniforms = [];
function setCarShader(stateset)
{
    if (ShaderCar === undefined) {

        var vertexshader = [
            "",
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",
            "attribute vec3 Vertex;",
            "attribute vec3 Normal;",
            "uniform mat4 ModelViewMatrix;",
            "uniform mat4 ProjectionMatrix;",
            "uniform mat4 NormalMatrix;",
            "uniform mat4 InvModelViewMatrix;",
            "attribute vec2 TexCoord0;",
            "varying vec2 FragTexCoord0;",
            "attribute vec2 TexCoord1;",
            "varying vec2 FragTexCoord1;",
            "attribute vec2 TexCoord2;",
            "",
            "varying vec3 EyeVector;",
            "varying vec3 NormalComputed;",
            "varying vec3 Light0_directionInEyeSpace;",
            "",
            "",
            "uniform bool Light0_enabled;",
            "uniform vec4 Light0_ambient;",
            "uniform vec4 Light0_diffuse;",
            "uniform vec4 Light0_specular;",
            "uniform vec3 Light0_direction;",
            "uniform float Light0_constantAttenuation;",
            "uniform float Light0_linearAttenuation;",
            "uniform float Light0_quadraticAttenuation;",
            "uniform mat4 Light0_matrix;",
            "",
            "uniform vec4 MaterialAmbient;",
            "uniform vec4 MaterialDiffuse;",
            "uniform vec4 MaterialSpecular;",
            "uniform vec4 MaterialEmission;",
            "uniform float MaterialShininess;",
            "vec4 Ambient;",
            "vec4 Diffuse;",
            "vec4 Specular;",
            "",
            "vec4 ftransform() {",
            "return ProjectionMatrix * ModelViewMatrix * vec4(Vertex, 1.0);",
            "}",
            "vec3 computeNormal() {",
            "   return vec3(NormalMatrix * vec4(Normal, 0.0));",
            "}",
            "",
            "vec3 computeEyeDirection() {",
            "   return vec3(ModelViewMatrix * vec4(Vertex,1.0));",
            "}",
            "vec3 computeLightDirection() {",
            "   return vec3(-1,-1,1);",
            "}",
            "",
            "",
            "void main(void) {",
            "gl_Position = ftransform();",
            "FragTexCoord0 = TexCoord0;",
            "FragTexCoord1 = TexCoord1;",
            "",
            "EyeVector = normalize(computeEyeDirection());",
            "NormalComputed = normalize(computeNormal());",
            "Light0_directionInEyeSpace = normalize(vec3(Light0_matrix*vec4(Light0_direction,0.0)));",
            "",
            "}",
            ""
        ].join('\n');

        var fragmentshader = [
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",
            "vec4 fragColor;",
            "varying vec2 FragTexCoord0;",
            "uniform sampler2D Texture0;",
            "vec4 texColor0;",
            "varying vec2 FragTexCoord1;",
            "uniform sampler2D Texture1;",
            "vec4 texColor1;",
            "vec2 FragTexCoord2;",
            "uniform sampler2D Texture2;",
            "vec4 texColor2;",
            "uniform mat4 ModelViewMatrix;",
            "varying vec3 Light0_directionInEyeSpace;",
            "varying vec3 EyeVector;",
            "varying vec3 NormalComputed;",
            "",
            "void main(void) {",
            "vec3 Light0_directionNormalized = normalize(Light0_directionInEyeSpace);",
            "vec3 nn = normalize(NormalComputed);",
            "float Light0_NdotL = max(dot(nn , Light0_directionNormalized), 0.0);",
            "float RimLight = 1.0 - max(dot(nn , vec3(0.0, 0.0, 1.0)), 0.0);",
            "RimLight = RimLight*RimLight*RimLight;",
            "vec3 r = normalize(reflect(normalize(EyeVector), nn));",
            "float m = 2.0 * sqrt( r.x*r.x + r.y*r.y + (r.z+1.0)*(r.z+1.0) );",
            "vec2 uv;",
            "uv[0] = r.x/m + 0.5;",
            "uv[1] = r.y/m + 0.5;",
            "fragColor = vec4(1.0, 1.0, 1.0, 1.0);",
            "texColor0 = texture2D( Texture0, FragTexCoord0.xy );",
            "texColor1 = texture2D( Texture1, FragTexCoord1.xy );",
            "texColor2 = texture2D( Texture2, uv.xy );",
            "//float ambient = clamp( 0.2 + Light0_NdotL, 0.0, 1.0 );",
            "//fragColor = (texColor0 * ambient);",
            "//vec4 reflect = ambient * (texColor1 * texColor2);",
            "//fragColor += reflect * 0.4;",

            "//Light0_NdotL = Light0_NdotL;",
            "float ambient = clamp( 0.29 + Light0_NdotL, 0.0, 1.0 );",
            "fragColor = (texColor0 * ambient);",
            "float value = (texColor1[0] + texColor1[1] + texColor1[2]) /3.0;",
            "vec4 reflect = texColor2 * value;",
            "fragColor += reflect;",
            "//fragColor = fragColor * ambient;",
            "fragColor += vec4(RimLight, RimLight, RimLight,0.0) * 0.5;",
            "fragColor[3] = 1.0;",
            "gl_FragColor = fragColor;",
            "}",
            ""
        ].join('\n');

        ShaderCar = osg.Program.create(
            osg.Shader.create(gl.VERTEX_SHADER, vertexshader),
            osg.Shader.create(gl.FRAGMENT_SHADER, fragmentshader));

        ShaderCar.trackAttributes = { 'attributeKeys': ["Light0"],
                                      'textureAttributeKeys': [ ["Texture"], ["Texture"], ["Texture"] ] };

//        ShaderCarUniforms.push(osg.Uniform.createInt1(0,"Texture0"));
//        ShaderCarUniforms.push(osg.Uniform.createInt1(1,"Texture1"));
//        ShaderCarUniforms.push(osg.Uniform.createInt1(2,"Texture2"));
//        ShaderCarUniforms.push(osg.Uniform.createFloat3([1,-1,1],"Light0_direction"));
    }

    stateset.setAttributeAndMode(ShaderCar);
//    for (var i = 0, l = ShaderCarUniforms.length; i < l; i++) {
//        stateset.addUniform(ShaderCarUniforms[i]);
//    }
}

function setShader(node) {
    if (node.stateset !== undefined) {
        debug.log("set shader");
        setCarShader(node.stateset);
    }
    if (node.children) {
        for (var child = 0, cl = node.children.length; child < cl; child++) {
            setShader(node.children[child]);
        }
    }
}

// fix texture url
function fixTextureUrl(url, node)
{
    if (node.stateset !== undefined) {
        if (node.stateset.textures !== undefined) {
            var textures = node.stateset.textures;
            for (var t = 0, l = textures.length; t < l; t++) {
                if (textures[t] === undefined) {
                    continue;
                }
                if (textures[t].file !== undefined) {
                    var newfile = textures[t].file;
                    
                    if (url.indexOf("items/") !== -1 && newfile.indexOf("items/") === -1) {
                        newfile = getItemPathURL(getRootURL()) + newfile;
                    } else if (url.indexOf("chassis/") !== -1 && newfile.indexOf("chassis/") === -1) {
                        newfile = getChassisPathURL(getRootURL()) + newfile;
                    }
                    osg.log("fix " + textures[t].file + " to " + newfile);
                    textures[t].file = newfile;
                }
            }
        }
    }
    if (node.children) {
        for (var child = 0, cl = node.children.length; child < cl; child++) {
            fixTextureUrl(url, node.children[child]);
        }
    }
}

function ItemsGroup(base, groupList) {
    this.baseURL = base;
    this.groupList = groupList;
    this.items = [];
}
ItemsGroup.prototype = {
    itemGroupLoaded: function(map) {
        var that = this;
        jQuery.each(map, function(group, array) {
            jQuery.each(array, function(index, element) {
                that.items.push(element);
            });
        });
        debug.log(that.items);
    },

    load: function (callback) {

        var that = this;
        var syncMultiJSON = function(map, callback) {
            var count = 0;
            var result = {};
            var nbUrls = 0;
            jQuery.each(map, function(url, cb) {
                nbUrls++;
            });

            jQuery.each(map, function(file, cb) {
                if (debug !== undefined) {
                    debug.log("try to get json " + file );
                }
                var url = getItemURL(that.baseURL, file);
                jQuery.getJSON(url, function(data) {
                    if (cb !== undefined) {
                        result[file] = cb(data);
                    } else {
                        result[file] = data;
                    }
                    count++;
                    if (count === nbUrls) {
                        callback(result);
                    }
                });
            }
                       );
        };

        var map = {};
        jQuery.each(this.groupList, function(index, file) {
            map[file] = undefined;
        });

        syncMultiJSON(map, function (data) {
            that.itemGroupLoaded(data);
            if (callback) {
                callback(that.items);
            }
        });
    }
};

function ChassisList(base, element)
{
    this.baseURL = base;
    this.url = this.baseURL + element;
    this.chassis = undefined;
    this.items = {};
    this.root = undefined;
}

ChassisList.prototype = {
    display: function() {
        var that = this;
        if (this.chassis_meta !== undefined) {
            jQuery("#chassis > li").remove();
            jQuery.each(this.chassis_meta, function(index, element) {
                if (debug !== undefined) {
                    debug.log("Chassis available " + element + " from " + that.url);
                }
                var key = element;
                var key_id = element.replace(".", "_");
                if (element === that.currentChassisSelected) {
                    jQuery("#chassis").append("<li id=\"" + key_id + "\"><b>" + key + "</b></li>");
                } else {
                    jQuery("#chassis").append("<li id=\"" + key_id + "\">" + key + "</li>");
                }
                jQuery("#" + key_id).bind('click', function() {
                    debug.log("loadChassis " + element + " key " + key);
                    that.currentChassisSelected = key;
                    that.loadChassis(element);
                });
            });

            // we want to display the current chassis if set
            if (that.currentChassisSelected !== undefined && 
                this.chassis[that.currentChassisSelected] !== undefined) {
                var slots = this.chassis[that.currentChassisSelected].slots_meta;
                jQuery("#slots > li").remove();
                jQuery.each(slots, function(key, element) {
                    if (debug !== undefined) {
                        debug.log("Slots available " + element + " from " + that.url);
                    }
                    var key_id = key.replace(".", "_");
                    if (key === that.currentSlotSelected) {
                        jQuery("#slots").append("<li id=\"" + key_id + "\"><b>" + key + "</b></li>");
                        
                    } else {
                        jQuery("#slots").append("<li id=\"" + key_id + "\">" + key + "</li>");
                    }
                    jQuery("#" + key_id).bind('click', function() {
                        that.currentSlotSelected = key;
                        that.loadItems(key, element);
                        if (that.chassis[that.currentChassisSelected].slots[key].selected !== undefined) {
                            var selected = that.chassis[that.currentChassisSelected].slots[key].selected;
                            osg.log("restore item " + selected);
                            that.currentItemSelected = selected;
                        } else {
                            that.currentItemSelected = undefined;
                        }

                        var position = [0,10,10];
                        var slot = key;
                        osg.log("slot " + slot);
                        if (slot === "SlotBack") {
                            position = [ 0.4, 3.6, 1 ];
                        } else if (slot === "SlotBackBumper") {
                            position = [ -0.2, 3.6, 0.8 ];
                        } else if (slot === "SlotBackLight") {
                            position = [ 0.2, 3.6, 0.6 ];
                        } else if (slot === "SlotFrontHood") {
                            position = [ 1.0, -2.9, 1.1 ];
                        } else if (slot === "SlotIsoFix") {
                            position = [ 2.0, -2.9, 1.1 ];
                        } else if ( slot === "SlotTop" ) {
                            position = [ -0.930, -0.9, 1.84 ];
                        } else if (slot === "SlotFrontGlass") {
                            position = [ -1., -1.5, 1.193 ];
                        } else if (slot === "SlotFrontGrille") {
                            position = [ -0.4, -3.2, 0.4 ];
                        } else if (slot === "SlotFrontBumper") {
                            position = [ 0.4, -3.2, 0.4 ];
                        } else if (slot === "SlotFrontLight" ) {
                            position = [ -0.6, -3.2, 0.3 ];
                        }

                        Viewer.getManipulator().setCameraMotion(position, 3.3);
                        that.display();
                    });
                });

                // clear items if current select slots is not from this chassis
                if (slots[that.currentSlotSelected] === undefined) {
                    jQuery("#items > li").remove();
                }
            }

            // we want to display the current chassis if set
            if (that.currentChassisSelected !== undefined && 
                this.chassis[that.currentChassisSelected] !== undefined && 
                this.chassis[that.currentChassisSelected].slots_meta !== undefined &&
                this.currentSlotSelected !== undefined &&
                this.chassis[that.currentChassisSelected].slots[this.currentSlotSelected] !== undefined && 
                this.chassis[that.currentChassisSelected].slots[this.currentSlotSelected].items_meta !== undefined) {

                var currentSlot = this.chassis[that.currentChassisSelected].slots[this.currentSlotSelected];
                var items = currentSlot.items_meta;
                jQuery("#items > li").remove();
                var currentItemKeyID;

                var getCurrentSlotSelected = function() {
                    var finder = new FindItemAnchor(that.currentSlotSelected);
                    finder.apply(that.osgChassisNode);
                    debug.log("found  " + finder.result.length + " nodes");
                    var slotToAttachItem;
                    if (finder.result.length > 0) {
                        slotToAttachItem = finder.result[0];
                        if (finder.result.length > 1) {
                            osg.log("Support only one slot type per chassis, will use the first");
                        }
                        //slotToAttachItem.removeChildren();
                    }
                    return slotToAttachItem;
                };

                var slotToAttachItem = getCurrentSlotSelected();
                jQuery.each(items, function(key, element) {
                    if (debug !== undefined) {
                        debug.log("Items available " + element + " from " + that.url);
                    }
                    var key_id = key.replace(".", "_");
                    if (key === that.currentItemSelected) {
                        jQuery("#items").append("<li id=\"" + key_id + "\"><b>" + key + "</b></li>");
                        currentItemKeyID = key_id;
                    } else {
                        jQuery("#items").append("<li id=\"" + key_id + "\">" + key + "</li>");
                    }

                    if (that.currentItemSelected !== undefined) {
                        if (slotToAttachItem.hasChild(that.items[that.currentItemSelected]) === false) {
                            // find transform and setup the mesh
                            slotToAttachItem.addChild(that.items[that.currentItemSelected]);
                            that.items[that.currentItemSelected].start();
                        }
                    }
                    //
                    jQuery("#" + key_id).bind('click', function() {
                        if (that.currentItemSelected === key) {
                            return;
                        }
                        // remove previous if any
                        if (currentSlot.selected !== undefined) {
                            that.items[currentSlot.selected].parent = slotToAttachItem;
                            slotToAttachItem.setUpdateCallback(GlobalParentDisplayCallback);
                            that.items[currentSlot.selected].remove();
                        }
                        that.currentItemSelected = key;
                        currentSlot.selected = key;
                        that.loadItemObject(key, that.currentSlotSelected);
                    });
                });

                if (currentItemKeyID !== undefined) {
                    var id = "remove_" + currentItemKeyID;
                    jQuery("#items").append("<li id=\"" + id + "\">" + "clear" + "</li>");
                    jQuery("#" + id).bind('click', function() {
                        that.items[that.currentItemSelected].parent = slotToAttachItem;
                        slotToAttachItem.setUpdateCallback(GlobalParentDisplayCallback);
                        that.items[that.currentItemSelected].remove();
                        that.currentItemSelected = undefined;
                        currentSlot.selected = undefined;
                        that.display();
                    });
                }
            }

        } else {
            this.load();
        }
    },

    attachChassisTransform: function() {
        this.osgChassisNode = new osg.MatrixTransform();
        this.root.addChild(this.osgChassisNode);
    },

    loadItems: function(slotname, elements) {
        if (this.chassis[this.currentChassisSelected].slots[slotname] !== undefined) {
            return;
        }

        this.chassis[this.currentChassisSelected].slots[slotname] = {};
        var slots = this.chassis[this.currentChassisSelected].slots[slotname];
        var ig = new ItemsGroup(this.baseURL, elements );
        var that = this;
        ig.load(function(itemGroup) {
            var items = {};
            jQuery.each(itemGroup, function (index, element) {
                items[element] = {};
            });

            slots.items_meta = items;
            that.display();
        });
    },

    loadItemObject: function(key, slot) {
        if (this.items[key] !== undefined) {
            this.display();
            return;
        }
        var url = getItemObjectURL(this.baseURL, key);
        var that = this;
        jQuery.getJSON(url, function (data) {
            fixTextureUrl(url, data);
            var obj = osg.ParseSceneGraph(data);
            var mt = new osg.MatrixTransform();
            that.items[key] = mt;
            mt.addChild(obj);

            var direction = [ 0, 0, 1 ];
            if (slot === "SlotBack" || slot === "SlotFrontHood" || slot === "SlotIsoFix" || slot === "SlotTop" ) {
                osg.log("item key for slot " + slot);
                direction = [ 0, 0, 1 ];
            } else if (slot === "SlotBackBumper" || slot === "SlotBackLight") {
                direction = [ 0, 1, 0 ];
            } else if (slot === "SlotFrontGlass" || slot === "SlotFrontGrille" || slot === "SlotFrontLight" ) {
                direction = [ 0, -1, 0 ];
            }
            mt.vectorMotion = direction;
            mt.originalMatrix = osg.Matrix.makeIdentity();
            mt.setUpdateCallback(getOrCreateItemDisplayCallback());
            mt.remove = function () {
                this.removeItem = true;
            };
            mt.start = function () {
                this.startItem = true;
            };
            setShader(obj);

            if (debug.log !== undefined) {
                debug.log("loaded item " + url);
            }
            that.display();
        });
    },

    loadChassis: function(name) {
        //this.currentChassis = name;
        if (this.chassis[name] !== undefined) {
            this.osgChassisNode.removeChildren();
            this.osgChassisNode.addChild(this.chassis[name].geometry);
            this.display();
            return;
        }
        this.chassis[name] = {};

        var objURL = getChassisObjectURL(this.baseURL, name);
        var slotsChassis = getChassisURL(this.baseURL, name);
        var that = this;
        var map = {};
        map[objURL] = function (data) {
            fixTextureUrl(objURL, data);
            that.chassis[name].geometry = osg.ParseSceneGraph(data);
            setShader(that.chassis[name].geometry);
            that.osgChassisNode.removeChildren();
            that.osgChassisNode.addChild(that.chassis[name].geometry);
            debug.log("add chassis " + name + " to graph " + that.chassis[name].geometry);
            
            return that.chassis[name].geometry;
        };

        map[slotsChassis] = function (data) {
            that.chassis[name].slots_meta = data;
            that.chassis[name].slots = {};
            return data;
        };

        getMultiJSON(map , function(data) {
            that.display();
        });
    },

    load: function() {
        var that = this;
        jQuery.getJSON(this.url, function (data) {
            that.chassis_meta = data;
            that.chassis = {};
            jQuery.each(data, function(index, element) {
                that.chassis[element] = undefined;
            });

            that.display();
        });
        
        var that = this;
        jQuery(document).keypress(function() {
            osg.log(that.osgChassisNode);
        });
    },
};
