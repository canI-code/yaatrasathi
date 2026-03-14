const fs = require('fs');

let tp = fs.readFileSync('src/pages/TripPlanner.tsx', 'utf8');

tp = tp.replace(/\{!\!loading && \!plan && \(/, '{true && (');
tp = tp.replace(/\{\!loading && \!plan && \(/, '{true && ('); // fallback

const oldFormGridRegex = /<div\s*style=\{\{\s*display: "grid",\s*gridTemplateColumns: "repeat\(auto-fit, minmax\(300px, 1fr\)\)",[\s\S]*?(?=<\!-- Generate Button -->)/;

const newFormGrid = 
<Card padding="clamp(24px, 4vw, 40px)" style={{ marginBottom: plan ? "40px" : "0" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "24px",
                  }}
                >
                  <Input label="Source City" placeholder="e.g. Delhi, Mumbai, Bangalore" value={source} onChange={(e) => setSource(e.target.value)} error={errors.source} rightIcon={<GetLocationButton onLocation={setSource} />} />
                  
                  <Input label="Destination City" placeholder="e.g. Goa, Manali, Kerala" value={destination} onChange={(e) => setDestination(e.target.value)} error={errors.destination} rightIcon={<GetLocationButton onLocation={setDestination} />} />

                  <Input label="Number of Days" type="number" min={1} max={999} value={days} onChange={(e) => { const v = parseInt(e.target.value || "0", 10); if(v <= 999) setDays(v); }} />

                  <Input label="Number of Travellers" type="number" min={1} max={999} value={travelers} onChange={(e) => { const v = parseInt(e.target.value || "0", 10); if(v <= 999) setTravelers(v); }} />

                  <Select label="Budget Level" options={BUDGET_OPTIONS} value={budgetLevel} onChange={(e) => setBudgetLevel(e.target.value)} />

                  <Select label="Travel Style" options={STYLE_OPTIONS} value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)} />

                  {/* Interests — full width */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(61, 60, 58, 0.45)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.02em" }}> Interests (select all that apply)</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                      {INTEREST_OPTIONS.map((interest) => {
                        const active = interests.includes(interest);
                        return (
                          <motion.button
                            key={interest}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => toggleInterest(interest)}
                            style={{
                              padding: "7px 14px",
                              borderRadius: "20px",
                              border: active ? "1px solid rgba(42, 157, 143,0.6)" : "1px solid rgba(0, 0, 0, 0.05)",
                              background: active ? "rgba(42, 157, 143, 0.1)" : "rgba(0, 0, 0, 0.02)",
                              color: active ? "#2A9D8F" : "rgba(61, 60, 58,0.65)",
                              fontSize: "0.78rem", cursor: "pointer", fontFamily: "Inter, sans-serif"
                            }}
                          >
                            {interest}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <Select label="Dietary Preference" options={FOOD_OPTIONS} value={foodPref} onChange={(e) => setFoodPref(e.target.value)} />

                  <Input label="Special Requirements" placeholder="e.g. Accessibility needs, allergies" value={specialReqs} onChange={(e) => setSpecialReqs(e.target.value)} />
                </div>
                {/* Wrap button bottom area inside */}
;

tp = tp.replace(/\{\/\* Form card \*\/\}\s*<div\s*style=\{\{\s*padding: "clamp\(24px, 4vw, 40px\)",[\s\S]*?boxShadow: "0 2px 8px rgba\(0, 0, 0, 0\.04\)",\s*\}\}\s*>\s*<div\s*style=\{\{\s*display: "grid",\s*gridTemplateColumns: "repeat\(auto-fit, minmax\(300px, 1fr\)\)",[\s\S]*?(?=<\!-- Generate Button -->)/, newFormGrid);
tp = tp.replace(/<\!-- Generate Button -->/, '{/* Generate Button */}'); // oops, my regex lookahead might fail if comment is wrong
tp = tp.replace(/\{\/\* Generate Button \*\/\}/g, '{/* Generate Button */}'); 

fs.writeFileSync('src/pages/TripPlanner.tsx', tp);
console.log('done regexing form card');
