describe("TCGA", function () {
    describe("loadScript", function () {
        it("should throw if 'uri' is undefined", function () {
            expect(function () {
                TCGA.loadScript();
            }).to.throwException("Please provide a uri parameter (string or [string]).");
        });
        it("should throw if 'uri' is not a string or array of strings", function () {
            expect(function () {
                TCGA.loadScript(4711);
            }).to.throwException("Please provide a uri parameter (string or [string]).");
        });
        it("should throw if 'callback' is not a function", function () {
            expect(function () {
                TCGA.loadScript("http://tcga.github.com", 4711);
            }).to.throwException("Please provide a callback parameter (function).");
        });
        it("should fail if the given URI is invalid", function (done) {
            TCGA.loadScript("ptth://asdf", function (err, loadedScripts) {
                expect(err).to.eql({
                    name: "Error",
                    message: "Loading the script failed. The browser log might have more details."
                });
                expect(loadedScripts).to.eql([]);
                done();
            });
        });
        /*
        it("should not throw if 'uri' is an array of strings", function () {
            expect(function () {
                TCGA.loadScript(["http://tcga.github.com", "http://tcga.github.com"], function () {});
            }).to.not.throwException();
        });
        */
    });
    describe("get", function () {
        it("should throw if 'uri' is undefined", function () {
            expect(function () {
                TCGA.get();
            }).to.throwException("Please provide a uri parameter (string).");
        });
        it("should throw if 'uri' is not a string", function () {
            expect(function () {
                TCGA.get(4711);
            }).to.throwException("Please provide a uri parameter (string).");
        });
        it("should throw if 'callback' is undefined", function () {
            expect(function () {
                TCGA.get("http://tcga.github.com");
            }).to.throwException("Please provide a callback parameter (function).");
        });
        it("should throw if 'callback' is not a function", function () {
            expect(function () {
                TCGA.get("http://tcga.github.com", 4711);
            }).to.throwException("Please provide a callback parameter (function).");
        });
        it("should pass if the given URI points to TCGA", function (done) {
            TCGA.get("https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/", function (err, res) {
                expect(err).to.equal(null);
                expect(res).not.to.equal(null);
                done();
            });
        });
        it("should fail if the given URI points to TCGA, but cannot be found", function (done) {
            TCGA.get("https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/mostCertainlyA404!", function (err, res) {
                expect(err).to.eql({
                    name: "Error",
                    message: "Status Code: 404"
                });
                expect(res).to.equal(null);
                done();
            });
        });
    });
    describe("data", function () {
        beforeEach(function () {
         // TODO: Fix race condition.
            TCGA.store.clear(function () {});
        });
        describe("set", function () {
            it("should persist a key", function (done) {
                TCGA.store.set("test", "test", function (err) {
                    TCGA.store.exists("test", function (err, res) {
                        expect(err).to.equal(null);
                        expect(res).to.equal(true);
                        done();
                    });
                });
            });
            it("should retain the type of a string value", function (done) {
                TCGA.store.set("test", "This is a string.", function (err) {
                    TCGA.store.get("test", function (err, res) {
                        expect(err).to.equal(null);
                        expect(res).to.equal("This is a string.");
                        done();
                    });
                });
            });
            it("should retain the type of a number value", function (done) {
                TCGA.store.set("test", 4311, function (err) {
                    TCGA.store.get("test", function (err, res) {
                        expect(err).to.equal(null);
                        expect(res).to.equal(4311);
                        done();
                    });
                });
            });
            it("should retain the type of an object value", function (done) {
                TCGA.store.set("test", {"a": 1, "b": "two"}, function (err) {
                    TCGA.store.get("test", function (err, res) {
                        expect(err).to.equal(null);
                        expect(res).to.eql({
                            "a": 1,
                            "b": "two"
                        });
                        done();
                    });
                });
            });
            it("should retain the type of an array value", function (done) {
                TCGA.store.set("test", [1, "two"], function (err) {
                    TCGA.store.get("test", function (err, res) {
                        expect(err).to.equal(null);
                        expect(res).to.eql([1, "two"]);
                        done();
                    });
                });
            });
        });
        describe("get", function () {
            it("should fail if the key doesn't exist", function (done) {
                TCGA.store.get("hurz", function (err, res) {
                    expect(err).to.eql(new Error("Not Found"));
                    done();
                });
            });
        });
        describe("del", function () {
            it("should fail if the key doesn't exist", function (done) {
                TCGA.store.del("hurz", function (err, res) {
                    expect(err).to.eql(new Error("Not Found"));
                    done();
                });
            });
        });
        describe("keys", function () {
            it("should return an empty list if there are no keys", function (done) {
                TCGA.store.keys(function (err, res) {
                    expect(err).to.equal(null);
                    expect(res).to.eql([]);
                    done();
                });
            });
            it("should return a list of all keys", function (done) {
                TCGA.store.set("one", 1, function (err) {
                    TCGA.store.set("two", 2, function (err) {
                        TCGA.store.keys(function (err, keys) {
                            expect(keys.sort()).to.eql(["one", "two"]);
                            done();
                        });
                    });
                });
            });
        });
        describe("exists", function () {
            it("should return true if the key exists", function (done) {
                TCGA.store.set("exists", "lorem ipsum", function (err) {
                    TCGA.store.exists("exists", function (err, res) {
                        expect(err).to.equal(null);
                        expect(res).to.equal(true);
                        done();
                    });
                });
            });
            it("should return false if the key doesn't exist", function (done) {
                TCGA.store.exists("does-not-exist", function (err, res) {
                    expect(err).to.equal(null);
                    expect(res).to.equal(false);
                    done();
                });
            });
        });
    });
});
