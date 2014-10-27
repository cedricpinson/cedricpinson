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

var FakeTweet = false;
var CacheLocation = {};

function getLatLongFromLocation(itemData, callback)
{
    if (callback === undefined) {
        callback = function (data0 ) {
            osg.log("location for " + data0.location);
            osg.log(data0);
        };
    }
    var str = itemData.location;
    osg.log("place to find " + str);
    if (CacheLocation[str] === undefined) {
        var url = "http://ws.geonames.org/searchJSON?q=" + str +"&maxRows=10&callback=?";
        osg.log("url " + url);
        jQuery.getJSON(url, function(data) {
            if (data.totalResultsCount !== undefined && data.totalResultsCount > 1) {
                var item = data.geonames[0];
                osg.log(item);
                CacheLocation[str] = { 'lat': item.lat, 'lng': item.lng};
            } else {
                CacheLocation[str] = {'lat' : 0, 'lng': 0};
            }
            CacheLocation[str].location = str;
            callback(CacheLocation[str], itemData.item);
        });
    } else {
        callback(CacheLocation[str], itemData.item);
    }
}


function delay(when, data, cb)
{
    window.setTimeout( function() {
        getLatLongFromLocation(data, cb);
    }, 1000 * (when));
}


function getTrends(callback)
{
    var url = "http://api.twitter.com/1/trends/current.json&callback=?";
    jQuery.getJSON(url, function(data) {
        if (data.trends !== undefined) {
            osg.log(data);
            for (var key in data.trends) {
                var trends = data.trends[key];
                for (var i = 0, l = trends.length; i < l; i++) {
                    callback(trends);
                }
            }
        }
    });
}

function getTweets(subject, callback)
{
    var url = 'http://search.twitter.com/search.json?q=' + subject +'&callback=?';
    jQuery.getJSON(url, function(data) {
    });
}


var TweetsBank = []

