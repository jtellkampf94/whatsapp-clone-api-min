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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMember = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Chat_1 = require("./Chat");
let ChatMember = class ChatMember extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], ChatMember.prototype, "chatId", void 0);
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], ChatMember.prototype, "userId", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Chat_1.Chat, (chat) => chat.id, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Chat_1.Chat)
], ChatMember.prototype, "chat", void 0);
__decorate([
    typeorm_1.ManyToOne(() => User_1.User, (user) => user.id),
    __metadata("design:type", User_1.User)
], ChatMember.prototype, "user", void 0);
__decorate([
    typeorm_1.Column({ default: true }),
    __metadata("design:type", Boolean)
], ChatMember.prototype, "isActive", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], ChatMember.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], ChatMember.prototype, "updatedAt", void 0);
ChatMember = __decorate([
    typeorm_1.Entity()
], ChatMember);
exports.ChatMember = ChatMember;
//# sourceMappingURL=ChatMember.js.map