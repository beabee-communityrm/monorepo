"use strict";
// TODO: Move this to it's own beabee-locale package because we use it beabee and beabee-frontend
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLocale = exports.locales = void 0;
const OptionsService_1 = __importDefault(require("#services/OptionsService"));
const de_json_1 = __importDefault(require("./de.json"));
const de_informal_json_1 = __importDefault(require("./de@informal.json"));
const en_json_1 = __importDefault(require("./en.json"));
const pt_json_1 = __importDefault(require("./pt.json"));
const ru_json_1 = __importDefault(require("./ru.json"));
const it_json_1 = __importDefault(require("./it.json"));
exports.locales = {
    de: de_json_1.default,
    "de@informal": de_informal_json_1.default,
    en: en_json_1.default,
    nl: en_json_1.default, // CNR only
    pt: pt_json_1.default,
    ru: ru_json_1.default,
    it: it_json_1.default
};
function isLocale(s) {
    return s in exports.locales;
}
exports.isLocale = isLocale;
function currentLocale() {
    return exports.locales[OptionsService_1.default.getText("locale")];
}
exports.default = currentLocale;
//# sourceMappingURL=current.js.map