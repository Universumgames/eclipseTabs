var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { saveDataInFirefox } from './getter.js';
document.addEventListener("DOMContentLoaded", () => setup());
var button;
function setup() {
    button = document.getElementById("inputJSONSubmit");
    button.onclick = onClickButton;
}
function onClickButton(event) {
    var json = document.getElementById("jsonInput");
    var text = json.value;
    importData(text);
}
export function importData(json) {
    return __awaiter(this, void 0, void 0, function* () {
        var jsonData = JSON.parse(json);
        yield saveDataInFirefox(jsonData);
    });
}
//# sourceMappingURL=importHandler.js.map