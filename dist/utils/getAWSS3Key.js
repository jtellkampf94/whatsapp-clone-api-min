"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAWSS3Key = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getAWSS3Key = (profilePictureUrl) => {
    var _a;
    return profilePictureUrl.slice((_a = process.env.AWS_S3_BUCKET_URL) === null || _a === void 0 ? void 0 : _a.length, profilePictureUrl.length);
};
exports.getAWSS3Key = getAWSS3Key;
//# sourceMappingURL=getAWSS3Key.js.map