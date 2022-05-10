"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValidation = exports.isEmpty = void 0;
const User_1 = require("../entities/User");
const isLengthValid = (min, max, text) => {
    if (text.length < min || text.length > max) {
        return false;
    }
    else {
        return true;
    }
};
const isEmailValid = (email) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return true;
    }
    else {
        return false;
    }
};
const isEmpty = (text) => {
    return !text || text.length === 0;
};
exports.isEmpty = isEmpty;
const registerValidation = async (options) => {
    let errors = [];
    if (exports.isEmpty(options.username)) {
        errors.push({
            field: "username",
            message: "Please enter a username",
        });
    }
    else if (!isLengthValid(5, 25, options.username)) {
        errors.push({
            field: "username",
            message: "Username must be between 5 and 25 characters long.",
        });
    }
    else {
        const usernameIsTaken = await User_1.User.findOne({
            where: { username: options.username },
        });
        if (usernameIsTaken) {
            errors.push({
                field: "username",
                message: "Username already in use.",
            });
        }
    }
    if (exports.isEmpty(options.email)) {
        errors.push({
            field: "email",
            message: "Please enter your email address",
        });
    }
    else if (!isEmailValid(options.email)) {
        errors.push({ field: "email", message: "Please enter valid email" });
    }
    else {
        const emailIsTaken = await User_1.User.findOne({
            where: { email: options.email },
        });
        if (emailIsTaken) {
            errors.push({ field: "email", message: "Email already in use." });
        }
    }
    if (exports.isEmpty(options.firstName)) {
        errors.push({
            field: "firstName",
            message: "Please enter your first name",
        });
    }
    else if (!isLengthValid(1, 25, options.firstName)) {
        errors.push({
            field: "firstName",
            message: "First name must be between 1 and 25 characters long.",
        });
    }
    if (exports.isEmpty(options.lastName)) {
        errors.push({
            field: "lastName",
            message: "Please enter your last name",
        });
    }
    else if (!isLengthValid(1, 25, options.lastName)) {
        errors.push({
            field: "lastName",
            message: "Last name must be between 1 and 25 characters long.",
        });
    }
    if (exports.isEmpty(options.password)) {
        errors.push({
            field: "password",
            message: "Please enter a password",
        });
    }
    else if (!isLengthValid(5, 25, options.password)) {
        errors.push({
            field: "password",
            message: "Password must be between 5 and 25 characters long.",
        });
    }
    return errors;
};
exports.registerValidation = registerValidation;
//# sourceMappingURL=registerValidation.js.map