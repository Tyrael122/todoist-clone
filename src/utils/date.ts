import "./extensions/date"

export function dateFromIsoString(string: string): Date {
  const dateParts = string.split("T")[0].split("-");
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]);
  const day = parseInt(dateParts[2]);

  return new Date(year, month - 1, day);
}

export function buildDateList(startingDate: Date): string[] {
  let currentDate = startingDate;
  let endDate = startingDate.addDays(5);

  const dateList = [];

  while (currentDate < endDate) {
    dateList.push(currentDate.toISOString());

    currentDate = currentDate.addDays(1);
  }

  return dateList;
}