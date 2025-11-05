export function ensureStringMaxLength(string: string, maxLength: number): string {
    return string.length < maxLength - 3 ? string : `${string.substring(0, maxLength - 3)}...`;
}
