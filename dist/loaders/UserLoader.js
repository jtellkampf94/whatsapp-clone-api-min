"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const User_1 = require("../entities/User");
const batchUsers = async (userIds) => {
    const users = await User_1.User.findByIds([...userIds]);
    const userMap = {};
    users.forEach((user) => {
        userMap[user.id] = user;
    });
    return userIds.map((userId) => userMap[userId]);
};
const userLoader = () => new dataloader_1.default(batchUsers);
exports.userLoader = userLoader;
//# sourceMappingURL=UserLoader.js.map