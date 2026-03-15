const fs = require('fs');

let ctxCode = fs.readFileSync('src/contexts/PlansContext.tsx', 'utf8');

// 1. Update interface
ctxCode = ctxCode.replace(
  'saveSection: (planId: string, sectionType: SectionType, data: unknown) => Promise<void>;',
  'saveSection: (planId: string, sectionType: SectionType, data: unknown, append?: boolean) => Promise<void>;'
);

// 2. update signature of saveSection implementation
ctxCode = ctxCode.replace(
  'async (planId: string, sectionType: SectionType, data: unknown) => {',
  'async (planId: string, sectionType: SectionType, data: unknown, append: boolean = false) => {'
);


// 3. update trimVersions calls to pass limits
// We need to inject the tier calculation. Let's do a regex replace over the trimVersions lines.
ctxCode = ctxCode.replace(/const trimmed = trimVersions\(allVersions\);/g, 
  \const tier = (localStorage.getItem('ys_plan_tier') ?? 'free') as 'free' | 'basic' | 'pro';
        const maxVersions = tier === 'pro' ? 10 : tier === 'basic' ? 6 : 4;
        const trimmed = trimVersions(allVersions, maxVersions);\);

// 4. Update the save data payload to handle append
// Find this block:
//         // 4. Update the existing section
//        await supabase
//          .from('plan_sections')
//          .update({ data, saved_at: new Date().toISOString() })
//          .eq('id', existingSection.id);
const updateBlock = \        // 4. Update the existing section
        let newData = data;
        if (append && Array.isArray(data) && Array.isArray(existingSection.data)) {
          // Merge arrays, maybe prevent exact dupes if we can, but a simple concat is fine
          // Let's at least avoid pushing the exact same object reference (though they are new objects here)
          newData = [...existingSection.data, ...data];
        } else if (append && typeof data === 'object' && data !== null && typeof existingSection.data === 'object' && existingSection.data !== null && !Array.isArray(data)) {
           newData = { ...existingSection.data, ...data };
        }

        await supabase
          .from('plan_sections')
          .update({ data: newData, saved_at: new Date().toISOString() })
          .eq('id', existingSection.id);\;

ctxCode = ctxCode.replace(
/        \/\/ 4. Update the existing section\s+await supabase\s+\.from\('plan_sections'\)\s+\.update\(\{ data, saved_at: new Date\(\)\.toISOString\(\) \}\)\s+\.eq\('id', existingSection\.id\);/,
 updateBlock
);

fs.writeFileSync('src/contexts/PlansContext.tsx', ctxCode);

