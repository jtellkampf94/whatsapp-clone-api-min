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
exports.ChatResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const isAuth_1 = require("../../middleware/isAuth");
const Chat_1 = require("../../entities/Chat");
const ChatMember_1 = require("../../entities/ChatMember");
const User_1 = require("../../entities/User");
const Message_1 = require("../../entities/Message");
let ChatResolver = class ChatResolver {
    async messages(chat, { messageLoader }, limit, cursor) {
        return messageLoader.getMessages({ limit, cursor }).load(chat.id);
    }
    async members(chat, { chatMemberLoader, req }) {
        const chatMembers = await chatMemberLoader.load(chat.id);
        return chatMembers
            .map((cm) => cm.user)
            .filter((user) => user.id !== Number(req.session.userId));
    }
    async createChat(userIds, groupName, groupAvatarUrl, { req }) {
        const createdById = Number(req.session.userId);
        userIds.push(createdById);
        if (userIds.length > 2 && !groupName)
            throw new Error("group name required");
        if (userIds.length === 2 && !groupName) {
            const firstUserId = userIds[0];
            const secondUserId = userIds[1];
            const chat = await (0, typeorm_1.getConnection)().query(`
        SELECT c.*
          FROM public.chat c 
            INNER JOIN public.chat_member m1 
              ON m1."chatId" = c.id AND m1."userId" = ${firstUserId}
            INNER JOIN public.chat_member m2 
              ON m2."chatId" = c.id AND m2."userId" = ${secondUserId}
          WHERE 
            c."groupName" IS NULL
        `);
            if (chat.length === 1)
                return chat[0];
        }
        const chat = await (0, typeorm_1.getManager)().transaction(async (transactionalEntityManager) => {
            const chat = await transactionalEntityManager.save(Chat_1.Chat.create({
                createdById,
                groupName,
                groupAvatarUrl,
            }));
            const chatMembers = userIds.map((userId) => ({ userId, chatId: chat.id }));
            await transactionalEntityManager
                .createQueryBuilder()
                .insert()
                .into(ChatMember_1.ChatMember)
                .values(chatMembers)
                .execute();
            return chat;
        });
        return chat;
    }
    getChats({ req }) {
        const userId = Number(req.session.userId);
        return (0, typeorm_1.getConnection)()
            .createQueryBuilder()
            .select("chat")
            .from(Chat_1.Chat, "chat")
            .leftJoin("chat.chatMembers", "chatMember")
            .where("chat.createdById = :createdById", { createdById: userId })
            .orWhere("chatMember.userId = :userId", { userId })
            .orderBy("chat.updatedAt", "DESC")
            .getMany();
    }
    async getChat(chatId, { req }) {
        const chat = await Chat_1.Chat.findOne({
            where: { id: chatId },
            relations: ["chatMembers"],
        });
        if (!chat)
            throw new Error("no chat has this Id");
        const userId = Number(req.session.userId);
        const isChatMember = chat.chatMembers.find((cm) => cm.userId === userId);
        if (!isChatMember) {
            throw new Error("you are not authorized to view chat");
        }
        return chat;
    }
    async exitChat(chatId, { req }) {
        const userId = Number(req.session.userId);
        const chat = await Chat_1.Chat.findOne(chatId);
        if (!chat)
            throw new Error("chat does not exist");
        const chatMember = await ChatMember_1.ChatMember.findOne({ chatId, userId });
        if (!chatMember)
            throw new Error("unauthorized");
        chatMember.isActive = false;
        await chatMember.save();
        return true;
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [Message_1.Message], { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __param(2, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int)),
    __param(3, (0, type_graphql_1.Arg)("cursor", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Chat_1.Chat, Object, Number, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "messages", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [User_1.User]),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Chat_1.Chat, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "members", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Chat_1.Chat),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("userIds", () => [type_graphql_1.Int])),
    __param(1, (0, type_graphql_1.Arg)("groupName", { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("groupAvatarUrl", { nullable: true })),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, String, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "createChat", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Chat_1.Chat]),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "getChats", null);
__decorate([
    (0, type_graphql_1.Query)(() => Chat_1.Chat),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("chatId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "getChat", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("chatId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ChatResolver.prototype, "exitChat", null);
ChatResolver = __decorate([
    (0, type_graphql_1.Resolver)((of) => Chat_1.Chat)
], ChatResolver);
exports.ChatResolver = ChatResolver;
//# sourceMappingURL=index.js.map