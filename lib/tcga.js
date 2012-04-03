/**
 * TCGA Toolbox
 * Keep in mind that cross-browser support is not the goal of this library.
 * Depends on: toType.js, jquery.js
 */
/*jshint jquery:true browser:true */
/*global TCGA:false */
(function (exports) {
    "use strict";
    var httpRequest;
    httpRequest = function (options) {
        var xhr;
        options = options || {};
        if (options.hasOwnProperty("uri") === false || Object.toType(options.uri) !== "string") {
            throw new Error("Please provide a uri parameter [string].");
        }
        if (options.hasOwnProperty("callback") === false || Object.toType(options.callback) !== "function") {
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
                options.callback(null, xhr.responseText);
            } else {
                options.callback({
                    name: "Error",
                    message: "Status Code: " + xhr.status
                }, null);
            }
        };
        xhr.onerror = function () {
            options.callback({
                name: "Error",
                message: "Getting the URI failed. The browser log might have more details."
            }, null);
        };
        xhr.send(null);
    };
    exports.TCGA = {
        scripts : {},
        loadScript: function (uri, callback, reload) {
            var semaphoreCallback, pendingScripts, errors, that;
            errors = [];
            that = this;
            if (uri === undefined || (Object.toType(uri) !== "string" && Object.toType(uri) !== "array")) {
                throw new Error("Please provide a uri parameter [string].");
            }
            if (callback !== undefined && Object.toType(callback) !== "function") {
                throw new Error("Please provide a callback parameter [function].");
            }
            if (Object.toType(uri) === "string") {
                uri = [uri];
            }
            pendingScripts = uri.length;
            callback = callback || function () {};
            reload = reload || false;
            semaphoreCallback = function (error) {
                if (error) {
                    errors.push(error);
                }
                if (--pendingScripts <= 0) {
                    if (errors.length === 0) {
                        callback(null);
                    } else {
                        callback(errors);
                    }
                } else {
                    return;
                }
            };
            uri.forEach(function (oneUri) {
                var head, script;
                if (that.scripts[oneUri] && !reload) {
                    semaphoreCallback(null);
                    return;
                }
                head = document.head;
                script = document.createElement("script");
                script.src = oneUri;
                script.onload = function () {
                    head.removeChild(script);
                    that.scripts[oneUri] = true;
                    semaphoreCallback(null);
                };
                script.onerror = function () {
                    head.removeChild(script);
                    semaphoreCallback({
                        name: "Error",
                        message: "Loading the script failed. The browser log might have more details."
                    });
                };
                head.appendChild(script);

            });
        },
        get: function (uri, callback) {
            var semaphoreCallback, errors, datas;
            errors = [];
            datas = {};
            if (uri === undefined || (Object.toType(uri) !== "string" && Object.toType(uri) !== "array")) {
                throw new Error("Please provide a uri parameter [string].");
            }
            if (callback !== undefined && Object.toType(callback) !== "function") {
                throw new Error("Please provide a callback parameter [function].");
            }
            if (Object.toType(uri) === "string") {
                uri = [uri];
            }
            datas.length = uri.length;
            callback = callback || function () {};
            semaphoreCallback = function (error) {
                var i;
                if (error) {
                    errors.push(error);
                }
                for (i = 0 ; i < uri.length ; i++) {
                    if (!datas[uri[i]]) {
                        return;
                    }
                }
                if (errors.length === 0) {
                    if (datas.length === 1) {
                        datas = datas[uri[0]];
                    }
                    callback(null, datas);
                }
                else {
                    callback(errors);
                }
            };
            uri.forEach(function (oneUri) {
                $.ajax({
                    url: oneUri,
                    success: function (data) {
                        datas[oneUri] = data;
                        semaphoreCallback(null);
                    },
                    error: function (xhr, texStatus, error) {
                        semaphoreCallback(error);
                    }
                });
            });
        },
        getRange: function (uri, startByte, endByte, callback) {
            startByte = startByte || 0;
            endByte = endByte || 100;
            httpRequest({
                uri: uri,
                headers: {
                    "Range": "bytes=" + startByte + "-" + endByte
                },
                callback: callback
            });
        },
        registerTab: function (name, title, contents) {
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
                     .appendTo(".nav-tabs");
            }
        }
    };
}(window));
