// Presentation only: never change the unit sent to the API or convert a value.
const labels: Record<string, string> = {
  "%": "%",
  "g/l": "г/л",
  "g/L": "г/л",
  "g/dl": "г/дл",
  "g/dL": "г/дл",
  "mg/dl": "мг/дл",
  "mg/dL": "мг/дл",
  "10^12/l": "10^12/л",
  "10*12/L": "10^12/л",
  "10^9/l": "10^9/л",
  "10*9/L": "10^9/л",
  "10^3/ul": "10^3/мкл",
  "10^6/ul": "10^6/мкл",
  "µmol/l": "мкмоль/л",
  "umol/l": "мкмоль/л",
  "umol/L": "мкмоль/л",
  "mmole/l": "ммоль/л",
  "mmol/l": "ммоль/л",
  "mmol/L": "ммоль/л",
  fl: "фл",
  fL: "фл",
  pg: "пг",
  "mm/hour": "мм/ч",
  "mm/h": "мм/ч",
  "mkg/l": "мкг/л",
  "mcg/l": "мкг/л",
  "µg/l": "мкг/л",
  "ug/L": "мкг/л",
  "ng/ml": "нг/мл",
  "ng/mL": "нг/мл",
  "unit/l": "Ед/л",
  "U/L": "Ед/л",
  "mkUnit/l": "мкМЕ/л",
  "u[iU]/L": "мкМЕ/л",
  "µIU/L": "мкМЕ/л",
  "mUnit/l": "мМЕ/л",
  "m[iU]/L": "мМЕ/л",
  "mIU/L": "мМЕ/л",
};

export const unitLabel = (unit: string, sourceUnitText?: string) => {
  const source = sourceUnitText?.trim() || unit;
  const key = source.replace(/μ/g, "µ").replace(/\s+/g, "");
  // Unknown labels stay intact rather than guessing a physically different unit.
  return labels[key] ?? source;
};
