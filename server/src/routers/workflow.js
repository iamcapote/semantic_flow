"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowRouter = void 0;
var trpc_1 = require("../trpc");
var zod_1 = require("zod");
var workflow_1 = require("../schemas/workflow");
var supabase_js_1 = require("@supabase/supabase-js");
// Supabase client as fallback for direct database access
var supabase = null;
try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
        supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    }
}
catch (error) {
    console.warn('Supabase client initialization failed:', error);
    supabase = null;
}
exports.workflowRouter = (0, trpc_1.router)({
    list: trpc_1.publicProcedure.query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var userId, _c, data, error, error_1;
        var ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    if (!(ctx && ctx.prisma)) return [3 /*break*/, 1];
                    userId = 'user_placeholder';
                    return [2 /*return*/, ctx.prisma.workflow.findMany({
                            where: { userId: userId },
                            orderBy: { updatedAt: 'desc' },
                        })];
                case 1:
                    if (!supabase) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabase
                            .from('Workflow')
                            .select('*')
                            .order('updatedAt', { ascending: false })];
                case 2:
                    _c = _d.sent(), data = _c.data, error = _c.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data || []];
                case 3:
                    // Return empty array if no database available
                    console.warn('No database connection available');
                    return [2 /*return*/, []];
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _d.sent();
                    console.error('Error listing workflows:', error_1);
                    return [2 /*return*/, []];
                case 6: return [2 /*return*/];
            }
        });
    }); }),
    create: trpc_1.publicProcedure
        .input(workflow_1.CreateWorkflowInputSchema)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var userId, title, description, content, _c, data, error, error_2;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    userId = 'user_placeholder';
                    title = input.title, description = input.description, content = input.content;
                    if (!ctx.prisma) return [3 /*break*/, 1];
                    return [2 /*return*/, ctx.prisma.workflow.create({
                            data: {
                                title: title,
                                description: description,
                                content: content,
                                version: '1.0.0',
                                userId: userId,
                            },
                        })];
                case 1:
                    if (!supabase) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabase
                            .from('Workflow')
                            .insert({
                            title: title,
                            description: description,
                            content: content,
                            version: '1.0.0',
                            userId: userId,
                        })
                            .select()
                            .single()];
                case 2:
                    _c = _d.sent(), data = _c.data, error = _c.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data];
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_2 = _d.sent();
                    console.error('Error creating workflow:', error_2);
                    throw new Error('Failed to create workflow');
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    get: trpc_1.publicProcedure.input(zod_1.z.string()).query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var _c, data, error, error_3;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    if (!ctx.prisma) return [3 /*break*/, 1];
                    return [2 /*return*/, ctx.prisma.workflow.findUnique({
                            where: { id: input },
                        })];
                case 1: return [4 /*yield*/, supabase
                        .from('Workflow')
                        .select('*')
                        .eq('id', input)
                        .single()];
                case 2:
                    _c = _d.sent(), data = _c.data, error = _c.error;
                    if (error && error.code !== 'PGRST116')
                        throw error;
                    return [2 /*return*/, data];
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_3 = _d.sent();
                    console.error('Error getting workflow:', error_3);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    update: trpc_1.publicProcedure
        .input(workflow_1.UpdateWorkflowInputSchema)
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var id, data, title, description, content, isPublic, updateData, _c, updatedData, error, error_4;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    id = input.id, data = input.data;
                    title = data.title, description = data.description, content = data.content, isPublic = data.isPublic;
                    if (!ctx.prisma) return [3 /*break*/, 1];
                    return [2 /*return*/, ctx.prisma.workflow.update({
                            where: { id: id },
                            data: __assign(__assign(__assign(__assign({}, (title && { title: title })), (description !== undefined && { description: description })), (content && { content: content })), (isPublic !== undefined && { isPublic: isPublic })),
                        })];
                case 1:
                    updateData = {};
                    if (title)
                        updateData.title = title;
                    if (description !== undefined)
                        updateData.description = description;
                    if (content)
                        updateData.content = content;
                    if (isPublic !== undefined)
                        updateData.isPublic = isPublic;
                    return [4 /*yield*/, supabase
                            .from('Workflow')
                            .update(updateData)
                            .eq('id', id)
                            .select()
                            .single()];
                case 2:
                    _c = _d.sent(), updatedData = _c.data, error = _c.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, updatedData];
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_4 = _d.sent();
                    console.error('Error updating workflow:', error_4);
                    throw new Error('Failed to update workflow');
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    delete: trpc_1.publicProcedure.input(zod_1.z.string()).mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var error, error_5;
        var input = _b.input, ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    if (!ctx.prisma) return [3 /*break*/, 2];
                    return [4 /*yield*/, ctx.prisma.workflow.delete({
                            where: { id: input },
                        })];
                case 1:
                    _c.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, supabase
                        .from('Workflow')
                        .delete()
                        .eq('id', input)];
                case 3:
                    error = (_c.sent()).error;
                    if (error)
                        throw error;
                    _c.label = 4;
                case 4: return [2 /*return*/, { id: input }];
                case 5:
                    error_5 = _c.sent();
                    console.error('Error deleting workflow:', error_5);
                    throw new Error('Failed to delete workflow');
                case 6: return [2 /*return*/];
            }
        });
    }); }),
});
