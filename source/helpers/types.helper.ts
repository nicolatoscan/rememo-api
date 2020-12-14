const checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/;
export function checkId(id: string): boolean {
    if (!id)
        return false;
    return checkForHexRegExp.test(id);
}