function getPublicTimeline(callback)
{
    var processFunction = function (data, cb) {
        osg.log("get " + data.length + " tweets");
        for (var i = 0, l = data.length; i < l; i++) {
            var t = data[i];
            osg.log("tweet user \"" + t.user.name + "\" ask location " + t.user.location + " place " + t.place);
            //osg.log(t);
            if (t.user.location !== null && t.user.length !== 0) {
                delay(1+i, {'location' : t.user.location, 'item' : data[i]}, cb);
            }
        }
    };

    if (FakeTweet === true) {
        var data = [
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:19 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579582439424000, 
                "id_str": "13579582439424000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://twitter.com/\" rel=\"nofollow\">Twitter for iPhone</a>", 
                "text": "\u30ac\u30fc\u30d7\u30ec\u306e\u30a4\u30eb\u30df\u30cd\u30fc\u30b7\u30e7\u30f3\u3063\u3066\u7d50\u69cb\u60aa\u304f\u306a\u3044\u3067\u3059\u306d\u3002", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Mon Jun 28 09:44:20 +0000 2010", 
                    "description": "\u6075\u6bd4\u5bff\u3067\u51fa\u7248\u306e\u4ed5\u4e8b\u3057\u3066\u307e\u3059\u3002", 
                    "favourites_count": 0, 
                    "follow_request_sent": null, 
                    "followers_count": 13, 
                    "following": null, 
                    "friends_count": 17, 
                    "geo_enabled": false, 
                    "id": 160494257, 
                    "id_str": "160494257", 
                    "is_translator": false, 
                    "lang": "ja", 
                    "listed_count": 1, 
                    "location": "\u6075\u6bd4\u5bff", 
                    "name": "\u30e2\u30b3\u30e2\u30b3", 
                    "notifications": null, 
                    "profile_background_color": "131516", 
                    "profile_background_image_url": "http://s.twimg.com/a/1291064993/images/themes/theme14/bg.gif", 
                    "profile_background_tile": true, 
                    "profile_image_url": "http://s.twimg.com/a/1291064993/images/default_profile_0_normal.png", 
                    "profile_link_color": "009999", 
                    "profile_sidebar_border_color": "eeeeee", 
                    "profile_sidebar_fill_color": "efefef", 
                    "profile_text_color": "333333", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "mokomoko_sama", 
                    "show_all_inline_media": false, 
                    "statuses_count": 284, 
                    "time_zone": "Tokyo", 
                    "url": null, 
                    "utc_offset": 32400, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:18 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579578987520000, 
                "id_str": "13579578987520000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://twittbot.net/\" rel=\"nofollow\">twittbot.net</a>", 
                "text": "\u8b39\u3093\u3067\u7533\u3057\u4e0a\u3052\u308b\u300122\u6642\u3067\u3042\u308b\u3068\u77e5\u308a\u5949\u308c", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Thu Aug 12 20:18:56 +0000 2010", 
                    "description": "\u3046\u307f\u306d\u3053\u306e\u306a\u304f\u9803\u306b\u6563\u3067\u304a\u306a\u3058\u307f\u306e\u30ac\u30fc\u30c9\u30ec\u30fc\u30eb\u3055\u3093\u3053\u3068\u30ac\u30fc\u30c8\u30eb\u30fc\u30c9\u3055\u3093\u975e\u516c\u5f0fbot\u3067\u3059\u3002\u30bb\u30ea\u30d5\u306f\u307e\u3060\u5c11\u306a\u3044\u3067\u3059\u304c\u30e9\u30f3\u30c0\u30e0\u306b\u3064\u3076\u3084\u304d\u307e\u3059\u3002\u203b\u30ea\u30d7\u30e9\u30a4\u8fd4\u305b\u308b\u3088\u3046\u306b\u306a\u308a\u307e\u3057\u305f\u3002\u8a73\u3057\u304f\u306fHP\u306b\u66f8\u3044\u3066\u3042\u308a\u307e\u3059\u3002\u30d5\u30a9\u30ed\u30fc\u306f\u624b\u52d5\u3067\u3059\u306e\u3067\u6642\u9593\u304c\u304b\u304b\u308b\u304b\u3082\u3057\u308c\u307e\u305b\u3093\u3002\u558b\u3063\u3066\u307b\u3057\u3044\u8a00\u8449\u306a\u3069\u306e\u5e0c\u671b\u304c\u3042\u308c\u3070HP\u304bDM\u3067\u3088\u308d\u3057\u304f\u304a\u9858\u3044\u81f4\u3057\u307e\u3059\u3002", 
                    "favourites_count": 0, 
                    "follow_request_sent": null, 
                    "followers_count": 239, 
                    "following": null, 
                    "friends_count": 235, 
                    "geo_enabled": false, 
                    "id": 177686054, 
                    "id_str": "177686054", 
                    "is_translator": false, 
                    "lang": "ja", 
                    "listed_count": 54, 
                    "location": "\u30a2\u30a4\u30bc\u30eb\u30cd\u30fb\u30e6\u30f3\u30b0\u30d5\u30e9\u30a6", 
                    "name": "\u30ac\u30fc\u30c9\u30ec\u30fc\u30eb", 
                    "notifications": null, 
                    "profile_background_color": "BADFCD", 
                    "profile_background_image_url": "http://s.twimg.com/a/1290538325/images/themes/theme12/bg.gif", 
                    "profile_background_tile": false, 
                    "profile_image_url": "http://a2.twimg.com/profile_images/1138209630/www.dotup.org1119188_normal.png", 
                    "profile_link_color": "FF0000", 
                    "profile_sidebar_border_color": "F2E195", 
                    "profile_sidebar_fill_color": "FFF7CC", 
                    "profile_text_color": "0C3E53", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "Gertrude_bot", 
                    "show_all_inline_media": false, 
                    "statuses_count": 21005, 
                    "time_zone": "Hawaii", 
                    "url": "http://blog.livedoor.jp/guardrail_umineko/", 
                    "utc_offset": -36000, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:18 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579577829888000, 
                "id_str": "13579577829888000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://twitter.com/\" rel=\"nofollow\">Twitter for iPhone</a>", 
                "text": "\u5a18\u306f\u3044\u3064\u3082\u300c\u30b5\u30af\u30e9\u8272\u300d\u3067\u6d99\u3002\n\u6b4c\u8a5e\u3092\u8074\u3044\u3066\u6d99\u3059\u308b\u5a18\u3092\u898b\u3066\u3002\u79c1\u3082\u3082\u3089\u3044\u6ce3\u304dw", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Sun May 16 15:01:46 +0000 2010", 
                    "description": "\u795e\u6238\u51fa\u8eab\u3002\n\u4e09\u91cd\u3067\u5bb6\u65cf3\u4eba\u3001\u30ed\u30b0\u751f\u6d3b\u4e2d\u3002\n\u50cd\u304d\u306a\u304c\u3089\u30a4\u30ed\u30a4\u30ed\u3068\u52c9\u5f37\u3057\u3066\u3001\u5c06\u6765\u306f\u3061\u3044\u3055\u306a\u5b50\u3069\u3082\u305f\u3061\u5bfe\u8c61\u306b\u3001\u79c1\u3089\u3057\u3044\u9020\u5f62\u6559\u5ba4\u3092\u3059\u308b\u306e\u304c\u5922\u3002\n\u4eca\u306f\u8272\u5f69\u5fc3\u7406\u5b66\u3092\u52c9\u5f37\u3002\n\u30ab\u30a6\u30f3\u30bb\u30ea\u30f3\u30b0\u304c\u3067\u304d\u308b\u3088\u3046\u306b\u306a\u3063\u305f\u306e\u306f\u3044\u3044\u30b1\u30c9\u3001\u30ab\u30a6\u30f3\u30bb\u30ea\u30f3\u30b0\u3067\u79c1\u81ea\u8eab\u304c\u8272\u306b\u9154\u3063\u3066\u3057\u307e\u3046w\u3068\u3044\u3046\u73fe\u5b9f\uff08\u2212\uff3f\u2212\uff1b\uff09\n\u58c1\u3092\u4e57\u308a\u8d8a\u3048\u3001\u9032\u3080\u306e\u3060\u3002", 
                    "favourites_count": 10, 
                    "follow_request_sent": null, 
                    "followers_count": 33, 
                    "following": null, 
                    "friends_count": 28, 
                    "geo_enabled": true, 
                    "id": 144523152, 
                    "id_str": "144523152", 
                    "is_translator": false, 
                    "lang": "ja", 
                    "listed_count": 2, 
                    "location": "\u4e09\u91cd\u770c", 
                    "name": "\u3042\u3063\u3053\u3002", 
                    "notifications": null, 
                    "profile_background_color": "0099B9", 
                    "profile_background_image_url": "http://s.twimg.com/a/1290538325/images/themes/theme4/bg.gif", 
                    "profile_background_tile": false, 
                    "profile_image_url": "http://a1.twimg.com/profile_images/983472833/hanabi721_normal.jpg", 
                    "profile_link_color": "099b8f", 
                    "profile_sidebar_border_color": "5ED4DC", 
                    "profile_sidebar_fill_color": "95E8EC", 
                    "profile_text_color": "3C3940", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "hanabi721", 
                    "show_all_inline_media": false, 
                    "statuses_count": 1514, 
                    "time_zone": "Osaka", 
                    "url": null, 
                    "utc_offset": 32400, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:17 +0000 2010", 
                "entities": {
                    "hashtags": [
                        {
                            "indices": [
                                0, 
                                17
                            ], 
                            "text": "broodjeKnakworst"
                        }
                    ], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579576257024000, 
                "id_str": "13579576257024000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://www.tweetdeck.com\" rel=\"nofollow\">TweetDeck</a>", 
                "text": "#broodjeKnakworst", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Sat Jan 23 19:49:55 +0000 2010", 
                    "description": "", 
                    "favourites_count": 10, 
                    "follow_request_sent": null, 
                    "followers_count": 98, 
                    "following": null, 
                    "friends_count": 110, 
                    "geo_enabled": false, 
                    "id": 107800386, 
                    "id_str": "107800386", 
                    "is_translator": false, 
                    "lang": "en", 
                    "listed_count": 1, 
                    "location": "", 
                    "name": "Hans-Peter K", 
                    "notifications": null, 
                    "profile_background_color": "131516", 
                    "profile_background_image_url": "http://a1.twimg.com/profile_background_images/158088052/twilk_background_4cab729e5263a.jpg", 
                    "profile_background_tile": true, 
                    "profile_image_url": "http://a3.twimg.com/profile_images/1180380003/1031814412_5_cjnT_normal.jpg", 
                    "profile_link_color": "009999", 
                    "profile_sidebar_border_color": "eeeeee", 
                    "profile_sidebar_fill_color": "efefef", 
                    "profile_text_color": "333333", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "hpk_", 
                    "show_all_inline_media": false, 
                    "statuses_count": 14841, 
                    "time_zone": "Amsterdam", 
                    "url": "http://h-p-k.hyves.nl", 
                    "utc_offset": 3600, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:17 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579573744640000, 
                "id_str": "13579573744640000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://z.twipple.jp/\" rel=\"nofollow\">\u3064\u3044\u3063\u3077\u308b/twipple</a>", 
                "text": "\u3088\u3057\u3077\u3059\u307d\u306e\u7d9a\u304d\u3057\u3088", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Sun Apr 18 10:58:10 +0000 2010", 
                    "description": "\u3046\u3072\u3087\uff57\uff57\uff57\uff57\uff57\u30d5\u30a9\u30ed\u30fc\u3057\u3066\u3082\uff57\uff57\u5168\u304f\uff57\uff57\uff57\uff57\u9762\u767d\u304f\u306a\u3044\u3088\u304a\u304a\u304a\u304a\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\u30b3\u30df\u30e5\u529b\u304f\u308c\u3088\u30de\u30b8\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\uff57\u25bc\u6771\u65b9/\u30dc\u30ab\u30ed/\u30a2\u30cb\u30e1/\u30b3\u30b9\u30d7\u30ec/\u30b2\u30fc\u30e0/\u7d75/\u9ad8\u6821\u751f/\u5c04\u547d\u4e38/\u9280\u9b42\u25bc\u6df1\u591c\u65e9\u671d\u4ee5\u5916\u306f\u5927\u4f53\u5bdd\u3066\u308b\u25bc\u8150\u30b7\u30e7\u30bf\u30ed\u30eaB/G/N\u25bc\u4e00\u4eba\u79f0\u5b9a\u307e\u3089\u306c\u25bcskypeID\u805e\u3044\u3066\u3061\u3087", 
                    "favourites_count": 68, 
                    "follow_request_sent": null, 
                    "followers_count": 550, 
                    "following": null, 
                    "friends_count": 528, 
                    "geo_enabled": false, 
                    "id": 134421508, 
                    "id_str": "134421508", 
                    "is_translator": false, 
                    "lang": "ja", 
                    "listed_count": 59, 
                    "location": "\u6392\u6c34\u6e9d", 
                    "name": "\u3046\u3058\u307e\u3064", 
                    "notifications": null, 
                    "profile_background_color": "6b1313", 
                    "profile_background_image_url": "http://a3.twimg.com/profile_background_images/178367833/yuyupai23.jpg", 
                    "profile_background_tile": false, 
                    "profile_image_url": "http://a2.twimg.com/profile_images/1183732570/002_normal.jpg", 
                    "profile_link_color": "800a14", 
                    "profile_sidebar_border_color": "242626", 
                    "profile_sidebar_fill_color": "d39ae3", 
                    "profile_text_color": "29252e", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "ujimatsu", 
                    "show_all_inline_media": false, 
                    "statuses_count": 21408, 
                    "time_zone": "Hawaii", 
                    "url": "http://\u62b9\u8336.com", 
                    "utc_offset": -36000, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:16 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [
                        {
                            "expanded_url": null, 
                            "indices": [
                                40, 
                                70
                            ], 
                            "url": "http://formspring.me/LBertochi"
                        }
                    ], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579569550336000, 
                "id_str": "13579569550336000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://formspring.me\" rel=\"nofollow\">Formspring.me</a>", 
                "text": "PergunTIM  - Seus lindox t\u00e3o lindoxx... http://formspring.me/LBertochi", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Thu Jan 14 16:04:06 +0000 2010", 
                    "description": "Sou bipolar n\u00e3o tente me entender :): {c\u00f3pia descarada de @FPIGATTO}", 
                    "favourites_count": 1, 
                    "follow_request_sent": false, 
                    "followers_count": 121, 
                    "following": false, 
                    "friends_count": 153, 
                    "geo_enabled": true, 
                    "id": 104851384, 
                    "id_str": "104851384", 
                    "is_translator": false, 
                    "lang": "en", 
                    "listed_count": 3, 
                    "location": "", 
                    "name": "Levino junior", 
                    "notifications": false, 
                    "profile_background_color": "55c28c", 
                    "profile_background_image_url": "http://a3.twimg.com/profile_background_images/141332769/big-ben.jpg", 
                    "profile_background_tile": true, 
                    "profile_image_url": "http://a1.twimg.com/profile_images/1151210009/OgAAAHOthn_RpPLpBn0mZZ5qTUARRotbq6mVyo0KUC9OX6Qx84nzdv1BLCSYmoxGOQCEqBUg4ul7bOlEevaJSfHSxAMAm1T1UKMbDdZBZiJEnxQWysdLY4r-AQFw_normal.jpg", 
                    "profile_link_color": "55c28c", 
                    "profile_sidebar_border_color": "5a8da6", 
                    "profile_sidebar_fill_color": "5a8da6", 
                    "profile_text_color": "000000", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "LBertochi", 
                    "show_all_inline_media": false, 
                    "statuses_count": 168, 
                    "time_zone": "Brasilia", 
                    "url": "http://www.formspring.me/LBertochi", 
                    "utc_offset": -10800, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:15 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579567977472000, 
                "id_str": "13579567977472000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://www.movatwi.jp\" rel=\"nofollow\">www.movatwi.jp</a>", 
                "text": "\u4f0a\u85e4\u30ea\u30aa\u30f3\u300c\u30d0\u30ab\u306a\u3063\uff01\u300d\u2190\u30cd\u30bf(\u7b11)", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Thu Jan 28 06:48:49 +0000 2010", 
                    "description": "Free-Square\u3063\u3066\u30d0\u30f3\u30c9\u3067\u30c9\u30e9\u30e0\u3084\u3063\u3066\u307e\u3059\u3002\u6620\u753b\u597d\u304d\u3001\u97f3\u697d\u597d\u304d\u3001\u30a2\u30cb\u30e1\u597d\u304d\u3001\u4ed6\u3044\u308d\u3044\u308d\u8da3\u5473\u304c\u591a\u3044\u3063\u3059(\uffe3\u2200\uffe3)", 
                    "favourites_count": 1, 
                    "follow_request_sent": false, 
                    "followers_count": 104, 
                    "following": false, 
                    "friends_count": 136, 
                    "geo_enabled": false, 
                    "id": 109186553, 
                    "id_str": "109186553", 
                    "is_translator": false, 
                    "lang": "ja", 
                    "listed_count": 5, 
                    "location": "\u65e5\u91ce\u5e02", 
                    "name": "\u7c7e\u6bbb", 
                    "notifications": false, 
                    "profile_background_color": "C0DEED", 
                    "profile_background_image_url": "http://a3.twimg.com/profile_background_images/90862815/blacklight-fantasy.jpg", 
                    "profile_background_tile": false, 
                    "profile_image_url": "http://a1.twimg.com/profile_images/1054801565/bakeneko_normal.jpg", 
                    "profile_link_color": "0084B4", 
                    "profile_sidebar_border_color": "C0DEED", 
                    "profile_sidebar_fill_color": "DDEEF6", 
                    "profile_text_color": "333333", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "momigala", 
                    "show_all_inline_media": false, 
                    "statuses_count": 2290, 
                    "time_zone": "Tokyo", 
                    "url": null, 
                    "utc_offset": 32400, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:15 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": [
                        {
                            "id": 70936372, 
                            "id_str": "70936372", 
                            "indices": [
                                33, 
                                42
                            ], 
                            "name": "Delivia", 
                            "screen_name": "deliviaa"
                        }
                    ]
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579566186496000, 
                "id_str": "13579566186496000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://www.ubertwitter.com/bb/download.php\" rel=\"nofollow\">\u00dcberTwitter</a>", 
                "text": "RT ah kamyu aku jd malyu kikikik @deliviaa: Ohh.wah jago maen biola jago nyanyi jago.mantap laah..hehe RT ciied: RT padus gereja gue ehehe", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Tue Sep 01 16:16:30 +0000 2009", 
                    "description": "I'm a monster rancher. Watch out!", 
                    "favourites_count": 0, 
                    "follow_request_sent": false, 
                    "followers_count": 183, 
                    "following": false, 
                    "friends_count": 127, 
                    "geo_enabled": false, 
                    "id": 70717537, 
                    "id_str": "70717537", 
                    "is_translator": false, 
                    "lang": "en", 
                    "listed_count": 1, 
                    "location": "\u00dcT: -6.20084,106.94786", 
                    "name": "Citra Adinda", 
                    "notifications": false, 
                    "profile_background_color": "C0DEED", 
                    "profile_background_image_url": "http://a3.twimg.com/profile_background_images/61262723/snapshot20071125172456.jpg", 
                    "profile_background_tile": true, 
                    "profile_image_url": "http://a0.twimg.com/profile_images/1149480500/munch_2010_10_21_081433_normal.jpg", 
                    "profile_link_color": "0084B4", 
                    "profile_sidebar_border_color": "C0DEED", 
                    "profile_sidebar_fill_color": "DDEEF6", 
                    "profile_text_color": "333333", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "ciied", 
                    "show_all_inline_media": false, 
                    "statuses_count": 6023, 
                    "time_zone": "Pacific Time (US & Canada)", 
                    "url": "http://null", 
                    "utc_offset": -28800, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:15 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579565771264000, 
                "id_str": "13579565771264000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://www.tweetdeck.com\" rel=\"nofollow\">TweetDeck</a>", 
                "text": "baru setengah hari diluar lapangan muka udah merah ga karuan.", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Mon Aug 10 13:28:30 +0000 2009", 
                    "description": "A girl who can't be move", 
                    "favourites_count": 53, 
                    "follow_request_sent": false, 
                    "followers_count": 185, 
                    "following": false, 
                    "friends_count": 240, 
                    "geo_enabled": false, 
                    "id": 64402686, 
                    "id_str": "64402686", 
                    "is_translator": false, 
                    "lang": "en", 
                    "listed_count": 5, 
                    "location": "Dreamland", 
                    "name": "Niken Al Fadjrin", 
                    "notifications": false, 
                    "profile_background_color": "FFF04D", 
                    "profile_background_image_url": "http://a3.twimg.com/profile_background_images/153107833/twitter_luca.jpg", 
                    "profile_background_tile": true, 
                    "profile_image_url": "http://a3.twimg.com/profile_images/1186328483/223034020_normal.jpg", 
                    "profile_link_color": "0099CC", 
                    "profile_sidebar_border_color": "fff8ad", 
                    "profile_sidebar_fill_color": "f6ffd1", 
                    "profile_text_color": "333333", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "nikenalf", 
                    "show_all_inline_media": false, 
                    "statuses_count": 29395, 
                    "time_zone": "Jakarta", 
                    "url": null, 
                    "utc_offset": 25200, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:15 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579565246976000, 
                "id_str": "13579565246976000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://blackberry.com/twitter\" rel=\"nofollow\">Twitter for BlackBerry\u00ae</a>", 
                "text": "Jaringan bagus :)", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Mon Jun 21 05:50:04 +0000 2010", 
                    "description": "Follow me please :) folback ? :o just mention :D . 2261FECE -- add yaw :)", 
                    "favourites_count": 5, 
                    "follow_request_sent": false, 
                    "followers_count": 95, 
                    "following": false, 
                    "friends_count": 53, 
                    "geo_enabled": false, 
                    "id": 157900192, 
                    "id_str": "157900192", 
                    "is_translator": false, 
                    "lang": "en", 
                    "listed_count": 2, 
                    "location": "Palembang , Indonesia", 
                    "name": "Sandra Putri \u2665", 
                    "notifications": false, 
                    "profile_background_color": "ffffff", 
                    "profile_background_image_url": "http://a3.twimg.com/profile_background_images/115087879/miley-cyrus.jpg", 
                    "profile_background_tile": true, 
                    "profile_image_url": "http://a1.twimg.com/profile_images/1183005321/IMG05244-20101204-1449_normal.jpg", 
                    "profile_link_color": "f7b2c5", 
                    "profile_sidebar_border_color": "f83b63", 
                    "profile_sidebar_fill_color": "f83b63", 
                    "profile_text_color": "333333", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "sansan_put", 
                    "show_all_inline_media": false, 
                    "statuses_count": 1753, 
                    "time_zone": "Pacific Time (US & Canada)", 
                    "url": "http://www.facebook.com/sAnsaNputRi", 
                    "utc_offset": -28800, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:14 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579563565056000, 
                "id_str": "13579563565056000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://z.twipple.jp/\" rel=\"nofollow\">\u3064\u3044\u3063\u3077\u308b/twipple</a>", 
                "text": "\u5acc\u306a\u601d\u3044\u3055\u308c\u305f\u304f\u306a\u3044\u3060\u3051\u306a\u3093\u3067\u3059", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Sat Sep 04 06:05:47 +0000 2010", 
                    "description": "\u4e3b\u306b\u652f\u90e8\u4f01\u753b\u306e\u8a71\u3068\u304b\u3092\u545f\u3044\u3066\u304a\u308a\u307e\u3059\u3002\u652f\u90e8\u3067\u306f(\u3054\u307eor\u304f\u308d\u3054\u307e)\u3068\u540d\u4e57\u3063\u3066\u307e\u3059\u3002\u53c2\u52a0\u4e2d\u25cf\u3010\u30d4\u30af\u6d77\u8cca:\u30b3\u30b9\u30c6\u30a3\u3011\u3010\u3074\u304f\u30db\u30b0:\u30a2\u30cd\u30eb\u30de\u3011\u3010\u7d75\u5e2b\u5b66:\u7e54\u4eba\u3011\u3010\u3074\u304f\u73fe\u970a:\u8f9b\u3011\u25cf", 
                    "favourites_count": 34, 
                    "follow_request_sent": false, 
                    "followers_count": 192, 
                    "following": false, 
                    "friends_count": 185, 
                    "geo_enabled": false, 
                    "id": 186723255, 
                    "id_str": "186723255", 
                    "is_translator": false, 
                    "lang": "ja", 
                    "listed_count": 33, 
                    "location": "\u5317\u306e\u56fd", 
                    "name": "\u3084\u304f\u3082\uff20\u53d7\u9a13\u7206\u767a", 
                    "notifications": false, 
                    "profile_background_color": "352726", 
                    "profile_background_image_url": "http://s.twimg.com/a/1291318259/images/themes/theme5/bg.gif", 
                    "profile_background_tile": false, 
                    "profile_image_url": "http://a3.twimg.com/profile_images/1185505423/____normal.png", 
                    "profile_link_color": "6fa385", 
                    "profile_sidebar_border_color": "829D5E", 
                    "profile_sidebar_fill_color": "99CC33", 
                    "profile_text_color": "3E4415", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "yakumo_21", 
                    "show_all_inline_media": false, 
                    "statuses_count": 9749, 
                    "time_zone": "Tokyo", 
                    "url": "http://www.pixiv.net/member.php?id=627945", 
                    "utc_offset": 32400, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:14 +0000 2010", 
                "entities": {
                    "hashtags": [
                        {
                            "indices": [
                                92, 
                                100
                            ], 
                            "text": "Defense"
                        }, 
                        {
                            "indices": [
                                101, 
                                107
                            ], 
                            "text": "India"
                        }, 
                        {
                            "indices": [
                                110, 
                                117
                            ], 
                            "text": "Israel"
                        }
                    ], 
                    "urls": [
                        {
                            "expanded_url": null, 
                            "indices": [
                                64, 
                                90
                            ], 
                            "url": "http://tinyurl.com/2cp5ja2"
                        }
                    ], 
                    "user_mentions": [
                        {
                            "id": 45533881, 
                            "id_str": "45533881", 
                            "indices": [
                                3, 
                                12
                            ], 
                            "name": "Livefist", 
                            "screen_name": "livefist"
                        }
                    ]
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579560528384000, 
                "id_str": "13579560528384000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://blackberry.com/twitter\" rel=\"nofollow\">Twitter for BlackBerry\u00ae</a>", 
                "text": "RT @livefist: PHOTOS: India's 3rd Phalcon AWACS Lands In Israel http://tinyurl.com/2cp5ja2  #Defense #India / #Israel", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Thu Jun 18 22:14:57 +0000 2009", 
                    "description": " Jewish Proud American\r\n\r\n", 
                    "favourites_count": 25, 
                    "follow_request_sent": false, 
                    "followers_count": 1204, 
                    "following": false, 
                    "friends_count": 393, 
                    "geo_enabled": false, 
                    "id": 48510756, 
                    "id_str": "48510756", 
                    "is_translator": false, 
                    "lang": "en", 
                    "listed_count": 65, 
                    "location": "USA ISRAEL", 
                    "name": "Elizabeth", 
                    "notifications": false, 
                    "profile_background_color": "131516", 
                    "profile_background_image_url": "http://s.twimg.com/a/1292022067/images/themes/theme14/bg.gif", 
                    "profile_background_tile": true, 
                    "profile_image_url": "http://a1.twimg.com/profile_images/1165295629/4504846947_27ca018363_t_normal.jpg", 
                    "profile_link_color": "009999", 
                    "profile_sidebar_border_color": "eeeeee", 
                    "profile_sidebar_fill_color": "efefef", 
                    "profile_text_color": "333333", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "LizzieViolet", 
                    "show_all_inline_media": false, 
                    "statuses_count": 47353, 
                    "time_zone": "Jerusalem", 
                    "url": "http://lizzieviolet.blogspot.com", 
                    "utc_offset": 7200, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:13 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [
                        {
                            "expanded_url": null, 
                            "indices": [
                                116, 
                                136
                            ], 
                            "url": "http://bit.ly/e4xZLv"
                        }
                    ], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579559588864000, 
                "id_str": "13579559588864000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://twitterfeed.com\" rel=\"nofollow\">twitterfeed</a>", 
                "text": "Table Tennis Masterclasss: Great 'back to basics' Table Tennis training methods, taught by one of the games' Hal... http://bit.ly/e4xZLv", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Mon Dec 06 22:09:16 +0000 2010", 
                    "description": "", 
                    "favourites_count": 0, 
                    "follow_request_sent": false, 
                    "followers_count": 400, 
                    "following": false, 
                    "friends_count": 16, 
                    "geo_enabled": false, 
                    "id": 223623095, 
                    "id_str": "223623095", 
                    "is_translator": false, 
                    "lang": "en", 
                    "listed_count": 1, 
                    "location": "", 
                    "name": "Amaizing Deals", 
                    "notifications": false, 
                    "profile_background_color": "FFF04D", 
                    "profile_background_image_url": "http://a3.twimg.com/profile_background_images/178881345/myad.JPG", 
                    "profile_background_tile": false, 
                    "profile_image_url": "http://a2.twimg.com/profile_images/1184231290/money_normal.jpg", 
                    "profile_link_color": "0099CC", 
                    "profile_sidebar_border_color": "fff8ad", 
                    "profile_sidebar_fill_color": "f6ffd1", 
                    "profile_text_color": "333333", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "earnnin", 
                    "show_all_inline_media": false, 
                    "statuses_count": 3725, 
                    "time_zone": "Eastern Time (US & Canada)", 
                    "url": null, 
                    "utc_offset": -18000, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:13 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [
                        {
                            "expanded_url": null, 
                            "indices": [
                                28, 
                                48
                            ], 
                            "url": "http://bit.ly/e9FsZN"
                        }
                    ], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579558431232000, 
                "id_str": "13579558431232000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://labs.m-logic.jp/cat2/posttweet/\" rel=\"nofollow\">PostTweet</a>", 
                "text": "TV\u30a2\u30cb\u30e1\u300e\u5922\u55b0\u3044\u30e1\u30ea\u30fc\u300f\u306e\u653e\u9001\u5c40\u3068\u653e\u9001\u65e5\u6642\u304c\u6c7a\u5b9a - http://bit.ly/e9FsZN", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Sun Jan 20 14:17:58 +0000 2008", 
                    "description": "\u30a2\u30cb\u30e1\u30fb\u30b2\u30fc\u30e0\u7cfb\u30cb\u30e5\u30fc\u30b9\u30b5\u30a4\u30c8\u300e\u30c6\u30f3\u30d7\u30eb\u30ca\u30a4\u30c4\u300f\u306e\u66f4\u65b0\u901a\u77e5Twitter\u3002\u7ba1\u7406\u4eba\u500b\u4eba\u540d\u7fa9\u306f\u4e0b\u8a18\u3002http://twitter.com/kusima", 
                    "favourites_count": 2, 
                    "follow_request_sent": false, 
                    "followers_count": 511, 
                    "following": false, 
                    "friends_count": 1, 
                    "geo_enabled": false, 
                    "id": 12458782, 
                    "id_str": "12458782", 
                    "is_translator": false, 
                    "lang": "ja", 
                    "listed_count": 79, 
                    "location": "\u30b5\u30a4\u30d0\u30fc\u30b9\u30da\u30fc\u30b9(Cyber-space)", 
                    "name": "temple_knights", 
                    "notifications": false, 
                    "profile_background_color": "C0DEED", 
                    "profile_background_image_url": "http://s.twimg.com/a/1291318259/images/themes/theme1/bg.png", 
                    "profile_background_tile": false, 
                    "profile_image_url": "http://a2.twimg.com/profile_images/62451130/758715_450391380_normal.jpg", 
                    "profile_link_color": "0084B4", 
                    "profile_sidebar_border_color": "C0DEED", 
                    "profile_sidebar_fill_color": "DDEEF6", 
                    "profile_text_color": "333333", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "temple_knights", 
                    "show_all_inline_media": false, 
                    "statuses_count": 6131, 
                    "time_zone": "Osaka", 
                    "url": "http://temple-knights.com/", 
                    "utc_offset": 32400, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:13 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579557906944000, 
                "id_str": "13579557906944000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://blackberry.com/twitter\" rel=\"nofollow\">Twitter for BlackBerry\u00ae</a>", 
                "text": "En ik ben weer wakker", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Mon Oct 04 13:46:23 +0000 2010", 
                    "description": "Hi, I'm Kimberly and I'm 14 years old. I'm a hudge fan of The Jonas Brothers and BTR. BTR 4 LIFE\u2665", 
                    "favourites_count": 13, 
                    "follow_request_sent": false, 
                    "followers_count": 25, 
                    "following": false, 
                    "friends_count": 77, 
                    "geo_enabled": false, 
                    "id": 198498849, 
                    "id_str": "198498849", 
                    "is_translator": false, 
                    "lang": "en", 
                    "listed_count": 0, 
                    "location": "Netherlandssssssssss", 
                    "name": "Kimberlyyy", 
                    "notifications": false, 
                    "profile_background_color": "642D8B", 
                    "profile_background_image_url": "http://a3.twimg.com/profile_background_images/168315009/eclipse_twilight_logo.jpg", 
                    "profile_background_tile": true, 
                    "profile_image_url": "http://a1.twimg.com/profile_images/1168323621/IMG00645-20101026-1916_normal.jpg", 
                    "profile_link_color": "000000", 
                    "profile_sidebar_border_color": "65B0DA", 
                    "profile_sidebar_fill_color": "7AC3EE", 
                    "profile_text_color": "3D1957", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "x_ItsKimmy_x", 
                    "show_all_inline_media": false, 
                    "statuses_count": 1260, 
                    "time_zone": "Amsterdam", 
                    "url": null, 
                    "utc_offset": 3600, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:13 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579557273600000, 
                "id_str": "13579557273600000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://jigtwi.jp/?p=1\" rel=\"nofollow\">jigtwi</a>", 
                "text": "\u67d0\u6f2b\u753b\u306b\u51fa\u3066\u304f\u308b\u5b66\u6821\u306e\u4e2d\u306e\u30e2\u30c7\u30eb\u6821\u3060\u3088\u2026\u7fa8\u307e\u3057\u3044\u2026", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Mon Mar 08 06:11:59 +0000 2010", 
                    "description": "\u30a2\u30cb\u30e1\u3068\u58f0\u512a\u3055\u3093\u611b\u3057\u3066\u307e\u3059\u3002\u3046\u3061\u306e\u5b50(\u72ac)\u5927\u597d\u304d\u306a\u89aa\u99ac\u9e7f\u3002PC\u3067\u3088\u304f\u30cb\u30b3\u30cb\u30b3\u3057\u3066\u307e\u3059\u3002\u8a71\u304c\u3059\u3050\u5909\u308f\u308a\u307e\u3059\u3002\u30a2\u30cb\u30e1\u4ee5\u5916\u306b\u3082\u304f\u3060\u3089\u306a\u3044\u4e8b\u545f\u304d\u307e\u304f\u308a\u307e\u3059\u3002\uff3c\u9280\u9b42LOVE\uff0f", 
                    "favourites_count": 63, 
                    "follow_request_sent": false, 
                    "followers_count": 79, 
                    "following": false, 
                    "friends_count": 76, 
                    "geo_enabled": false, 
                    "id": 121001565, 
                    "id_str": "121001565", 
                    "is_translator": false, 
                    "lang": "ja", 
                    "listed_count": 7, 
                    "location": "\u611b\u77e5", 
                    "name": "\u308a\u30fc\u3061\u3083", 
                    "notifications": false, 
                    "profile_background_color": "BF1238", 
                    "profile_background_image_url": "http://s.twimg.com/a/1291318259/images/themes/theme20/bg.png", 
                    "profile_background_tile": false, 
                    "profile_image_url": "http://a2.twimg.com/profile_images/1184002682/1c597594-8bc8-457e-8b60-e8ee3fa7e72b_normal.png", 
                    "profile_link_color": "BF1238", 
                    "profile_sidebar_border_color": "FFFFFF", 
                    "profile_sidebar_fill_color": "EFEFEF", 
                    "profile_text_color": "333333", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "nononpon", 
                    "show_all_inline_media": false, 
                    "statuses_count": 10425, 
                    "time_zone": null, 
                    "url": null, 
                    "utc_offset": null, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:12 +0000 2010", 
                "entities": {
                    "hashtags": [
                        {
                            "indices": [
                                82, 
                                90
                            ], 
                            "text": "pickone"
                        }
                    ], 
                    "urls": [], 
                    "user_mentions": [
                        {
                            "id": 149157167, 
                            "id_str": "149157167", 
                            "indices": [
                                16, 
                                32
                            ], 
                            "name": "Jenifer Belnanda", 
                            "screen_name": "JeniferBelnanda"
                        }, 
                        {
                            "id": 80310353, 
                            "id_str": "80310353", 
                            "indices": [
                                41, 
                                56
                            ], 
                            "name": "andrew._.", 
                            "screen_name": "ndrewferdinand"
                        }, 
                        {
                            "id": 154042463, 
                            "id_str": "154042463", 
                            "indices": [
                                70, 
                                81
                            ], 
                            "name": "Ivan Theomanto", 
                            "screen_name": "animatezjr"
                        }
                    ]
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579554345984000, 
                "id_str": "13579554345984000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "web", 
                "text": "ajarin gw oi RT @JeniferBelnanda \nsil RT @ndrewferdinand: dota lah RT @animatezjr #pickone DotA or Sea", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Tue Oct 06 14:07:12 +0000 2009", 
                    "description": "ferdinand andrew |grade 9", 
                    "favourites_count": 0, 
                    "follow_request_sent": false, 
                    "followers_count": 52, 
                    "following": false, 
                    "friends_count": 21, 
                    "geo_enabled": true, 
                    "id": 80310353, 
                    "id_str": "80310353", 
                    "is_translator": false, 
                    "lang": "en", 
                    "listed_count": 1, 
                    "location": "Jakarta", 
                    "name": "andrew._.", 
                    "notifications": false, 
                    "profile_background_color": "ACDED6", 
                    "profile_background_image_url": "http://s.twimg.com/a/1291760612/images/themes/theme18/bg.gif", 
                    "profile_background_tile": false, 
                    "profile_image_url": "http://a2.twimg.com/profile_images/1181692222/default_profile_3_bigger_normal.png", 
                    "profile_link_color": "038543", 
                    "profile_sidebar_border_color": "EEEEEE", 
                    "profile_sidebar_fill_color": "F6F6F6", 
                    "profile_text_color": "333333", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "ndrewferdinand", 
                    "show_all_inline_media": false, 
                    "statuses_count": 3645, 
                    "time_zone": "Pacific Time (US & Canada)", 
                    "url": "http://www.facebook.com/profile.php?id=1600254568", 
                    "utc_offset": -28800, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:12 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [
                        {
                            "expanded_url": null, 
                            "indices": [
                                5, 
                                55
                            ], 
                            "url": "http://photojpn.blog18.fc2.com/blog-entry-405.html"
                        }
                    ], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579552248832000, 
                "id_str": "13579552248832000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://blog.fc2.com/\" rel=\"nofollow\">FC2 Blog Notify</a>", 
                "text": "\u51ac\u306e\u6674\u5929 http://photojpn.blog18.fc2.com/blog-entry-405.html PHOTO JAPAN", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Tue Jun 01 05:31:10 +0000 2010", 
                    "description": "", 
                    "favourites_count": 0, 
                    "follow_request_sent": false, 
                    "followers_count": 3, 
                    "following": false, 
                    "friends_count": 4, 
                    "geo_enabled": false, 
                    "id": 150540424, 
                    "id_str": "150540424", 
                    "is_translator": false, 
                    "lang": "ja", 
                    "listed_count": 0, 
                    "location": "", 
                    "name": "photojpn", 
                    "notifications": false, 
                    "profile_background_color": "DBE9ED", 
                    "profile_background_image_url": "http://s.twimg.com/a/1290538325/images/themes/theme17/bg.gif", 
                    "profile_background_tile": false, 
                    "profile_image_url": "http://a0.twimg.com/profile_images/955716772/twitter_icon_normal.jpg", 
                    "profile_link_color": "CC3366", 
                    "profile_sidebar_border_color": "DBE9ED", 
                    "profile_sidebar_fill_color": "E6F6F9", 
                    "profile_text_color": "333333", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "photojpn", 
                    "show_all_inline_media": false, 
                    "statuses_count": 240, 
                    "time_zone": "Hawaii", 
                    "url": null, 
                    "utc_offset": -36000, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:11 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579549933568000, 
                "id_str": "13579549933568000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "<a href=\"http://www.movatwi.jp\" rel=\"nofollow\">www.movatwi.jp</a>", 
                "text": "\u54c0\u308c\u306a\u3082\u3093\u3060\u306a\u3041\u2026 \u4ffa", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Sun May 02 14:42:22 +0000 2010", 
                    "description": "bot\u76f8\u624b\u306b\u8352\u3076\u308b\u76f4\u5c04\u65e5\u5149\u304c\u82e6\u624b\u306a\u5909\u614b\u3000\u597d\u2192\u5438\u8840\u9b3c/\u30d8\u30eb\u30b7\u30f3\u30b0/\u65e6\u90a3/\u9b54\u5f3e/\u8d64\u30de\u30f3\u30c8/etc...(\u203b\u611a\u75f4\uff65\u53a8\u4e8c\u767a\u8a00\u6ce8\u610f \u305f\u307e\u306b\u30a2\u30a4\u30b3\u30f3\u53e3\u8abf\u306b\u306a\u308a\u307e\u3059)FRB\u304a\u6c17\u8efd\u306b\u3069\u305e\u30fc^^", 
                    "favourites_count": 83, 
                    "follow_request_sent": false, 
                    "followers_count": 96, 
                    "following": false, 
                    "friends_count": 97, 
                    "geo_enabled": false, 
                    "id": 139412280, 
                    "id_str": "139412280", 
                    "is_translator": false, 
                    "lang": "ja", 
                    "listed_count": 7, 
                    "location": "\u68fa\u6876", 
                    "name": "\u306f\u3076", 
                    "notifications": false, 
                    "profile_background_color": "1A1B1F", 
                    "profile_background_image_url": "http://a3.twimg.com/profile_background_images/98369681/3313511.jpg", 
                    "profile_background_tile": true, 
                    "profile_image_url": "http://a0.twimg.com/profile_images/1176695780/ca256842-17a6-446d-8eb6-9126f8853710_normal.png", 
                    "profile_link_color": "455b61", 
                    "profile_sidebar_border_color": "5c5c5c", 
                    "profile_sidebar_fill_color": "050505", 
                    "profile_text_color": "8f048f", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "ALUCA_hbroth", 
                    "show_all_inline_media": false, 
                    "statuses_count": 14697, 
                    "time_zone": "Tokyo", 
                    "url": "http://www.pixiv.net/member.php?id=1513467 ", 
                    "utc_offset": 32400, 
                    "verified": false
                }
            }, 
            {
                "contributors": null, 
                "coordinates": null, 
                "created_at": "Sat Dec 11 13:03:11 +0000 2010", 
                "entities": {
                    "hashtags": [], 
                    "urls": [], 
                    "user_mentions": []
                }, 
                "favorited": false, 
                "geo": null, 
                "id": 13579548884992000, 
                "id_str": "13579548884992000", 
                "in_reply_to_screen_name": null, 
                "in_reply_to_status_id": null, 
                "in_reply_to_status_id_str": null, 
                "in_reply_to_user_id": null, 
                "in_reply_to_user_id_str": null, 
                "place": null, 
                "retweet_count": 0, 
                "retweeted": false, 
                "source": "web", 
                "text": "Bon ?", 
                "truncated": false, 
                "user": {
                    "contributors_enabled": false, 
                    "created_at": "Mon Oct 25 08:16:59 +0000 2010", 
                    "description": "Hey everybody ! \r\n@Greysonchance\r\n@NikosOfficiel\r\n@ILoveNY \r\nFollow me :D \r\n\r\nMy hobbies : Sing & Dance .\r\n\r\nI'm @JustinBieber fan !", 
                    "favourites_count": 2, 
                    "follow_request_sent": false, 
                    "followers_count": 161, 
                    "following": false, 
                    "friends_count": 112, 
                    "geo_enabled": true, 
                    "id": 207411339, 
                    "id_str": "207411339", 
                    "is_translator": false, 
                    "lang": "fr", 
                    "listed_count": 6, 
                    "location": "France", 
                    "name": "Beliebes \u2665 ", 
                    "notifications": false, 
                    "profile_background_color": "C0DEED", 
                    "profile_background_image_url": "http://a1.twimg.com/profile_background_images/168370522/Brique_2.jpg", 
                    "profile_background_tile": true, 
                    "profile_image_url": "http://a0.twimg.com/profile_images/1185561460/204982242_normal.jpg", 
                    "profile_link_color": "2eb5e6", 
                    "profile_sidebar_border_color": "C0DEED", 
                    "profile_sidebar_fill_color": "DDEEF6", 
                    "profile_text_color": "968e96", 
                    "profile_use_background_image": true, 
                    "protected": false, 
                    "screen_name": "Cassie_Beliebe", 
                    "show_all_inline_media": true, 
                    "statuses_count": 770, 
                    "time_zone": "Greenland", 
                    "url": null, 
                    "utc_offset": -10800, 
                    "verified": false
                }
            }
        ];
        processFunction(data, callback);
    } else {
        url = "http://api.twitter.com/1/statuses/public_timeline.json?include_entities=true&callback=?";
        jQuery.getJSON(this.url, function(data) {
            osg.log(data);
            processFunction(data, callback);
        });
    }
}



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
            //osg.log("height " + currentHeight);
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
        q = osg.createTexturedQuad(-w/2.0, -h/2.0, 0,
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


var TwitterPictureRendering;
function displayTweetPictureToCanvas ( image) {
    var twitterRendering;
    if (TwitterPictureRendering === undefined) {
        twitterRendering = document.getElementById("TweetPicture");
        TwitterPictureRendering = twitterRendering;
    } else {
        twitterRendering = TwitterPictureRendering;
    }
    var textureSizeX = twitterRendering.width;
    var textureSizeY = twitterRendering.height;

    var ctx = twitterRendering.getContext("2d");
    
    var ratio = textureSizeX / image.width;

    ctx.save();
    ctx.clearRect (0, 0, textureSizeX, textureSizeY);
    ctx.scale(ratio, ratio);
    ctx.drawImage(image, 0, 0);
    ctx.restore();
    var t = osg.Texture.createFromCanvas(twitterRendering);
    return t;
}
