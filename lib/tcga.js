/**
 * TCGA Toolbox
 * Keep in mind that cross-browser support is not the goal of this library.
 */
(function (exports) {
    "use strict";
    var toType;
    toType = function(obj) {
        return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
    };
    exports.TCGA = {
        loadScript: function (uri, callback) {
            var head, script;
            if (uri === undefined || toType(uri) !== "string") {
                throw new Error("Please provide a uri parameter [string].");
            }
            if (callback === undefined || toType(callback) !== "function") {
                throw new Error("Please provide a callback parameter [function].");
            }
            head = document.head;
            script = document.createElement("script");
            script.src = uri;
            script.onload = function () {
                head.removeChild(script);
                callback(null);
            };
            script.onerror = function () {
                head.removeChild(script);
                callback({
                    name: "Error",
                    message: "Loading the script failed. The browser log might have more details."
                });
            };
            head.appendChild(script);
        },
        get: function (uri, callback) {
            var xhr;
            if (uri === undefined || toType(uri) !== "string") {
                throw new Error("Please provide a uri parameter [string].");
            }
            if (callback === undefined || toType(callback) !== "function") {
                throw new Error("Please provide a callback parameter [function].");
            }
            xhr = new XMLHttpRequest();
            xhr.open("GET", uri);
            xhr.onload = function () {
                if (xhr.status === 200) {
                    callback(null, xhr.responseText);
                } else {
                    callback({
                        name: "Error",
                        message: "Status Code: " + xhr.status
                    }, null);
                }
            };
            xhr.onerror = function () {
                callback({
                    name: "Error",
                    message: "Getting the URI failed. The browser log might have more details."
                }, null);
            };
            xhr.send(null);
        }
    };
}(window));
