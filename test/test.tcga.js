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
                expect(err).to.not.eql(null);
                expect(res).to.equal(null);
                done();
            });
        });
    });
    describe("data", function () {
        beforeEach(function (done) {
            TCGA.data.clear(function (err) {
                done();
            });
        });
        describe("set", function () {
            it("should not throw if no callback function was provided", function () {
                expect(function () {
                    TCGA.data.set("test", "test");
                }).to.not.throwException();
            });
            it("should persist a key", function (done) {
                TCGA.data.set("test", "test", function (err) {
                    TCGA.data.exists("test", function (err, res) {
                        expect(err).to.equal(null);
                        expect(res).to.equal(true);
                        done();
                    });
                });
            });
            it("should overwrite an existing key", function (done) {
                TCGA.data.set("test", "original", function (err) {
                    TCGA.data.set("test", "new", function (err) {
                        TCGA.data.get("test", function (err, res) {
                            expect(err).to.equal(null);
                            expect(res).to.equal("new");
                            done();
                        });
                    });
                });
            });
            it("should retain the type of a string value", function (done) {
                TCGA.data.set("test", "This is a string.", function (err) {
                    TCGA.data.get("test", function (err, res) {
                        expect(err).to.equal(null);
                        expect(res).to.equal("This is a string.");
                        done();
                    });
                });
            });
            it("should retain the type of a number value", function (done) {
                TCGA.data.set("test", 4311, function (err) {
                    TCGA.data.get("test", function (err, res) {
                        expect(err).to.equal(null);
                        expect(res).to.equal(4311);
                        done();
                    });
                });
            });
            it("should retain the type of an object value", function (done) {
                TCGA.data.set("test", {"a": 1, "b": "two"}, function (err) {
                    TCGA.data.get("test", function (err, res) {
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
                TCGA.data.set("test", [1, "two"], function (err) {
                    TCGA.data.get("test", function (err, res) {
                        expect(err).to.equal(null);
                        expect(res).to.eql([1, "two"]);
                        done();
                    });
                });
            });
        });
        describe("get", function () {
            it("should fail if the key doesn't exist", function (done) {
                TCGA.data.get("hurz", function (err, res) {
                    expect(err).to.eql(new Error("Not Found"));
                    done();
                });
            });
        });
        describe("del", function () {
            it("should not throw if no callback function was provided", function () {
                expect(function () {
                    TCGA.data.del("test");
                }).to.not.throwException();
            });
            it("should fail if the key doesn't exist", function (done) {
                TCGA.data.del("hurz", function (err) {
                    expect(err).to.eql(new Error("Not Found"));
                    done();
                });
            });
        });
        describe("keys", function () {
            it("should return an empty list if there are no keys", function (done) {
                TCGA.data.keys(function (err, res) {
                    expect(err).to.equal(null);
                    expect(res).to.eql([]);
                    done();
                });
            });
            it("should return a list of all keys", function (done) {
                TCGA.data.set("one", 1, function (err) {
                    TCGA.data.set("two", 2, function (err) {
                        TCGA.data.keys(function (err, keys) {
                            expect(keys.sort()).to.eql(["one", "two"]);
                            done();
                        });
                    });
                });
            });
        });
        describe("exists", function () {
            it("should return true if the key exists", function (done) {
                TCGA.data.set("exists", "lorem ipsum", function (err) {
                    TCGA.data.exists("exists", function (err, res) {
                        expect(err).to.equal(null);
                        expect(res).to.equal(true);
                        done();
                    });
                });
            });
            it("should return false if the key doesn't exist", function (done) {
                TCGA.data.exists("does-not-exist", function (err, res) {
                    expect(err).to.equal(null);
                    expect(res).to.equal(false);
                    done();
                });
            });
        });
        describe("clear", function () {
            it("should not throw if no callback function was provided", function () {
                expect(function () {
                    TCGA.data.clear();
                }).to.not.throwException();
            });
        });
    });
});
