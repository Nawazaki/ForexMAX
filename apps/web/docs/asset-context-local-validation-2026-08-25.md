# Asset Context Local Validation

## 25 August 2026

The local `Gold macro drivers` route at `/markets/assets/gold-macro-drivers` was checked after rendering the new asset-context template.

| Requirement | Observed result |
|---|---|
| Real input context | The page showed dated nominal yield, real yield, broad-dollar, CPI-U, and unemployment observations with direct BLS/FRED links. |
| No fabricated gold price | The introduction explicitly says that no current gold-price contract is active and does not show a price, target, or price chart. |
| No unsupported bias | The driver section states evidence requirements and does not label any factor bullish, bearish, or neutral. |
| Event safety | The release-watch panel links official publisher pages but says that event details are not populated until they are retrieved and verified. |
| Responsive visual structure | The desktop render presented a clear editorial header, source table, context columns, driver evidence, and publication boundary without an empty placeholder module. |
