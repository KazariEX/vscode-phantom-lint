/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as ts from "typescript"
export { version } from "vscode"

type T = {}

let a = 1
a = 2

if (true) {
    console.log(1)
}

for (let i = 0; i < 1; i++) {
    continue
}

do {
    break
} while (1)

class Class {
    a: number
    b = 1
    c = function() {}
    d() {}
    get e() { return 1 }
}

function func1() {}
const func2 = function () {}

export default {}