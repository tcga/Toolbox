/**
 * TCGA Toolbox
 * Depends on: toType.js, jquery.js, grapin.js, ganglion.js
 */
/*jshint jquery:true browser:true */
/*global TCGA:false, TarGZ:false, chrome:false */
(function (exports) {
    "use strict";

    var modules, loadScript, get, find, data, registerTab, toast, version;

 // Returns a list of registered modules.
 // @param {(err, modules)} callback
 // @param {[string]} callback.modules
    exports.modules = modules = function (callback) {
        Ganglion.modules(callback);
    };

 // Loads one or more scripts in order using HTML script elements.
 // If one script fails, the callback will be executed immediately.
 // @param {string} options
 // @param {[string]} options
 // @param {options} options
 // @param {(err, [loaded_script, loaded_script, ...])} callback
    exports.loadScript = loadScript = function (options, callback) {
        Ganglion.loadModule(options, callback);
    };

 // Performs a GET request.
 // @param {string} uri
 // @param {(err, body)} callback
 // @param {string} callback.body
    exports.get = get = function (uri, callback) {
        if (Object.toType(uri) !== "string") {
            throw new Error("Please provide a uri parameter (string).");
        }
        if (Object.toType(callback) !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        grapin.request({
            uri: uri
        }, function (err, res) {
            if (err !== null) {
                callback(err, null);
            } else {
                callback(null, res.body);
            }
        });
    };

 // Performs a GET request that treats the body of the response as JSON regardless of its Content-Type (some
 // VCS like GitHub can be used to serve raw content, but they typically don't respect the Content-Type of a file).
 // @param {string} uri
 // @param {(err, json)} callback
 // @param {object} callback.json
    get.json = function (uri, callback) {
        if (Object.toType(uri) !== "string") {
            throw new Error("Please provide a uri parameter (string).");
        }
        if (Object.toType(callback) !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        grapin.request({
            uri: uri,
            parseBody: true
        }, function (err, res) {
            if (err !== null) {
                callback(err, null);
            } else {
                if (Object.toType(res.body) === "string") {
                 // The body is still a string; force it to JSON.
                    try {
                        callback(null, JSON.parse(res.body));
                    } catch (e) {
                        callback(e, null);
                    }
                } else {
                 // The body was already parsed according to the Content-Type of the message.
                    callback(null, res.body);
                }
            }
        });
    };

 // @param {string} uri
 // @param {(err, xml)} callback
 // @param {object} callback.xml
    get.xml = function (uri, callback) {
        if (Object.toType(uri) !== "string") {
            throw new Error("Please provide a uri parameter (string).");
        }
        if (Object.toType(callback) !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        grapin.request({
            uri: uri,
            returnXML: true
        }, function (err, res) {
            if (err !== null) {
                callback(err, null);
            } else {
                callback(null, res.body);
            }
        });
    };

 // @param {string} uri
 // @param {(err, res)} callback
 // @param {object} callback.res SPARQL query results in the SPARQL 1.1 Query Results JSON Format.
    get.sparql = function (uri, callback) {
        if (Object.toType(uri) !== "string") {
            throw new Error("Please provide a uri parameter (string).");
        }
        if (Object.toType(callback) !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        grapin.request({
            uri: uri,
            headers: {
                "Accept": "application/sparql-results+json"
            },
            parseBody: true
        }, function (err, res) {
            if (err !== null) {
                callback(err, null);
            } else {
                callback(null, res.body);
            }
        });
    };

 // Performs a ranged GET request.
 // @param {string} uri
 // @param {number} startByte
 // @param {number} endByte
 // @param {(err, body)} callback
 // @param {string} callback.body
    get.range = function (uri, startByte, endByte, callback) {
        if (Object.toType(uri) !== "string") {
            throw new Error("Please provide a uri parameter (string).");
        }
        if (Object.toType(callback) !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        startByte = startByte || 0;
        endByte = endByte || 100;
        grapin.request({
            uri: uri,
            headers: {
                "Range": "bytes=" + startByte + "-" + endByte
            }
        }, function (err, res) {
            if (err !== null) {
                callback(err, null);
            } else {
                callback(null, res.body);
            }
        });
    };

    get.archive = function (uri, callback) {
        if (Object.toType(uri) !== "string") {
            throw new Error("Please provide a uri parameter (string).");
        }
        if (Object.toType(callback) !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        TarGZ.load(uri, function (files) {
         // onload
            callback(null, files);
        }, function () {
         // onstream
        }, function () {
         // onerror
            callback(new Error("Getting the URI failed. The browser log might have more details."), null);
        });
    };

 // A temporary data store.
    exports.data = {};

 // A persistent key/value store that should be backend agnostic. For now, let's start with localStorage
 // until Chromium issue 108223 (http://code.google.com/p/chromium/issues/detail?id=108223) is fixed.
    exports.store = (function () {

        var set, get, del, exists, keys, clear;

     // @param {string} key
     // @param {any} value
     // @param {string} key
     // @param {(err)} callback
        set = function (key, value, callback) {
            localStorage[key] = JSON.stringify(value);
            callback(null);
        };

     // @param {string} key
     // @param {(err, value)} callback
        get = function (key, callback) {
            exists(key, function (err, flag) {
                var value;
                if (flag === true) {
                    value = JSON.parse(localStorage[key]);
                    callback(null, value);
                } else {
                    callback(new Error("Not Found"));
                }
            });
        };

     // @param {string} key
     // @param {(err)} callback
        del = function (key, callback) {
            exists(key, function (err, flag) {
                if (flag === true) {
                    localStorage.removeItem(key);
                    callback(null);
                } else {
                    callback(new Error("Not Found"));
                }
            });
        };

     // @param {string} key
     // @param {(err, flag)} callback
        exists = function (key, callback) {
            callback(null, localStorage[key] !== undefined ? true : false);
        };

     // @param {(err, value)} callback
        keys = function (callback) {
            callback(null, Object.keys(localStorage));
        };

     // @param {(err)} callback
        clear = function (callback) {
            localStorage.clear();
            callback(null);
        };

        return {
            set: set,
            get: get,
            del: del,
            exists: exists,
            keys: keys,
            clear: clear
        };

    }());

 // Communicate with the TCGA file index.
 // @param {string} query
 // @param {(err, res)} callback
 // @param {object} callback.res SPARQL query results in the SPARQL 1.1 Query Results JSON Format.
    exports.find = find = function (query, callback) {
        var endpoint;
        if (Object.toType(query) !== "string") {
            throw new Error("Please provide a query parameter (string).");
        }
        if (Object.toType(callback) !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        endpoint = "http://agalpha.mathbiol.org/repositories/tcga?query=";
        TCGA.get.sparql(endpoint + encodeURIComponent(query), callback);
    };

 // @param {string} message Message to be displayed.
 // @param {number} duration Visible time in ms.
    exports.toast = toast = (function () {
        var toaster;
        toaster = function (type, message, duration) {
            var alert;
            duration = duration || 2000;
            alert = $("<div></div>").addClass("alert").addClass(type).hide();
            alert.append(
                $("<div></div>").addClass("container").text(message)
            );
            $(".navbar").append(alert);
            alert.fadeIn("slow");
            setTimeout(function () {
                alert.fadeOut("slow", function () {
                    $(this).remove();
                });
            }, duration);
        };
        return {
            info: function (message, duration) {
                toaster("alert-info", message, duration);
            },
            success: function (message, duration) {
                toaster("alert-success", message, duration);
            },
            error: function (message, duration) {
                toaster("alert-error", message, duration);
            }
        };
    }());

 // @param {object} options
 // @param {string} options.id The element ID of the tab pane.
 // @param {string} options.title The title of the tab.
 // @param {string} options.content The content of the tab pane.
 // @param {boolean} options.switchTab If true, immediately switch to newly created tab.
    exports.registerTab = registerTab = function (options) {
        var tab;
     // Add pane.
        $("#end-of-content").before(
            $("<div>").attr("id", options.id).addClass("tab-pane").html(options.content)
        );
     // Add tab.
        tab = $("<a>").attr("href", "#" + options.id).attr("data-toggle", "tab").html(options.title);
        $(".nav").append(
            $("<li>").append(tab)
        );
        if (options.hasOwnProperty("switchTab") && options.switchTab === true) {
            tab.tab("show");
        }
    };

    exports.version = chrome.app.getDetails().version;

}(this.TCGA = {}));
