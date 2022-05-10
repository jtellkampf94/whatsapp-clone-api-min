"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatMemberLoader = void 0;
const typeorm_1 = require("typeorm");
const dataloader_1 = __importDefault(require("dataloader"));
const ChatMember_1 = require("../entities/ChatMember");
const batchChatMembers = async (chatIds) => {
    const chatMembers = await ChatMember_1.ChatMember.find({
        where: { chatId: typeorm_1.In([...chatIds]) },
        relations: ["user"],
    });
    const chatMemberMap = {};
    chatMembers.forEach((cm) => {
        if (chatMemberMap[cm.chatId]) {
            chatMemberMap[cm.chatId].push(cm);
        }
        else {
            chatMemberMap[cm.chatId] = [cm];
        }
    });
    return chatIds.map((chatId) => chatMemberMap[chatId]);
};
const chatMemberLoader = () => new dataloader_1.default(batchChatMembers);
exports.chatMemberLoader = chatMemberLoader;
//# sourceMappingURL=ChatMemberLoader.js.map