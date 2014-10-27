/** -*- compile-command: "jslint-cli test.js" -*-
 * Authors:
 *  Cedric Pinson <cedric.pinson@plopbyte.net>
 *
 */
function near(a, b, threshold)
{
    if (threshold === undefined) {
        threshold = 1e-5;
    }

    if (jQuery.isArray(a)) {
        for (var i = 0; i < a.length; ++i) {
            var number = typeof a[i] === "number" && typeof b[i] === "number";
            if (Math.abs(a[i]-b[i]) > threshold || number === false) {
                ok(false, QUnit.jsDump.parse(a) + " expected " + QUnit.jsDump.parse(b));
                return;
            }
        }
    } else {
        if (Math.abs(a-b) > threshold) {
            ok(false, a + " != " + b);
            return;
        }
    }
    ok(true, "okay: " + QUnit.jsDump.parse(a));
}


ParseSceneGraph = function(data) {
    if (console !== undefined) {
        console.log("ParseSceneGraph mockup");
    }
    return "ParseSceneGraph mockup";
};

var EditorBaseURL = "http://localhost/vehicleeditor/build-debug/data/";

test("TestChassis_load", function() {

         var chassis = new ChassisList(EditorBaseURL, "chassis/Chassis_meta.json");
         chassis.load();

         chassis.listChassis = function(loaded) {
             console.log(loaded);
             ChassisList.prototype.listChassis.call(this, loaded);
             start();
             ok(chassis.chassis !== undefined, "chassis !== undefined");
             ok(chassis.chassis_meta !== undefined, "chassis_meta !== undefined");
             console.log(chassis.chassis);
         };
         stop();
});


test("TestChassis_loadChassis", function() {

    var chassis = new ChassisList(EditorBaseURL, "chassis/Chassis_meta.json");
    chassis.load();
    var chassisToLoad = "ChassisExtended";
    
    chassis.listChassis = function(loaded) {
        ChassisList.prototype.listChassis.call(this, loaded);
        chassis.loadChassis(chassisToLoad);
    };
    chassis.userCallbackChassisGeometryLoaded = function(arg) {
    };

    chassis.userCallbackChassisLoaded = function(loaded) {
        start();
        ok( chassis.chassis[chassisToLoad].geometry !== undefined, "load geometry");
        ok( chassis.chassis[chassisToLoad].meta_slots !== undefined, "load slots_meta");
    };
    stop();
});



test("TestItemsGroup_load", function() {
    var itemsGroup = [
        "ItemWheel18", 
        "ItemWheelSquare" ];

    var items = new ItemsGroup(EditorBaseURL, itemsGroup);
    items.load();

    items.itemGroupLoaded = function(loaded) {
        ItemsGroup.prototype.itemGroupLoaded.call(this, loaded);
        start();
        ok( this.items.length > 0, "items loaded " + this.items.length);
    };

    stop();
});
