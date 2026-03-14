const fs = require('fs');
let code = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

code = code.replace(/<div[^>]*?>\s*<GlassInput\s*placeholder="e\.g\. Delhi, Mumbai, Bangalore"[\s\S]*?<\/div>\s*<\/div>/, '<Input label="Source City" placeholder="e.g. Delhi, Mumbai, Bangalore" value={source} onChange={(e) => setSource(e.target.value)} error={errors.source} rightIcon={<GetLocationButton onLocation={setSource} />} />');

code = code.replace(/<div>\s*<FieldLabel> Destination City<\/FieldLabel>\s*<div[^>]*?>\s*<GlassInput\s*placeholder="e\.g\. Goa, Manali, Kerala"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '<Input label="Destination City" placeholder="e.g. Goa, Manali, Kerala" value={destination} onChange={(e) => setDestination(e.target.value)} error={errors.destination} rightIcon={<GetLocationButton onLocation={setDestination} />} />');

code = code.replace(/<div>\s*<FieldLabel> Number of Days<\/FieldLabel>\s*<GlassInput\s*type=\"number\"\s*min=\{1\}\s*max=\{999\}\s*value=\{days\}\s*onChange=\{\(e\) => setDays\(Number\(e\.target\.value\)\)\}\s*placeholder=\"e\.g\. 5\"\s*\/>\s*<\/div>/g, '<Input label="Number of Days" type="number" min={1} max={999} value={days} onChange={(e) => { const v = parseInt(e.target.value || "0", 10); if(v <= 999) setDays(v); }} />');

code = code.replace(/<div>\s*<FieldLabel> Number of Travellers<\/FieldLabel>\s*<GlassInput\s*type=\"number\"\s*min=\{1\}\s*max=\{999\}\s*value=\{travelers\}\s*onChange=\{\(e\) => setTravelers\(Number\(e\.target\.value\)\)\}\s*placeholder=\"e\.g\. 2\"\s*\/>\s*<\/div>/g, '<Input label="Number of Travellers" type="number" min={1} max={999} value={travelers} onChange={(e) => { const v = parseInt(e.target.value || "0", 10); if(v <= 999) setTravelers(v); }} />');

code = code.replace(/<div>\s*<FieldLabel> Budget Level<\/FieldLabel>\s*<CustomSelect\s*options=\{BUDGET_OPTIONS\}\s*value=\{budgetLevel\}\s*onChange=\{setBudgetLevel\}\s*\/>\s*<\/div>/g, '<Select label="Budget Level" options={BUDGET_OPTIONS} value={budgetLevel} onChange={(e: any) => setBudgetLevel(e.target.value)} />');

code = code.replace(/<div>\s*<FieldLabel> Travel Style<\/FieldLabel>\s*<CustomSelect\s*options=\{STYLE_OPTIONS\}\s*value=\{travelStyle\}\s*onChange=\{setTravelStyle\}\s*\/>\s*<\/div>/g, '<Select label="Travel Style" options={STYLE_OPTIONS} value={travelStyle} onChange={(e: any) => setTravelStyle(e.target.value)} />');

code = code.replace(/<div>\s*<FieldLabel> Dietary Preference<\/FieldLabel>\s*<CustomSelect\s*options=\{FOOD_OPTIONS\}\s*value=\{foodPref\}\s*onChange=\{setFoodPref\}\s*\/>\s*<\/div>/g, '<Select label="Dietary Preference" options={FOOD_OPTIONS} value={foodPref} onChange={(e: any) => setFoodPref(e.target.value)} />');

fs.writeFileSync('src/pages/TripPlanner.tsx', code);
