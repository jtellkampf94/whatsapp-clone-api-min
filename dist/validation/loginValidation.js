"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = void 0;
const User_1 = require("../entities/User");
const registerValidation_1 = require("./registerValidation");
const loginValidation = async (options) => {
    let errors = [];
    if (registerValidation_1.isEmpty(options.password)) {
        errors.push({ field: "password", message: "Please enter your password" });
    }
    if (registerValidation_1.isEmpty(options.emailOrUsername)) {
        errors.push({
            field: "emailOrUsername",
            message: "Please enter email address or username",
        });
    }
    else {
        const user = await User_1.User.findOne(options.emailOrUsername.includes("@")
            ? { email: options.emailOrUsername }
            : { username: options.emailOrUsername });
        if (!user) {
            errors.push({
                field: "emailOrUsername",
                message: "Email address or username does not match any of our users",
            });
            return { errors };
        }
        if (errors.length > 0)
            return { errors };
        return { user, errors };
    }
    return { errors };
};
exports.loginValidation = loginValidation;
//# sourceMappingURL=loginValidation.js.map