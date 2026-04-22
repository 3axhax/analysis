export const convertDaysToAge = (ageInDays: number): string => {
  if (ageInDays) {
    const rules = new Intl.PluralRules("ru-RU");
    if (ageInDays < 360) {
      const monthCount = Math.floor(ageInDays / 30);
      const form = rules.select(monthCount);
      const forms = {
        zero: "месяцев",
        one: "месяц",
        two: "месяца",
        few: "месяца",
        many: "месяцев",
        other: "месяцев",
      };
      return monthCount !== 0
        ? `${monthCount} ${forms[form]}`
        : "Меньше месяца";
    } else {
      const yearCount = Math.floor(ageInDays / 360);
      const form = rules.select(yearCount);
      const forms = {
        zero: "лет",
        one: "год",
        two: "года",
        few: "года",
        many: "лет",
        other: "лет",
      };
      return `${yearCount} ${forms[form]}`;
    }
  }
  return "";
};
