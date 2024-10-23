declare interface Map<K, V> {
    getOrDefault(key: K, defaultValue: V): V
}

Map.prototype.getOrDefault = function getOrDefault(key: any, defaultValue: any) {
    return this.has(key) ? this.get(key) : defaultValue;
}