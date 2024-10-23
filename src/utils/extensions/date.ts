declare interface Date {
  addDays(numDays: number): Date;
  removeDays(numDays: number): Date;
  withoutTime(): Date;
  toISODateString(): string;
}

Date.prototype.removeDays = function removeDays(numDays: number) {
  let newDate = new Date(this);
  newDate.setDate(newDate.getDate() - numDays);

  return newDate;
};

Date.prototype.addDays = function addDays(numDays: number) {
  let newDate = new Date(this);
  newDate.setDate(newDate.getDate() + numDays);

  return newDate;
};

Date.prototype.withoutTime = function withoutTime() {
  const newDate = new Date(this);
  newDate.setHours(0, 0, 0, 0);

  return newDate;
};

Date.prototype.toISODateString = function toISODateString() {
  return this.toISOString().split("T")[0];
};