"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const http_1 = __importDefault(require("http"));
const typeorm_1 = require("typeorm");
const express_1 = __importDefault(require("express"));
const type_graphql_1 = require("type-graphql");
const apollo_server_express_1 = require("apollo-server-express");
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const ioredis_1 = __importDefault(require("ioredis"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const User_1 = require("./entities/User");
const Message_1 = require("./entities/Message");
const Chat_1 = require("./entities/Chat");
const ChatMember_1 = require("./entities/ChatMember");
const Contact_1 = require("./entities/Contact");
const Image_1 = require("./entities/Image");
const User_2 = require("./resolvers/User");
const Message_2 = require("./resolvers/Message");
const Chat_2 = require("./resolvers/Chat");
const Contact_2 = require("./resolvers/Contact");
const Image_2 = require("./resolvers/Image");
const constants_1 = require("./constants");
const UserLoader_1 = require("./loaders/UserLoader");
const ChatMemberLoader_1 = require("./loaders/ChatMemberLoader");
const MessageLoader_1 = require("./loaders/MessageLoader");
dotenv_1.default.config();
const main = async () => {
    const connection = await typeorm_1.createConnection({
        type: "postgres",
        url: process.env.PG_DATABASE_URL,
        logging: true,
        migrations: [path_1.default.join(__dirname, "./migrations/*")],
        entities: [User_1.User, Chat_1.Chat, ChatMember_1.ChatMember, Message_1.Message, Contact_1.Contact, Image_1.Image],
    });
    await connection.runMigrations();
    const app = express_1.default();
    const httpServer = http_1.default.createServer(app);
    const RedisStore = connect_redis_1.default(express_session_1.default);
    const redis = new ioredis_1.default({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    });
    const sessionMiddleware = express_session_1.default({
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        name: constants_1.COOKIE_NAME,
        secret: process.env.REDIS_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: "lax",
        },
    });
    app.set("proxy", 1);
    app.use(cors_1.default({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use(sessionMiddleware);
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await type_graphql_1.buildSchema({
            resolvers: [
                User_2.UserResolver,
                Message_2.MessageResolver,
                Chat_2.ChatResolver,
                Contact_2.ContactResolver,
                Image_2.ImageResolver,
            ],
            validate: false,
        }),
        subscriptions: {
            path: "/",
            onConnect: (_, ws) => {
                return new Promise((res) => sessionMiddleware(ws.upgradeReq, {}, () => {
                    if (!ws.upgradeReq.session.userId) {
                        throw new Error("not authenticated");
                    }
                    res({ req: ws.upgradeReq });
                }));
            },
        },
        context: ({ req, res, connection }) => ({
            req,
            res,
            redis,
            connection,
            chatMemberLoader: ChatMemberLoader_1.chatMemberLoader(),
            userLoader: UserLoader_1.userLoader(),
            messageLoader: MessageLoader_1.messageLoader(),
        }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        path: "/",
        cors: false,
    });
    apolloServer.installSubscriptionHandlers(httpServer);
    httpServer.listen(Number(process.env.PORT), () => {
        console.log(`Server started on port ${process.env.PORT}`);
    });
};
main().catch((error) => {
    console.log(error);
});
//# sourceMappingURL=index.js.map