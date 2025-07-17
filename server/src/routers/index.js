"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
var trpc_1 = require("../trpc");
var workflow_1 = require("./workflow");
var user_1 = require("./user");
var execution_1 = require("./execution");
exports.appRouter = (0, trpc_1.router)({
    workflow: workflow_1.workflowRouter,
    user: user_1.userRouter,
    execution: execution_1.executionRouter,
});
