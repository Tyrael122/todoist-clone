declare interface Array<T> {
    removeAt(index: number): T | undefined
    insertAt(index: number, value: T): void
}

Array.prototype.removeAt = function removeAt(index: number) {
    return this.splice(index, 1)[0];
}

Array.prototype.insertAt = function insertAt(index: number, value: any) {
    this.splice(index, 0, value);
}