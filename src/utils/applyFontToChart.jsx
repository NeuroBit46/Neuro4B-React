export const applyFontToChart = (option, fontFamily) => {
  const clone = JSON.parse(JSON.stringify(option));

  const applyFont = (obj, keys) => {
    keys.forEach((key) => {
      if (obj[key]) {
        obj[key].fontFamily = fontFamily;
      }
    });
  };

  if (clone.title) applyFont(clone.title, ['textStyle']);
  if (clone.legend) applyFont(clone.legend, ['textStyle']);
  if (clone.tooltip) applyFont(clone.tooltip, ['textStyle']);
  const xAxes = Array.isArray(clone.xAxis) ? clone.xAxis : [clone.xAxis];
  xAxes.forEach(axis => applyFont(axis, ['axisLabel', 'nameTextStyle']));
  const yAxes = Array.isArray(clone.yAxis) ? clone.yAxis : [clone.yAxis];
  yAxes.forEach(axis => applyFont(axis, ['axisLabel', 'nameTextStyle']));
  if (Array.isArray(clone.series)) {
    clone.series.forEach(series => {
      if (series.label && series.label.textStyle) {
        series.label.textStyle.fontFamily = fontFamily;
      } else if (series.label) {
        series.label.textStyle = { fontFamily };
      }
    });
  }

  return clone;
};
