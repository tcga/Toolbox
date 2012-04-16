/**
 * TCGA Toolbox
 * Keep in mind that cross-browser support is not the goal of this library.
 * Depends on: toType.js, jquery.js
 */
/*jshint jquery:true browser:true */
/*global TCGA:false */
(function (exports) {
    "use strict";

    var loadScript, httpRequest, get, getRange, registerTab;

 // loadScript loads one or more scripts in order using HTML script elements.
 // If one script fails, the callback will be executed immediately.
 // @param {string} uri
 // @param {[string]} uri
 // @param {(err)} callback
    exports.loadScript = loadScript = function (uri, callback) {
        var uriType;
        uriType = Object.toType(uri);
        if (uriType !== "string" && uriType !== "array") {
            throw new Error("Please provide a uri parameter (string or [string]).");
        }
        if (callback !== undefined && Object.toType(callback) !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        if (uriType === "string") {
         // Create list from string.
            uri = [uri];
        }
     // Set default callback handler.
        callback = callback || function () {};
     // Use inline recursion to load all scripts.
        (function loadScriptRec() {
            var target, head, script;
            if (uri.length === 0) {
                callback(null);
                return;
            }
            target = uri.shift();
            head = document.head;
            script = document.createElement("script");
            script.src = target;
            script.onload = function () {
                head.removeChild(script);
                loadScriptRec();
            };
            script.onerror = function () {
                head.removeChild(script);
                callback({
                    name: "Error",
                    message: "Loading the script failed. The browser log might have more details."
                });
            };
            head.appendChild(script);
        }());
    };

 // Performs an HTTP request.
 // @param {string} options
 // @param {object} options
 // @param {string} options.uri
 // @param {string} options.method
 // @param {object} options.headers
 // @param {(err, res)} callback
    exports.httpRequest = httpRequest = function (options, callback) {
        var xhr;
        if (Object.toType(options) === "string") {
            options = {
                uri: options
            };
        } else {
            options = options || {};
            if (options.hasOwnProperty("uri") === false || Object.toType(options.uri) !== "string") {
                throw new Error("Please provide a options.uri parameter [string].");
            }
        }
        if (Object.toType(callback) !== "function") {
            throw new Error("Please provide a callback parameter [function].");
        }
        options.headers = options.headers || {};
        xhr = new XMLHttpRequest();
        xhr.open("GET", options.uri);
        Object.keys(options.headers).forEach(function (header) {
            xhr.setRequestHeader(header, options.headers[header]);
        });
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
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
    };

 // Performs a GET request.
 // @param {string} uri
 // @param {[string]} uri
 // @param {(err, res)} callback
    exports.get = get = function (uri, callback) {
        var uriType, results, error;
        uriType = Object.toType(uri);
        if (uriType !== "string" && uriType !== "array") {
            throw new Error("Please provide a uri parameter (string or [string]).");
        }
        if (callback === undefined || Object.toType(callback) !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        if (uriType === "string") {
         // Create list from string.
            uri = [uri];
        }
     // Set default callback handler.
        callback = callback || function () {};
     // Catch results.
        results = [];
     // Do not track multiple errors, because in error checking [null] !== null is obviously true.
        error = null;
     // Use inline recursion to load all data.
        (function getRec() {
            var target;
            if (uri.length === 0) {
                if (results.length > 1) {
                    callback(error, results);
                } else {
                 // Return single values for single inputs.
                    callback(error, results[0]);
                }
                return;
            }
            target = uri.shift();
            httpRequest({
                uri: target
            }, function (err, result) {
                error = err;
                results.push(result);
                getRec();
            });
        }());
    };

 // Performs a ranged GET request.
 // @param {string} uri
 // @param {number} startByte
 // @param {number} endByte
 // @param {(err, res)} callback
    exports.getRange = getRange = function (uri, startByte, endByte, callback) {
        startByte = startByte || 0;
        endByte = endByte || 100;
        httpRequest({
            uri: uri,
            headers: {
                "Range": "bytes=" + startByte + "-" + endByte
            }
        }, callback);
    };

 // @param {string} name
 // @param {string} title
 // @param {string} contents
    exports.registerTab = registerTab = function (name, title, contents) {
        var tab, nav, navLi;
        if (!title || !contents) {
            return;
        } else {
            tab = $("<div>").addClass("tab-pane")
                            .addClass("row")
                            .attr("id", name)
                            .html(contents)
                            .insertBefore("#end-of-content");
            navLi = $("<li>");
            nav = $("<a>").attr("href", "#" + name)
                          .attr("data-toggle", "tab")
                          .html(title);
            navLi.append(nav)
                 .appendTo(".nav");
        }
    };

}(this.TCGA = {}));
