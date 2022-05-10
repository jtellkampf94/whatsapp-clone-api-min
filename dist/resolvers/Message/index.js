"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageResolver = exports.PaginatedMessages = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const isAuth_1 = require("../../middleware/isAuth");
const Message_1 = require("../../entities/Message");
const ChatMember_1 = require("../../entities/ChatMember");
const User_1 = require("../../entities/User");
const constants_1 = require("../../constants");
let PaginatedMessages = class PaginatedMessages {
};
__decorate([
    type_graphql_1.Field(() => [Message_1.Message]),
    __metadata("design:type", Array)
], PaginatedMessages.prototype, "messages", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PaginatedMessages.prototype, "hasMore", void 0);
PaginatedMessages = __decorate([
    type_graphql_1.ObjectType()
], PaginatedMessages);
exports.PaginatedMessages = PaginatedMessages;
let MessageResolver = class MessageResolver {
    async user(message, { userLoader }) {
        return userLoader.load(message.userId);
    }
    async newMessage(newMessagePayload) {
        return newMessagePayload;
    }
    async sendMessage(text, chatId, imageUrl, { req }, pubSub) {
        const message = await Message_1.Message.create({
            text,
            chatId,
            userId: Number(req.session.userId),
            imageUrl: imageUrl ? imageUrl : undefined,
        }).save();
        await pubSub.publish(constants_1.NEW_MESSAGE, message);
        return message;
    }
    async getMessages(chatId, cursor, limit, { req }) {
        const chatMember = await ChatMember_1.ChatMember.findOne({
            where: { chatId, userId: Number(req.session.userId) },
        });
        if (!chatMember)
            throw new Error("you are not authorized to view messages of this chat");
        const realLimit = Math.min(20, limit);
        const realLimitPlusOne = realLimit + 1;
        const messages = await typeorm_1.getConnection().query(`
      SELECT m.*
      FROM public.message m
      WHERE "chatId" = ${chatId}
      ${cursor ? `AND "createdAt" < '${cursor}'::timestamp` : ""}  
      ORDER BY "createdAt" DESC
      LIMIT ${realLimitPlusOne}`);
        return {
            messages: messages.slice(0, realLimit),
            hasMore: messages.length === realLimitPlusOne,
        };
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => User_1.User),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Message_1.Message, Object]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "user", null);
__decorate([
    type_graphql_1.Subscription(() => Message_1.Message, {
        topics: constants_1.NEW_MESSAGE,
        filter: async ({ payload, context: { connection } }) => {
            const userId = Number(connection.context.req.session.userId);
            const isChatMember = await ChatMember_1.ChatMember.findOne({
                where: { userId, chatId: payload.chatId },
            });
            if (!isChatMember)
                return false;
            return true;
        },
    }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Message_1.Message]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "newMessage", null);
__decorate([
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    type_graphql_1.Mutation(() => Message_1.Message),
    __param(0, type_graphql_1.Arg("text")),
    __param(1, type_graphql_1.Arg("chatId", () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Arg("imageUrl", { nullable: true })),
    __param(3, type_graphql_1.Ctx()),
    __param(4, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "sendMessage", null);
__decorate([
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    type_graphql_1.Query(() => PaginatedMessages, { nullable: true }),
    __param(0, type_graphql_1.Arg("chatId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("cursor", { nullable: true })),
    __param(2, type_graphql_1.Arg("limit", () => type_graphql_1.Int)),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number, Object]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "getMessages", null);
MessageResolver = __decorate([
    type_graphql_1.Resolver((of) => Message_1.Message)
], MessageResolver);
exports.MessageResolver = MessageResolver;
//# sourceMappingURL=index.js.map