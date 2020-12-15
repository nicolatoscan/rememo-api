const checkForHexRegExp = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/;
export function checkId(id: string): boolean {
    if (!id)
        return false;
    return checkForHexRegExp.test(id);
}

export function trimValues(input: any): void {
    if (input && input.constructor === Object) {
        for (const prop in input) {
            if (input[prop] && input[prop].constructor !== String) {
                return trimValues(input[prop]);
            }

            if (input[prop] && input[prop].constructor === String && input[prop].length) {
                input[prop] = input[prop].trim();
            }
        }
    } else if (input && input.constructor === Array && input.length) {
        input.forEach(item => trimValues(item));
    } else if (input && input.constructor === String && input.length) {
        input = input.trim();
    }
}