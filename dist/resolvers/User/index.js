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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = exports.UserResponse = exports.FieldError = exports.PaginatedUsers = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const constants_1 = require("../../constants");
const RegisterInput_1 = require("./RegisterInput");
const LoginInput_1 = require("./LoginInput");
const User_1 = require("../../entities/User");
const Chat_1 = require("../../entities/Chat");
const Contact_1 = require("../../entities/Contact");
const ChatMember_1 = require("../../entities/ChatMember");
const isAuth_1 = require("../../middleware/isAuth");
const getAWSS3Key_1 = require("../../utils/getAWSS3Key");
const amazonS3Config_1 = require("../../config/amazonS3Config");
const registerValidation_1 = require("../../validation/registerValidation");
const loginValidation_1 = require("../../validation/loginValidation");
let PaginatedUsers = class PaginatedUsers {
};
__decorate([
    (0, type_graphql_1.Field)(() => [User_1.User]),
    __metadata("design:type", Array)
], PaginatedUsers.prototype, "users", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedUsers.prototype, "hasMore", void 0);
PaginatedUsers = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedUsers);
exports.PaginatedUsers = PaginatedUsers;
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
exports.FieldError = FieldError;
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], UserResponse.prototype, "ok", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
exports.UserResponse = UserResponse;
let UserResolver = class UserResolver {
    async contacts(user, { req }) {
        const userId = Number(req.session.userId);
        if (userId !== user.id)
            throw new Error("You are unauthorized to view contacts of this user");
        const contacts = await Contact_1.Contact.find({
            where: { userId },
            relations: ["contact"],
        });
        if (contacts.length === 0)
            return null;
        return contacts.map((contact) => contact.contact);
    }
    async chats(user, { req }) {
        const userId = Number(req.session.userId);
        if (userId !== user.id)
            throw new Error("You are unauthorized to view chat of this user");
        return (0, typeorm_1.getRepository)(Chat_1.Chat)
            .createQueryBuilder("chat")
            .where((qb) => {
            const subQuery = qb
                .subQuery()
                .select("chatMember.chatId")
                .from(ChatMember_1.ChatMember, "chatMember")
                .where("chatMember.userId = :userId")
                .getQuery();
            return "chat.id IN " + subQuery;
        })
            .setParameter("userId", userId)
            .orderBy("chat.updatedAt", "DESC")
            .getMany();
    }
    users() {
        return User_1.User.find();
    }
    async currentUser({ req }) {
        if (!req.session.userId) {
            return null;
        }
        const user = await User_1.User.findOne({ id: Number(req.session.userId) });
        if (!user) {
            return null;
        }
        return user;
    }
    async register(options, { req }) {
        const errors = await (0, registerValidation_1.registerValidation)(options);
        if (errors.length > 0) {
            return { ok: false, errors };
        }
        const hashedPassword = await bcryptjs_1.default.hash(options.password, 10);
        const user = await User_1.User.create({
            ...options,
            password: hashedPassword,
        }).save();
        req.session.userId = user.id;
        return { ok: true, user };
    }
    async login(options, { req }) {
        const { errors, user } = await (0, loginValidation_1.loginValidation)(options);
        const { password } = options;
        if (user && errors.length === 0) {
            const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordCorrect)
                return {
                    ok: false,
                    errors: [{ field: "password", message: "Password is incorrect" }],
                };
            req.session.userId = user.id;
            return { ok: true, user };
        }
        return { ok: false, errors };
    }
    async editProfile(username, firstName, lastName, about, profilePictureUrl, { req }) {
        const user = await User_1.User.findOne(Number(req.session.userId));
        if (!user)
            throw new Error("user not found");
        user.username = username;
        user.firstName = firstName;
        user.lastName = lastName;
        if (profilePictureUrl) {
            if (user.profilePictureUrl) {
                const key = (0, getAWSS3Key_1.getAWSS3Key)(user.profilePictureUrl);
                amazonS3Config_1.s3.deleteObject({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: key }, (err, data) => {
                    if (err)
                        console.log(err);
                });
            }
            user.profilePictureUrl = profilePictureUrl;
        }
        if (about)
            user.about = about;
        await user.save();
        return user;
    }
    async searchUsers(searchTerm, limit, page) {
        const limitPlusOne = limit + 1;
        const offset = limit * page;
        const users = await (0, typeorm_1.getRepository)(User_1.User)
            .createQueryBuilder("user")
            .where("user.username iLike :username", {
            username: `%${searchTerm}%`,
        })
            .orWhere("user.firstName iLike :firstName", {
            firstName: `%${searchTerm}%`,
        })
            .orWhere("user.lastName iLike :lastName", { lastName: `%${searchTerm}%` })
            .orderBy("user.username", "ASC")
            .limit(limitPlusOne)
            .offset(offset)
            .getMany();
        return {
            users: users.slice(0, limit),
            hasMore: users.length === limitPlusOne,
        };
    }
    logout({ req, res }) {
        return new Promise((resolve) => req.session.destroy((err) => {
            res.clearCookie(constants_1.COOKIE_NAME);
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }
            resolve(true);
        }));
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [User_1.User], { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "contacts", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [Chat_1.Chat], { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "chats", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User]),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "currentUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("options", { validate: true })),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterInput_1.RegisterInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("options", { validate: true })),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginInput_1.LoginInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => User_1.User),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("username")),
    __param(1, (0, type_graphql_1.Arg)("firstName")),
    __param(2, (0, type_graphql_1.Arg)("lastName")),
    __param(3, (0, type_graphql_1.Arg)("about", { nullable: true })),
    __param(4, (0, type_graphql_1.Arg)("profilePictureUrl", { nullable: true })),
    __param(5, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "editProfile", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedUsers),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("searchTerm")),
    __param(1, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Arg)("page", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "searchUsers", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)((of) => User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=index.js.map