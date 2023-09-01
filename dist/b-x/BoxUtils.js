export function exists(x) {
    return x !== undefined && x !== null;
}
export function isNum(x) {
    return exists(x) && typeof x === `number`;
}
export function isString(x) {
    return exists(x) && typeof x === `string`;
}
