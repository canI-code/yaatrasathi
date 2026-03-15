const fs = require('fs');

let planUtilsCode = fs.readFileSync('src/lib/planUtils.ts', 'utf8');
planUtilsCode = planUtilsCode.replace(
  'export function trimVersions(versions: PlanVersion[]): PlanVersion[] {',
  'export function trimVersions(versions: PlanVersion[], maxCount: number = 4): PlanVersion[] {'
);
planUtilsCode = planUtilsCode.replace('if (versions.length <= 4)', 'if (versions.length <= maxCount)');
planUtilsCode = planUtilsCode.replace('versions.length - 4', 'versions.length - maxCount');
fs.writeFileSync('src/lib/planUtils.ts', planUtilsCode);

