"use strict";
// Semantic Logic AI Workflow Builder - Backend Setup
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
// All Prisma/database logic removed: stateless, in-memory only
exports.createServer = createServer;
var fastify_1 = require("fastify");
var fastify_2 = require("@trpc/server/adapters/fastify");
var cors_1 = require("@fastify/cors");
var context_1 = require("./src/context");
var routers_1 = require("./src/routers");
// In-memory stores for stateless backend
const providerConfigStore = {};
const workflowStore = {};
let workflowIdCounter = 1;
// Create and configure Fastify server
function createServer() {
    return __awaiter(this, void 0, void 0, function () {
        var fastify;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fastify = (0, fastify_1.default)({
                        logger: true,
                        trustProxy: true
                    });
    // No Prisma client: stateless, in-memory only
                    // Register CORS plugin
                    return [4 /*yield*/, fastify.register(cors_1.default, {
                            origin: process.env.CORS_ORIGIN || true,
                            credentials: true
                        })];
                case 1:
                    // Register CORS plugin
                    _a.sent();
                    // Register tRPC plugin
                    return [4 /*yield*/, fastify.register(fastify_2.fastifyTRPCPlugin, {
                            prefix: '/api/trpc',
                            trpcOptions: {
                                router: routers_1.appRouter,
                                createContext: context_1.createContext
                            }
                        })];
                case 2:
                    // Register tRPC plugin
                    _a.sent();
                    // Health check endpoint
                    fastify.get('/health', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, { status: 'ok', timestamp: new Date().toISOString() }];
                        });
                    }); });
    // GET /api/user - Always return mock user
    fastify.get('/api/user', async function (req, reply) {
        reply.send({
            id: '00000000-0000-0000-0000-000000000000',
            email: 'demo@semantic.app',
            name: 'Demo User',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    });

    // GET /api/providers - Return all provider configs for demo user (stateless)
    fastify.get('/api/providers', async function (req, reply) {
        const userId = 'demo-user';
        let providers = providerConfigStore[userId];
        if (!providers) {
            providers = [
                {
                    providerId: 'openai',
                    name: 'OpenAI',
                    baseURL: 'https://api.openai.com/v1',
                    models: { models: ['gpt-4o', 'gpt-4'] },
                    isActive: true,
                    headers: {},
                    userId: userId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            providerConfigStore[userId] = providers;
        }
        reply.send(providers);
    });

    // POST /api/providers - Upsert provider config (stateless)
    fastify.post('/api/providers', async function (req, reply) {
        try {
            const { providerId, name, baseURL, models, isActive, headers, userId } = req.body;
            if (!providerId || !userId) {
                return reply.code(400).send({ error: 'Invalid provider config' });
            }
            let modelsObj;
            if (Array.isArray(models)) {
                modelsObj = { models };
            } else if (models && typeof models === 'object' && Array.isArray(models.models)) {
                modelsObj = models;
            } else {
                modelsObj = { models: [] };
            }
            if (!providerConfigStore[userId]) providerConfigStore[userId] = [];
            let idx = providerConfigStore[userId].findIndex(p => p.providerId === providerId);
            let upserted;
            if (idx >= 0) {
                providerConfigStore[userId][idx] = {
                    providerId, name, baseURL, models: modelsObj, isActive, headers, userId,
                    updatedAt: new Date().toISOString(),
                    createdAt: providerConfigStore[userId][idx].createdAt || new Date().toISOString()
                };
                upserted = providerConfigStore[userId][idx];
            } else {
                upserted = {
                    providerId, name, baseURL, models: modelsObj, isActive, headers, userId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                providerConfigStore[userId].push(upserted);
            }
            reply.send({ success: true, provider: upserted });
        } catch (err) {
            console.error('POST /api/providers error:', err);
            reply.code(500).send({ error: err.message, details: err });
        }
    });

    // GET /api/workflows - Return all workflows for demo user (stateless)
    fastify.get('/api/workflows', async function (req, reply) {
        const userId = 'demo-user';
        let workflows = workflowStore[userId];
        if (!workflows) {
            workflows = [
                {
                    id: 'demo-workflow',
                    title: 'Demo Workflow',
                    description: 'A mock workflow for testing',
                    content: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
                    isPublic: true,
                    userId: userId,
                    version: '1.0.0',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            workflowStore[userId] = workflows;
        }
        reply.send(workflows);
    });

    // POST /api/workflows - Create workflow (stateless)
    fastify.post('/api/workflows', async function (req, reply) {
        try {
            const { title, description, content, userId } = req.body;
            if (!title || !userId) {
                return reply.code(400).send({ error: 'Invalid workflow creation' });
            }
            if (!workflowStore[userId]) workflowStore[userId] = [];
            const workflow = {
                id: `wf-${workflowIdCounter++}`,
                title,
                description,
                content: content || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
                isPublic: true,
                userId,
                version: '1.0.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            workflowStore[userId].push(workflow);
            reply.code(201).send(workflow);
        } catch (err) {
            reply.code(500).send({ error: err.message });
        }
    });
                    return [2 /*return*/, fastify];
            }
        });
    });
}
// Export a getApp function for testing (Supertest)
function getApp() {
    return __awaiter(this, void 0, void 0, function () {
        var server;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Create and fully initialize the Fastify server for Supertest
                    return [4 /*yield*/, createServer()];
                case 1:
                    server = _a.sent();
                    // Wait for all plugins and routes to be ready
                    return [4 /*yield*/, server.ready()];
                case 2:
                    _a.sent();
                    // Return the underlying Node HTTP server for Supertest
                    return [2 /*return*/, { server: server.server }];
            }
        });
    });
}
exports.getApp = getApp;
// Start the server if this file is run directly
if (require.main === module) {
    var PORT_1 = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    var start = function () { return __awaiter(void 0, void 0, void 0, function () {
        var server, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, createServer()];
                case 1:
                    server = _a.sent();
                    return [4 /*yield*/, server.listen({ port: PORT_1, host: '0.0.0.0' })];
                case 2:
                    _a.sent();
                    console.log("\uD83D\uDE80 tRPC Server listening on port ".concat(PORT_1));
                    console.log("\uD83D\uDCCA Health check: http://localhost:".concat(PORT_1, "/health"));
                    console.log("\uD83D\uDD17 tRPC API: http://localhost:".concat(PORT_1, "/api/trpc"));
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('❌ Error starting server:', err_1);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    start();
}
