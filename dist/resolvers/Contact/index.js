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
exports.ContactResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const isAuth_1 = require("../../middleware/isAuth");
const Contact_1 = require("../../entities/Contact");
const User_1 = require("../../entities/User");
let ContactResolver = class ContactResolver {
    contact(contact, { userLoader }) {
        return userLoader.load(contact.contactId);
    }
    user(contact, { userLoader }) {
        return userLoader.load(contact.userId);
    }
    addToContacts(contactId, { req }) {
        return Contact_1.Contact.create({
            contactId,
            userId: Number(req.session.userId),
        }).save();
    }
    async getContacts({ req }) {
        const userId = Number(req.session.userId);
        const contactIds = await (0, typeorm_1.getConnection)()
            .createQueryBuilder(Contact_1.Contact, "contactInfo")
            .leftJoinAndSelect("contactInfo.contact", "contact")
            .where("contactInfo.userId = :userId", { userId })
            .orderBy("contact.firstName", "ASC")
            .getMany();
        if (contactIds.length === 0)
            return [];
        const contacts = contactIds.map((contact) => contact.contact);
        return contacts;
    }
    async removeFromContacts(contactId, { req }) {
        const userId = Number(req.session.userId);
        const contact = await Contact_1.Contact.findOne({ userId, contactId });
        if (!contact)
            throw new Error("Contact not found");
        await contact.remove();
        return true;
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Contact_1.Contact, Object]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "contact", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Contact_1.Contact, Object]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "user", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Contact_1.Contact),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("contactId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "addToContacts", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User]),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "getContacts", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("contactId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "removeFromContacts", null);
ContactResolver = __decorate([
    (0, type_graphql_1.Resolver)((of) => Contact_1.Contact)
], ContactResolver);
exports.ContactResolver = ContactResolver;
//# sourceMappingURL=index.js.map