/**
 * TCGA Toolbox
 * Keep in mind that cross-browser support is not the goal of this library.
 */
(function (exports) {
    "use strict";
    /*jshint jquery:true browser:true*/
    var toType, httpRequest;
    toType = function (obj) {
        return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
    };
    httpRequest = function (options) {
        var xhr;
        options = options || {};
        if (options.hasOwnProperty("uri") === false || toType(options.uri) !== "string") {
            throw new Error("Please provide a uri parameter [string].");
        }
        if (options.hasOwnProperty("callback") === false || toType(options.callback) !== "function") {
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
        loadScript: function (uri, callback) {
            var semaphoreCallback, pendingScripts, errors = [];
            if (uri === undefined || ( toType(uri) !== "string" && toType(uri) !== "array")) {
                throw new Error("Please provide a uri parameter [string].");
            }
            if (callback !== undefined && toType(callback) !== "function") {
                throw new Error("Please provide a callback parameter [function].");
            }
            if ( toType(uri) === "string" ) {
                uri = [uri];
            }
            pendingScripts = uri.length;
            callback = callback || function () {};
            semaphoreCallback = function (error) {
              if ( error ) {
                errors.push(error);
              }
              if ( --pendingScripts <= 0 ) {
                if ( errors.length === 0 ) {
                  callback(null);
                }
                else {
                  callback(errors);
                }
              }
              else return;
            };
            uri.forEach(function (oneUri) {
                var head, script;
                head = document.head;
                script = document.createElement("script");
                script.src = oneUri;
                script.onload = function () {
                    head.removeChild(script);
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
            httpRequest({
                uri: uri,
                callback: callback
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
          if (!title || !contents) return;
          else {
            tab = $("<div>")
              .addClass("tab-pane").addClass("row")
              .attr("id", name)
              .html(contents)
              .insertBefore("#end-of-content");
            navLi = $("<li>");
            nav = $("<a>")
              .attr("href", "#"+name)
              .attr("data-toggle", "tab")
              .html(title);
            navLi.append(nav).appendTo(".nav-tabs");
          }
        }
    };
}(window));
