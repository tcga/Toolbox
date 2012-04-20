describe("TCGA", function () {
    describe("loadScript", function () {
        it("should throw if 'uri' is undefined", function () {
            expect(function () {
                TCGA.loadScript();
            }).toThrow(new Error("Please provide a uri parameter (string or [string])."));
        });
        it("should throw if 'uri' is not a string or array of strings", function () {
            expect(function () {
                TCGA.loadScript(4711);
            }).toThrow(new Error("Please provide a uri parameter (string or [string])."));
        });
        it("should throw if 'callback' is not a function", function () {
            expect(function () {
                TCGA.loadScript("http://tcga.github.com", 4711);
            }).toThrow(new Error("Please provide a callback parameter (function)."));
        });
        it("should fail if the given URI is invalid", function () {
            var callback;
            callback = jasmine.createSpy();
            TCGA.loadScript("ptth://asdf", callback);
            waitsFor(function () {
                return callback.callCount > 0;
            });
            runs(function () {
                expect(callback).toHaveBeenCalledWith({
                    name: "Error",
                    message: "Loading the script failed. The browser log might have more details."
                }, []);
            });
        });
        it("should not throw if 'uri' is an array of strings", function () {
            expect(function () {
                TCGA.loadScript(["http://tcga.github.com", "http://tcga.github.com"], function () {});
            }).not.toThrow();
        });
    });
    describe("get", function () {
        it("should throw if 'uri' is undefined", function () {
            expect(function () {
                TCGA.get();
            }).toThrow(new Error("Please provide a uri parameter (string)."));
        });
        it("should throw if 'uri' is not a string", function () {
            expect(function () {
                TCGA.get(4711);
            }).toThrow(new Error("Please provide a uri parameter (string)."));
        });
        it("should throw if 'callback' is undefined", function () {
            expect(function () {
                TCGA.get("http://tcga.github.com");
            }).toThrow(new Error("Please provide a callback parameter (function)."));
        });
        it("should throw if 'callback' is not a function", function () {
            expect(function () {
                TCGA.get("http://tcga.github.com", 4711);
            }).toThrow(new Error("Please provide a callback parameter (function)."));
        });
        it("should pass if the given URI points to TCGA", function () {
            var callback;
            callback = jasmine.createSpy();
            TCGA.get("https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/", callback);
            waitsFor(function () {
                return callback.callCount > 0;
            });
            runs(function () {
                expect(callback).not.toHaveBeenCalledWith({
                    name: "Error",
                    message: "Getting the URI failed. The browser log might have more details."
                }, null);
            });
        });
        it("should fail if the given URI points to TCGA, but cannot be found", function () {
            var callback;
            callback = jasmine.createSpy();
            TCGA.get("https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/mostCertainlyA404!", callback);
            waitsFor(function () {
                return callback.callCount > 0;
            });
            runs(function () {
                expect(callback).toHaveBeenCalledWith({
                    name: "Error",
                    message: "Status Code: 404"
                }, null);
            });
        });
    });
    describe("data", function () {
        beforeEach(function () {
         // TODO: Fix race condition.
            TCGA.data.clear(function () {});
        });
        describe("set", function () {
            it("should persist a key", function () {
                var callback;
                callback = jasmine.createSpy();
                TCGA.data.set("test", "test", function (err) {
                    TCGA.data.exists("test", callback);
                });
                waitsFor(function () {
                    return callback.callCount > 0;
                });
                runs(function () {
                    expect(callback).toHaveBeenCalledWith(null, true);
                });
            });
            it("should retain the type of a string value", function () {
                var callback;
                callback = jasmine.createSpy();
                TCGA.data.set("test", "This is a string.", function (err) {
                    TCGA.data.get("test", callback);
                });
                waitsFor(function () {
                    return callback.callCount > 0;
                });
                runs(function () {
                    expect(callback).toHaveBeenCalledWith(null, "This is a string.");
                });
            });
            it("should retain the type of a number value", function () {
                var callback;
                callback = jasmine.createSpy();
                TCGA.data.set("test", 4311, function (err) {
                    TCGA.data.get("test", callback);
                });
                waitsFor(function () {
                    return callback.callCount > 0;
                });
                runs(function () {
                    expect(callback).toHaveBeenCalledWith(null, 4311);
                });
            });
            it("should retain the type of an object value", function () {
                var callback;
                callback = jasmine.createSpy();
                TCGA.data.set("test", {"a": 1, "b": "two"}, function (err) {
                    TCGA.data.get("test", callback);
                });
                waitsFor(function () {
                    return callback.callCount > 0;
                });
                runs(function () {
                    expect(callback).toHaveBeenCalledWith(null, { "a": 1, "b": "two" });
                });
            });
            it("should retain the type of an array value", function () {
                var callback;
                callback = jasmine.createSpy();
                TCGA.data.set("test", [1, "two"], function (err) {
                    TCGA.data.get("test", callback);
                });
                waitsFor(function () {
                    return callback.callCount > 0;
                });
                runs(function () {
                    expect(callback).toHaveBeenCalledWith(null, [1, "two"]);
                });
            });
        });
        describe("get", function () {
            it("should fail if the key doesn't exist", function () {
                var callback;
                callback = jasmine.createSpy();
                TCGA.data.get("hurz", callback);
                waitsFor(function () {
                    return callback.callCount > 0;
                });
                runs(function () {
                    expect(callback).toHaveBeenCalledWith(new Error("Not Found"));
                });
            });
        });
        describe("del", function () {
            it("should fail if the key doesn't exist", function () {
                var callback;
                callback = jasmine.createSpy();
                TCGA.data.del("hurz", callback);
                waitsFor(function () {
                    return callback.callCount > 0;
                });
                runs(function () {
                    expect(callback).toHaveBeenCalledWith(new Error("Not Found"));
                });
            });
        });
        describe("keys", function () {
            it("should return an empty list if there are no keys", function () {
                var callback;
                callback = jasmine.createSpy();
                TCGA.data.keys(callback);
                waitsFor(function () {
                    return callback.callCount > 0;
                });
                runs(function () {
                    expect(callback).toHaveBeenCalledWith(null, []);
                });
            });
            it("should return a list of all keys", function () {
                var callback;
                callback = jasmine.createSpy();
                TCGA.data.set("one", 1, function (err) {
                    TCGA.data.set("two", 2, function (err) {
                        TCGA.data.keys(function (err, keys) {
                            callback(keys.sort());
                        });
                    });
                });
                waitsFor(function () {
                    return callback.callCount > 0;
                });
                runs(function () {
                 // Ouch: This is probably a bad test.
                    expect(callback).toHaveBeenCalledWith(["one", "two"]);
                });
            });
        });
        describe("exists", function () {
            it("should return true if the key exists", function () {
                var callback;
                callback = jasmine.createSpy();
                TCGA.data.set("exists", "lorem ipsum", function (err) {
                    TCGA.data.exists("exists", callback);
                });
                waitsFor(function () {
                    return callback.callCount > 0;
                });
                runs(function () {
                    expect(callback).toHaveBeenCalledWith(null, true);
                });
            });
            it("should return false if the key doesn't exist", function () {
                var callback;
                callback = jasmine.createSpy();
                TCGA.data.exists("does-not-exist", callback);
                waitsFor(function () {
                    return callback.callCount > 0;
                });
                runs(function () {
                    expect(callback).toHaveBeenCalledWith(null, false);
                });
            });
        });
    });
});
