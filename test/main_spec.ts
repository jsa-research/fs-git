/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />

/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/assert/assert.d.ts" />

import assert = require("power-assert");
import fsgit = require("../lib/fs");

import fs = require("fs");
import child_process = require("child_process");

describe("fs-git", ()=> {
    before(done => {
        if (fs.existsSync("./test/fixture/vanilla")) {
            done();
            return;
        }
        child_process.exec("git clone test/fixture/bare.git test/fixture/vanilla", ()=> {
            child_process.exec("git checkout -b develop origin/develop", {cwd: "test/fixture/vanilla"}, ()=> {
                done();
            });
        });
    });

    var matrix:{name: string; gitDir: string; }[] = [
        {
            name: "bare repository",
            gitDir: "./test/fixture/bare.git"
        },
        {
            name: "cloned repository",
            gitDir: "./test/fixture/vanilla/.git"
        }
    ];
    matrix.forEach(dirInfo => {
        it("open master branch in " + dirInfo.name, ()=> {
            return fsgit.open(dirInfo.gitDir, "master").then(fs => {
                var filelist = fs.filelist().then(files=> {
                    assert(files.length !== 0);
                    assert(files.filter(file=> file.path === "master-branch-only.js").length === 1);
                });
                var readFile = fs.readFile("subdir2/master-branch-only.js", {encoding: "utf8"}).then(content=> {
                    assert(typeof content === "string");
                });
                var exists1 = fs.exists("subdir2/master-branch-only.js").then(exists=> {
                    assert(exists === true);
                });
                var exists2 = fs.exists("develop-branch-only.js").then(exists=> {
                    assert(exists === false);
                });
                return Promise.all([filelist, readFile, exists1, exists2]);
            });
        });

        it("open develop branch in " + dirInfo.name, ()=> {
            return fsgit.open(dirInfo.gitDir, "develop").then(fs => {
                var filelist = fs.filelist().then(files=> {
                    assert(files.length !== 0);
                    assert(files.filter(file=> file.path === "develop-branch-only.js").length === 1);
                });
                var readFile = fs.readFile("subdir/develop-branch-only.js", {encoding: "utf8"}).then(content=> {
                    assert(typeof content === "string");
                });
                var exists1 = fs.exists("develop-branch-only.js").then(exists=> {
                    assert(exists === true);
                });
                var exists2 = fs.exists("master-branch-only.js").then(exists=> {
                    assert(exists === false);
                });
                return Promise.all([filelist, readFile, exists1, exists2]);
            });
        });

        it("open test-tag tag in " + dirInfo.name, ()=> {
            return fsgit.open(dirInfo.gitDir, "test-tag").then(fs => {
                var filelist = fs.filelist().then(files=> {
                    assert(files.length !== 0);
                    assert(files.filter(file=> file.path === "subdir/test.txt").length === 1);
                });
                var readFile = fs.readFile("subdir/test.txt", {encoding: "utf8"}).then(content=> {
                    assert(typeof content === "string");
                });
                var exists1 = fs.exists("subdir/test.txt").then(exists=> {
                    assert(exists === true);
                });
                var exists2 = fs.exists("master-branch-only.js").then(exists=> {
                    assert(exists === false);
                });
                return Promise.all([filelist, readFile, exists1, exists2]);
            });
        });

        it("open specific ref in " + dirInfo.name, ()=> {
            return fsgit.open(dirInfo.gitDir, "b41735").then(fs => {
                var filelist = fs.filelist().then(files=> {
                    assert(files.length !== 0);
                    assert(files.filter(file=> file.path === "subdir/test.txt").length === 1);
                });
                var readFile = fs.readFile("subdir/test.txt", {encoding: "utf8"}).then(content=> {
                    assert(typeof content === "string");
                });
                var exists1 = fs.exists("subdir/test.txt").then(exists=> {
                    assert(exists === true);
                });
                var exists2 = fs.exists("master-branch-only.js").then(exists=> {
                    assert(exists === false);
                });
                return Promise.all([filelist, readFile, exists1, exists2]);
            });
        });
    });
});
