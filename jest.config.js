const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig");

require("dotenv").config();

/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    transform: {
        "^.+\\.tsx?$": ["@swc/jest"],
    },
    setupFilesAfterEnv: ["./src/tests/setup/mongo.setup.ts"],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
        prefix: "<rootDir>/",
    }),
};
