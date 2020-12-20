var Tokens;
(function (Tokens) {
    Tokens[Tokens["StringLit"] = 0] = "StringLit";
    Tokens[Tokens["IntLit"] = 1] = "IntLit";
    Tokens[Tokens["FloatLit"] = 2] = "FloatLit";
    Tokens[Tokens["ID"] = 3] = "ID";
    Tokens[Tokens["FunctionDecl"] = 4] = "FunctionDecl";
    Tokens[Tokens["FunctionCall"] = 5] = "FunctionCall";
    Tokens[Tokens["GlobalVar"] = 6] = "GlobalVar";
    Tokens[Tokens["VarDelete"] = 7] = "VarDelete";
    Tokens[Tokens["VarGet"] = 8] = "VarGet";
    Tokens[Tokens["VarSet"] = 9] = "VarSet";
    Tokens[Tokens["VarExists"] = 10] = "VarExists";
    Tokens[Tokens["DynamicVarDelete"] = 11] = "DynamicVarDelete";
    Tokens[Tokens["DynamicVarGet"] = 12] = "DynamicVarGet";
    Tokens[Tokens["DynamicVarSet"] = 13] = "DynamicVarSet";
    Tokens[Tokens["DynamicVarExists"] = 14] = "DynamicVarExists";
})(Tokens || (Tokens = {}));
function isLetter(c) {
    let code = c.charCodeAt(0);
    return (65 <= code && code <= 90) || (97 <= code && code <= 122);
}
function isNumber(c) {
    let code = c.charCodeAt(0);
    return 48 <= code && code <= 57;
}
function tokenize(text) {
    let currentLine = 1;
    let currentColumn = 1;
    let pos = 0;
    let spelling = "";
    let tokens = [];
    let currentChar = text.charAt(0);
    pos++;
    function skip() {
        switch (currentChar) {
            case 'r': break;
            case '\n':
                currentColumn = 1;
                currentLine++;
                break;
            case '\t':
                currentColumn += 4;
                break;
            default:
                currentColumn++;
                break;
        }
        currentChar = text.charAt(pos++);
    }
    function accept() {
        spelling += currentChar;
        skip();
    }
    while (pos <= text.length) {
        spelling = "";
        let start = { line: currentLine, column: currentColumn };
        let type;
        switch (currentChar) {
            case '#':
                while (currentChar != '\n') {
                    skip();
                }
                skip();
                continue;
            case ' ':
            case '\r':
            case '\n':
            case '\t':
                skip();
                continue;
            case '"':
                skip();
                while (currentChar != '"') {
                    accept();
                }
                skip();
                type = Tokens.StringLit;
                break;
            case '<':
                skip();
                if (currentChar != '-') {
                    throw `Unexpected token '${currentChar}'`;
                }
                skip();
                if (currentChar == '!') {
                    skip();
                    type = Tokens.DynamicVarGet;
                }
                else {
                    type = Tokens.VarGet;
                }
                break;
            case '-':
                skip();
                switch (currentChar) {
                    case '-':
                        skip();
                        type = Tokens.VarDelete;
                        break;
                    case '>':
                        skip();
                        type = Tokens.VarSet;
                        break;
                    case '?':
                        skip();
                        type = Tokens.VarExists;
                        break;
                    default:
                        if (isNumber(currentChar)) {
                            while (isNumber(currentChar)) {
                                accept();
                            }
                            if (currentChar == ".") {
                                accept();
                                while (isNumber(currentChar)) {
                                    accept();
                                }
                                type = Tokens.FloatLit;
                            }
                            else {
                                type = Tokens.IntLit;
                            }
                        }
                        else {
                            throw `Unexpected token '${currentChar}'`;
                        }
                }
                break;
            case '$':
                skip();
                type = Tokens.GlobalVar;
                break;
            case '@':
                skip();
                type = Tokens.FunctionCall;
                break;
            case ':':
                skip();
                type = Tokens.FunctionDecl;
                break;
            default:
                if (isLetter(currentChar)) {
                    while (isLetter(currentChar) || isNumber(currentChar) || currentChar == '_') {
                        accept();
                    }
                    type = Tokens.ID;
                }
                else if (isNumber(currentChar)) {
                    while (isNumber(currentChar)) {
                        accept();
                    }
                    if (currentChar == ".") {
                        accept();
                        while (isNumber(currentChar)) {
                            accept();
                        }
                        type = Tokens.FloatLit;
                    }
                    else {
                        type = Tokens.IntLit;
                    }
                }
                else {
                    throw `Unknown token '${currentChar}'`;
                }
                break;
        }
        tokens.push({
            type,
            spelling,
            position: start
        });
    }
    return tokens;
}
function makeCode(tokens) {
}
const fs = require("fs");
let text = fs.readFileSync("D:/Daten/Dokumente/creeperworld3/WorldEditor/csm/scripts/FlipEmitter.crpl", { encoding: "utf-8" });
let tokens = tokenize(text);
