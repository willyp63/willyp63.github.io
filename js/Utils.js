const formatNumber = num => {
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4
  });
};

const formatPercent = num => {
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    style: "percent"
  });
};

const formatCurrency = num => {
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    style: "currency",
    currency: "USD"
  });
};
