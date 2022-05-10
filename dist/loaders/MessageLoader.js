"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageLoader = void 0;
const typeorm_1 = require("typeorm");
const dataloader_1 = __importDefault(require("dataloader"));
const messageLoader = () => {
    let limit;
    let cursor;
    const messageLoader = new dataloader_1.default(async (chatIds) => {
        const latestMessages = await typeorm_1.getConnection().query(`
      SELECT * FROM (
        SELECT m.*,
        ROW_NUMBER() OVER(PARTITION BY "chatId" ORDER BY "createdAt" DESC) as rn
        FROM 
        public.message m
        WHERE ${cursor ? `"createdAt" < '${cursor}'::timestamp AND` : ""} "chatId" IN(${chatIds})
      ) x
      WHERE 
      x.rn < ${limit + 1}
      `);
        const messagesMap = {};
        latestMessages.forEach((message) => {
            messagesMap[message.chatId] = messagesMap[message.chatId]
                ? messagesMap[message.chatId].concat([message])
                : [message];
        });
        return chatIds.map((chatId) => messagesMap[chatId]);
    });
    return {
        getMessages({ limit: messageLimit, cursor: messageCursor, }) {
            limit = messageLimit;
            cursor = messageCursor;
            const maxLimit = 20;
            limit >= 20 ? (limit = maxLimit) : limit;
            return messageLoader;
        },
    };
};
exports.messageLoader = messageLoader;
//# sourceMappingURL=MessageLoader.js.map