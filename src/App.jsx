import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "hershey-trip-checks";
const CUSTOM_ITEMS_KEY = "hershey-trip-custom-items";
const TAB_KEY = "hershey-trip-tab";
const DAYS_KEY = "hershey-trip-expanded-days";

const initialChecks = {};

function App() {
  const [tab, setTabState] = useState(() => localStorage.getItem(TAB_KEY) || "itinerary");
  const setTab = (t) => { setTabState(t); localStorage.setItem(TAB_KEY, t); };
  const [checks, setChecks] = useState(initialChecks);
  const [customItems, setCustomItems] = useState({});
  const [expandedDays, setExpandedDays] = useState(() => {
    try { const s = localStorage.getItem(DAYS_KEY); if (s) return JSON.parse(s); } catch (e) {}
    return { thu: true, fri: false, sat: false, sun: false };
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setChecks(JSON.parse(stored));
    } catch (e) { /* first load */ }
    try {
      const storedCustom = localStorage.getItem(CUSTOM_ITEMS_KEY);
      if (storedCustom) setCustomItems(JSON.parse(storedCustom));
    } catch (e) {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checks)); } catch (e) {}
  }, [checks, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(customItems)); } catch (e) {}
  }, [customItems, loaded]);

  const toggle = useCallback((id) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const addCustomItem = useCallback((sectionId, label) => {
    const item = { id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, label };
    setCustomItems(prev => ({ ...prev, [sectionId]: [...(prev[sectionId] || []), item] }));
  }, []);

  const removeCustomItem = useCallback((sectionId, itemId) => {
    setCustomItems(prev => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).filter(i => i.id !== itemId)
    }));
    setChecks(prev => { const next = { ...prev }; delete next[itemId]; return next; });
  }, []);

  const toggleDay = (day) => setExpandedDays(prev => {
    const next = { ...prev, [day]: !prev[day] };
    try { localStorage.setItem(DAYS_KEY, JSON.stringify(next)); } catch (e) {}
    return next;
  });

  const countChecked = (prefix) => {
    return Object.keys(checks).filter(k => k.startsWith(prefix) && checks[k]).length;
  };

  const countCustomChecked = (sectionId) => {
    const items = customItems[sectionId] || [];
    return items.filter(i => checks[i.id]).length;
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Avenir', sans-serif", background: "#FAF6F1", minHeight: "100vh", color: "#3B2314" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <header style={{ background: "linear-gradient(135deg, #5B2C0E 0%, #8B4513 50%, #6B3410 100%)", color: "#fff", padding: "28px 20px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 20% 80%, rgba(255,200,100,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.5px", position: "relative" }}>
          🍫 Hershey Family Trip
        </h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: "14px", fontWeight: 500, position: "relative" }}>
          April 9–12, 2026 · Moorestown → Hershey, PA
        </p>
      </header>

      <nav style={{ display: "flex", background: "#fff", borderBottom: "2px solid #E8DDD4", position: "sticky", top: 0, zIndex: 10 }}>
        {[
          { id: "itinerary", label: "Itinerary", icon: "📅" },
          { id: "packing", label: "Packing", icon: "🧳" },
          { id: "grocery", label: "Grocery", icon: "🛒" },
          { id: "tickets", label: "Tickets", icon: "🎟️" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "12px 6px 10px", border: "none", background: tab === t.id ? "#FAF6F1" : "#fff",
            borderBottom: tab === t.id ? "3px solid #8B4513" : "3px solid transparent",
            color: tab === t.id ? "#5B2C0E" : "#9B8B7A", fontWeight: tab === t.id ? 700 : 500,
            fontSize: "12px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "2px"
          }}>
            <span style={{ fontSize: "18px" }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>
        {tab === "itinerary" && <Itinerary expandedDays={expandedDays} toggleDay={toggleDay} />}
        {tab === "packing" && <PackingList checks={checks} toggle={toggle} countChecked={countChecked} countCustomChecked={countCustomChecked} customItems={customItems} addCustomItem={addCustomItem} removeCustomItem={removeCustomItem} />}
        {tab === "grocery" && <GroceryList checks={checks} toggle={toggle} countChecked={countChecked} countCustomChecked={countCustomChecked} customItems={customItems} addCustomItem={addCustomItem} removeCustomItem={removeCustomItem} />}
        {tab === "tickets" && <Tickets checks={checks} toggle={toggle} />}
      </main>
    </div>
  );
}

function CheckItem({ id, label, checked, toggle, bold, onRemove }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0", borderBottom: "1px solid #F0EAE3" }}>
      <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0", cursor: "pointer", flex: 1 }}>
        <input type="checkbox" checked={!!checked} onChange={() => toggle(id)} style={{ marginTop: "3px", accentColor: "#8B4513", width: 18, height: 18, flexShrink: 0 }} />
        <span style={{ fontSize: "14px", lineHeight: 1.5, textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.5 : 1, fontWeight: bold ? 600 : 400 }}>{label}</span>
      </label>
      {onRemove && (
        <button onClick={onRemove} style={{ background: "none", border: "none", color: "#C4A882", cursor: "pointer", padding: "8px 4px", fontSize: "16px", lineHeight: 1, flexShrink: 0, opacity: 0.6 }} title="Remove item">×</button>
      )}
    </div>
  );
}

function AddItemInput({ onAdd }) {
  const [value, setValue] = useState("");
  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
  };
  return (
    <div style={{ display: "flex", gap: "6px", padding: "8px 0 4px" }}>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        placeholder="Add item..."
        style={{ flex: 1, border: "1px solid #E8DDD4", borderRadius: 6, padding: "6px 10px", fontSize: "13px", fontFamily: "inherit", outline: "none", color: "#3B2314", background: "#FAF6F1" }}
      />
      <button onClick={submit} style={{ background: "#8B4513", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+</button>
    </div>
  );
}

function SectionHeader({ title, count, total, icon }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ margin: "20px 0 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#5B2C0E", margin: 0, fontFamily: "'Playfair Display', serif" }}>
        {icon} {title}
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "12px", color: "#9B8B7A", fontWeight: 500 }}>{count}/{total}</span>
        <div style={{ width: 50, height: 6, background: "#E8DDD4", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#4CAF50" : "#8B4513", borderRadius: 3, transition: "width 0.3s" }} />
        </div>
      </div>
    </div>
  );
}

function DayCard({ day, dayKey, title, forecast, expanded, toggleDay, children }) {
  const colors = { thu: "#D4A574", fri: "#E8B86D", sat: "#A8C5A0", sun: "#B8A9D4" };
  return (
    <div style={{ background: "#fff", borderRadius: 12, marginBottom: 12, overflow: "hidden", border: "1px solid #E8DDD4", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <button onClick={() => toggleDay(dayKey)} style={{
        width: "100%", padding: "14px 16px", border: "none", background: "#fff", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "12px", fontFamily: "inherit", textAlign: "left"
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: colors[dayKey], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0, textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
          {day}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#3B2314" }}>{title}</div>
          <div style={{ fontSize: "12px", color: "#9B8B7A", marginTop: 2 }}>{forecast}</div>
        </div>
        <span style={{ fontSize: "18px", transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </button>
      {expanded && <div style={{ padding: "0 16px 16px", borderTop: "1px solid #F0EAE3" }}>{children}</div>}
    </div>
  );
}

function TimeBlock({ time, title, details }) {
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #F5F0EB" }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#8B4513", whiteSpace: "nowrap", minWidth: "fit-content" }}>{time}</span>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#3B2314" }}>{title}</span>
      </div>
      {details && <div style={{ fontSize: "13px", color: "#6B5B4E", lineHeight: 1.6, marginTop: 4, paddingLeft: 0 }}>{details}</div>}
    </div>
  );
}

function DinnerOptions({ options }) {
  return (
    <div style={{ marginTop: 10, padding: "10px 12px", background: "#FFF8F0", borderRadius: 8, border: "1px solid #F0E0CC" }}>
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#8B4513", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>🍽️ Dinner Options</div>
      {options.map((o, i) => (
        <div key={i} style={{ fontSize: "13px", marginBottom: 4, lineHeight: 1.5 }}>
          <strong>{o.name}</strong> — <span style={{ color: "#6B5B4E" }}>{o.desc}</span>
        </div>
      ))}
    </div>
  );
}

function Itinerary({ expandedDays, toggleDay }) {
  return (
    <div>
      <DayCard day="THU" dayKey="thu" title="Arrival Day" forecast="High ~58°F, clear" expanded={expandedDays.thu} toggleDay={toggleDay}>
        <TimeBlock time="Morning" title="Take It Easy" details="Sleep in. Relaxed breakfast at home. Finish packing. Pack PB&J, snacks, and drinks for the car." />
        <TimeBlock time="~12:00 PM" title="Depart Moorestown" details="Hit the road. Eat packed lunch in the car. Toddler naps in her car seat during the 2-hour drive." />
        <TimeBlock time="~2:00 PM" title="Giant Food" details="1250 Cocoa Ave, Hershey. Grab groceries with your list ready. Tip: order ahead for free pickup at giantfoodstores.com." />
        <TimeBlock time="3:00 PM" title="Check In" details="Unload the car, put groceries away, make beds, let kids explore." />
        <TimeBlock time="3:30–5:00" title="Chocolate World" details="Free entry! Ride the free Chocolate Tour (singing cows, free chocolate sample). Browse the World's Largest Hershey's Store. Grab a milkshake. Closes at 5 PM on Thursdays. First 3 hours parking free." />
        <DinnerOptions options={[
          { name: "Simply Greek", desc: "Gyros, falafel, Greek salads. Very vegetarian-friendly." },
          { name: "Chipotle", desc: "Sofritas bowls, veggie burritos, chips & guac." },
          { name: "Noodles & Co", desc: "Mac & cheese for kids, pesto cavatappi for adults." },
        ]} />
      </DayCard>

      <DayCard day="FRI" dayKey="fri" title="Hersheypark Day" forecast="High ~72°F ☀️ — warmest day!" expanded={expandedDays.fri} toggleDay={toggleDay}>
        <div style={{ padding: "8px 10px", background: "#FFF3E0", borderRadius: 6, fontSize: "12px", color: "#8B4513", marginTop: 8, marginBottom: 4 }}>
          ⏰ Spring Weekends hours: ~11 AM – 6/8 PM. Confirm at hersheypark.com/hours
        </div>
        <TimeBlock time="10:30 AM" title="Head to Hersheypark" details="Parking lot opens before gates." />
        <TimeBlock time="11:00 AM" title="Park Opens!" details="Head straight to Founder's Way (kiddie rides). 2-year-old rides Carrousel, Ferris Wheel, mini rides with adult. 6-year-old rides everything plus Trailblazer and Cocoa Cruiser." />
        <TimeBlock time="12:00–2:00" title="Lunch + Nap at Rental" details="Leave by noon (~10 min drive). PB&J or mac & cheese + berries. Toddler naps. Keep tickets for same-day re-entry." />
        <TimeBlock time="2:30–4:30" title="ZooAmerica" details="Cross the bridge inside the park (included with ticket). Wolves, bears, otters, lynx. ~1 hour. Stroller-accessible." />
        <TimeBlock time="4:30–6:00" title="More Rides" details="Split up: one adult takes 6-year-old on Comet, Laff Trakk, Trailblazer. Other stays with toddler on gentle rides or catches the sea lion show." />
        <DinnerOptions options={[
          { name: "What If... Of Hershey", desc: "Casual savory & sweet crepes. Great vegetarian options." },
          { name: "Red Robin", desc: "Veggie burgers, bottomless fries. Easy after a park day." },
          { name: "Panera Bread", desc: "Soups, salads, mac & cheese for kids." },
        ]} />
      </DayCard>

      <DayCard day="SAT" dayKey="sat" title="Caverns + Gardens" forecast="High ~62°F, dry · 🎸 Guitar convention 12–4" expanded={expandedDays.sat} toggleDay={toggleDay}>
        <TimeBlock time="9:30 AM" title="Drive to Indian Echo Caverns" details="368 Middletown Rd, Hummelstown (~10 min). Opens at 10 AM." />
        <TimeBlock time="10:00 AM" title="Guided Cavern Tour" details="45 minutes. Constant 52°F — bring layers. NO STROLLERS — carry the 2-year-old. Stalactites, underground pools, the 'Pennsylvania Hermit' story." />
        <TimeBlock time="~11:00" title="Petting Zoo + Playground" details="Free petting zoo (baby goats in spring!), playground, gem mining (small fee). Head back by 11:30." />
        <TimeBlock time="12:00–2:00" title="Lunch + Nap" details="Goodles mac & cheese or quesadillas. Husband departs for guitar convention ~noon. Toddler naps. Quiet time for 6-year-old." />
        <TimeBlock time="2:15 PM" title="Hershey Gardens (mom + kids)" details="170 Hotel Rd (~5 min). Low-key afternoon: Butterfly Atrium (indoor, magical for toddler), Children's Garden (outdoor interactive), stroll 23 acres of spring tulips. Fully stroller-friendly. Head back ~3:45 to meet husband." />
        <DinnerOptions options={[
          { name: "Khana Indian Bistro", desc: "Dal, paneer, veggie biryani, naan. Tons of vegetarian options." },
          { name: "The Mill", desc: "Good beer, great food, praised for vegetarian options." },
          { name: "Del Taco", desc: "Bean burritos, veggie tacos. Cheap & easy." },
        ]} />
      </DayCard>

      <DayCard day="SUN" dayKey="sun" title="Chocolate World + Home" forecast="High ~63°F, slight rain chance" expanded={expandedDays.sun} toggleDay={toggleDay}>
        <TimeBlock time="7:30 AM" title="Early Breakfast + Pack Up" details="Eggs, toast, cereal, last of the berries + yogurt. Start loading the car with luggage and bedding. First pass on cleaning." />
        <TimeBlock time="9:00 AM" title="Chocolate World" details="Arrive at opening — Sunday mornings are quietest. Free Chocolate Tour first." />
        <TimeBlock time="9:15–11:30" title="Paid Experiences" details="Create Your Own Candy Bar (~30-45 min): aprons, hairnets, choose base + mix-ins, design wrapper, watch it get made. Souvenir tin! Then Reese's Stuff Your Cup (~20 min): custom one-pound Reese's PB Cup. Browse gift shop. Walk Chocolate Avenue for Kiss streetlight photos." />
        <TimeBlock time="~11:30 AM" title="Head Home" details="Final rental sweep (or go straight to Turnpike). Pack PB&J for car. Toddler naps on drive. Home ~1:30 PM!" />
      </DayCard>

      <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1px solid #E8DDD4", marginTop: 4 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", margin: "0 0 10px", color: "#5B2C0E" }}>💡 Tips & Reminders</h3>
        {[
          "Hersheypark re-entry: Keep tickets — leave for nap, return same day",
          "Indian Echo Caverns: No strollers underground. Closed-toe shoes. 52°F inside.",
          "Butterfly Atrium: Warm & humid inside. Butterflies land on bright clothing!",
          "Chocolate World parking: First 3 hrs free. Then $60 when Hersheypark is open.",
          "Confirm Hersheypark hours the day before at hersheypark.com/hours",
          "Friday is your warm day (72°F) — perfect for outdoor park day",
        ].map((tip, i) => (
          <div key={i} style={{ fontSize: "13px", color: "#6B5B4E", padding: "4px 0", lineHeight: 1.5 }}>• {tip}</div>
        ))}
      </div>
    </div>
  );
}

function PackingList({ checks, toggle, countChecked, countCustomChecked, customItems, addCustomItem, removeCustomItem }) {
  const sections = [
    { id: "pa", icon: "👔", title: "Adults — Clothing Essentials (each)", items: [
      "3 long-sleeve shirts or light sweaters", "1 short-sleeve shirt (for Friday's warm afternoon)", "3 pairs of pants/jeans",
      "4 pairs of socks + 4 underwear", "1 medium-weight jacket or fleece",
      "Warm pajamas", "Beanies", "Baseball caps"
    ]},
    { id: "pb", icon: "👦", title: "Boy (age 6) — Clothing + Backups", items: [
      "4 long-sleeve shirts + 2 backups", "1–2 short-sleeve shirts for layering or the warm day",
      "4 pairs of pants (jeans or joggers) + 1 backup pair",
      "6 pairs of socks + 6 underwear", "1 warm hoodie or zip-up fleece", "1 jacket",
      "Warm pajamas (2 pairs)", "Hat"
    ]},
    { id: "pc", icon: "👧", title: "Girl (age 2) — Clothing + Extra Backups", items: [
      "5 outfits (leggings + long-sleeve tops) + 3 full backup outfits", "1–2 short-sleeve shirts for layering",
      "8+ pairs of socks", "1 sweater", "1 jacket",
      "1 pair of comfortable walking shoes + 1 backup pair", "Sun hat + warm hat", "Sleep sack"
    ]},
    { id: "pd", icon: "🍼", title: "Diaper & Toddler Supplies", items: [
      "Diapers", "Wipes", "Diaper cream",
      "Portable changing pad", "Plastic diaper pail and bags"
    ]},
    { id: "pe", icon: "🛏️", title: "Bedding & Pillows", items: [
      { header: "Sandy's Bed" },
      "1 fitted sheet (queen/full)", "1 comforter or duvet (queen/full)", "1 fluffy blanket", "1 pillow",
      "Mr elephant(s)", "Dragon girls + Bad Guys books", "Noise machine", "Mella",
      { header: "Mommy Daddy Bed" },
      "1 fitted sheet (queen/full)", "1 comforter or duvet (queen/full)", "2–3 pillows + pillowcases",
      "Mr. Moo and Baby", "Gwenny bedtime books", "Mommy daddy books", "Noise machine", "Monitor?",
      { header: "Extras" },
      "Extra light blanket for the 2-year-old", "Mattress protector for the kids' bed (optional)"
    ]},
    { id: "pg", icon: "⚙️", title: "Gear", items: [
      "Rolling cart", "Gwen and Sandy's water bottles",
      "Small backpack / daypack for daily essentials", "Phone chargers + cables", "Portable charger block"
    ]},
    { id: "pba", icon: "🚿", title: "Bathroom Supplies", items: [
      { header: "Towels" },
      "3 bath towels", "2 hand towels", "4 washcloths",
      { header: "Toiletries — Travel Size" },
      "Shampoo + conditioner", "Dove soap", "Deodorant", "Lotion", "Face wash",
      { header: "Toiletries — Normal Size" },
      "Toothbrushes + toothpaste (adult + kid-size)", "Floss picks", "Hairbrush / comb",
      "Hair dryer", "Hair ties / clips", "Razor",
      "Mommy's glasses", "Mommy's retainers", "Mommy's makeup"
    ]},
    { id: "ph", icon: "🩹", title: "Health & Safety", items: [
      "Face + body sunscreen", "Children's Tylenol / ibuprofen", "Adult ibuprofen", "Dayquil",
      "Band-aids", "Hand sanitizer",
      "Sandy's minty meds", "Sandy's allergy meds", "Vitamins for Sandy + Gwen",
      "Leslie's meds", "Daddy's allergy meds"
    ]},
    { id: "pi", icon: "🚗", title: "Car / Entertainment", items: [
      "iPad + headphones", "Coloring supplies", "Book for Gwen",
      "1 full change of clothes per family member in the car"
    ]},
    { id: "pk", icon: "🍽️", title: "Kitchen", items: [
      "Pacifiers", "Fruit and berry spray", "Trash bags", "Knife and cutting board",
      "Sponge", "Ziplocs", "Gwen's smoothie cups", "Gwen's spoon",
      "Tissues", "Paper towels", "Wet wipes for car + everyday"
    ]},
  ];

  const countSectionItems = (items) => items.filter(item => typeof item === "string").length;

  return (
    <div>
      <div style={{ fontSize: "13px", color: "#9B8B7A", marginBottom: 12, textAlign: "center" }}>
        Tap items to check them off. Progress saves automatically.
      </div>
      {sections.map(s => {
        const custom = customItems[s.id] || [];
        const total = countSectionItems(s.items) + custom.length;
        const checked = countChecked(s.id) + countCustomChecked(s.id);
        let checkIndex = 0;
        return (
          <div key={s.id}>
            <SectionHeader title={s.title} count={checked} total={total} icon={s.icon} />
            <div style={{ background: "#fff", borderRadius: 10, padding: "4px 14px", border: "1px solid #E8DDD4" }}>
              {s.items.map((item, i) => {
                if (typeof item === "object" && item.header) {
                  return (
                    <div key={`${s.id}-h-${i}`} style={{ fontSize: "13px", fontWeight: 700, color: "#8B4513", padding: "10px 0 4px", borderBottom: "1px solid #F0EAE3", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                      {item.header}
                    </div>
                  );
                }
                const idx = checkIndex++;
                return <CheckItem key={`${s.id}-${idx}`} id={`${s.id}-${idx}`} label={item} checked={checks[`${s.id}-${idx}`]} toggle={toggle} />;
              })}
              {custom.map(ci => (
                <CheckItem key={ci.id} id={ci.id} label={ci.label} checked={checks[ci.id]} toggle={toggle} onRemove={() => removeCustomItem(s.id, ci.id)} />
              ))}
              <AddItemInput onAdd={(label) => addCustomItem(s.id, label)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GroceryList({ checks, toggle, countChecked, countCustomChecked, customItems, addCustomItem, removeCustomItem }) {
  const sections = [
    { id: "gb", icon: "🍳", title: "Breakfast Supplies", items: [
      "Eggs (1 dozen)", "Egg bites (pre-made, microwave-friendly)", "Bread (1 loaf — doubles for lunch sandwiches)",
      "Butter", "Pancake mix (just-add-water kind like Bisquick Shake 'n Pour)", "Maple syrup (small bottle)",
      "Cereal (1 for Sandy, 1 for Leslie)", "Almond milk", "Bananas (1 bunch)",
      "Raspberries", "Blackberries", "Apples", "Clementines",
      "Yogurt cups (12+ — mix of adult and kid flavors, plan for every meal)",
      "Once upon a farm pouches"
    ]},
    { id: "gl", icon: "🥪", title: "Lunch Supplies", items: [
      "Peanut butter (or sun butter if the school is nut-free)", "Jelly / jam",
      "Tortillas (small pack — for quesadillas)",
      "Goodles mac n cheese (2–3 boxes)", "Shredded cheese (for quesadillas)"
    ]},
    { id: "gs", icon: "🍿", title: "Snacks (whole family)", items: [
      "Salty snacks", "Pretzels", "Mixed nuts (for the adults)", "String cheese"
    ]},
    { id: "gd", icon: "🥤", title: "Drinks", items: [
      "Bottled water (1 case, or plan to refill bottles)", "Apple juice"
    ]},
    { id: "gk", icon: "🍽️", title: "Kitchen Supplies", items: [
      "Paper plates + napkins", "Plastic cups for the kids",
      "Aluminum foil", "Dish soap", "Cooking spray",
      "Salt & pepper", "Earth balance"
    ]},
  ];

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #E8DDD4", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, color: "#5B2C0E", marginBottom: 8 }}>Meal Plan</div>
        <div style={{ fontSize: "12px", lineHeight: 1.8, color: "#6B5B4E" }}>
          <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 1fr 40px", gap: "4px", padding: "2px 0 4px", borderBottom: "1px solid #E8DDD4", marginBottom: 4 }}>
            <span />
            <span style={{ fontWeight: 700, color: "#8B4513" }}>Breakfast</span>
            <span style={{ fontWeight: 700, color: "#8B4513" }}>Lunch</span>
            <span style={{ fontWeight: 700, color: "#8B4513", textAlign: "right" }}>Dinner</span>
          </div>
          {[
            ["Thu", "Eat before/on the road", "PB&J sandwiches", "Out"],
            ["Fri", "Eggs + toast", "Goodles mac n cheese", "Out"],
            ["Sat", "Pancakes or cereal + fruit", "Quesadillas", "Out"],
            ["Sun", "Eggs + toast or cereal", "On the road / leftovers", "Home"],
          ].map(([day, b, l, d], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1fr 1fr 40px", gap: "4px", padding: "2px 0" }}>
              <strong style={{ color: "#8B4513" }}>{day}</strong>
              <span>{b}</span><span>{l}</span><span style={{ textAlign: "right" }}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#E8F5E9", borderRadius: 10, padding: "12px 14px", marginBottom: 12, fontSize: "13px", color: "#2E7D32" }}>
        🏪 <strong>Shop at Giant Food</strong> — 1250 Cocoa Ave, Hershey (6 AM–11 PM daily). Nature's Promise organic line covers eggs, yogurt, berries, and toddler pouches. They also carry Goodles and Annie's. You can order ahead for free pickup at giantfoodstores.com.
      </div>

      <div style={{ fontSize: "13px", color: "#9B8B7A", marginBottom: 12, textAlign: "center" }}>
        Tap items to check them off as you shop.
      </div>

      {sections.map(s => {
        const custom = customItems[s.id] || [];
        const total = s.items.length + custom.length;
        const checked = countChecked(s.id) + countCustomChecked(s.id);
        return (
          <div key={s.id}>
            <SectionHeader title={s.title} count={checked} total={total} icon={s.icon} />
            <div style={{ background: "#fff", borderRadius: 10, padding: "4px 14px", border: "1px solid #E8DDD4" }}>
              {s.items.map((item, i) => (
                <CheckItem key={`${s.id}-${i}`} id={`${s.id}-${i}`} label={item} checked={checks[`${s.id}-${i}`]} toggle={toggle} />
              ))}
              {custom.map(ci => (
                <CheckItem key={ci.id} id={ci.id} label={ci.label} checked={checks[ci.id]} toggle={toggle} onRemove={() => removeCustomItem(s.id, ci.id)} />
              ))}
              <AddItemInput onAdd={(label) => addCustomItem(s.id, label)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Tickets({ checks, toggle }) {
  const tickets = [
    { id: "t0", label: "Hersheypark — 2 adult tickets ($54.99 each)", price: 109.98 },
    { id: "t1", label: "Hersheypark — 1 junior ticket, age 6 ($49.99)", price: 49.99 },
    { id: "t2", label: "Hersheypark — 2-year-old (FREE)", price: 0 },
    { id: "t3", label: "Hersheypark Parking ($25)", price: 25 },
    { id: "t4", label: "Hershey Gardens — 1 adult ($17.50)", price: 17.50 },
    { id: "t5", label: "Hershey Gardens — 1 junior, age 6 ($13.50)", price: 13.50 },
    { id: "t6", label: "Hershey Gardens — 2-year-old (FREE)", price: 0 },
    { id: "t7", label: "Indian Echo Caverns — 2 adults ($24.50 each)", price: 49 },
    { id: "t8", label: "Indian Echo Caverns — 1 child, age 6 ($14.50)", price: 14.50 },
    { id: "t9", label: "Indian Echo Caverns — 2-year-old (FREE)", price: 0 },
    { id: "t10", label: "Chocolate World — Free Tour (FREE)", price: 0 },
    { id: "t11", label: "Chocolate World — Create Your Own Candy Bar × 3 ($29.95 each)", price: 89.85 },
    { id: "t12", label: "Chocolate World — Reese's Stuff Your Cup × 3 ($21.99 each)", price: 65.97 },
    { id: "t13", label: "Chocolate World — 2-year-old (FREE)", price: 0 },
  ];

  const total = tickets.reduce((sum, t) => sum + t.price, 0);
  const purchased = tickets.filter(t => checks[t.id]).reduce((sum, t) => sum + t.price, 0);

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #5B2C0E, #8B4513)", borderRadius: 12, padding: "16px", color: "#fff", textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: "12px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>Estimated Total</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 800, margin: "4px 0" }}>~${total.toFixed(0)}</div>
        <div style={{ fontSize: "12px", opacity: 0.7 }}>+ taxes & fees</div>
        {purchased > 0 && <div style={{ fontSize: "13px", marginTop: 8, background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 10px" }}>
          ✓ ${purchased.toFixed(2)} purchased
        </div>}
      </div>

      <div style={{ background: "#FFF8E1", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: "13px", color: "#F57F17", border: "1px solid #FFE082" }}>
        💰 <strong>Money-saving tip:</strong> Chocolate World Spring Bundle — 4 experiences for $49.95/person (valid through April 26, online only). Cheaper than buying Create Your Own + Reese's individually AND includes 2 bonus attractions!
      </div>

      <div style={{ fontSize: "13px", color: "#9B8B7A", marginBottom: 8, textAlign: "center" }}>Check off as you purchase</div>

      <div style={{ background: "#fff", borderRadius: 10, padding: "4px 14px", border: "1px solid #E8DDD4" }}>
        {tickets.map(t => (
          <CheckItem key={t.id} id={t.id} label={t.label} checked={checks[t.id]} toggle={toggle} />
        ))}
      </div>

      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, color: "#5B2C0E", margin: "16px 0 10px" }}>🎫 Where to Buy</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "Hersheypark", url: "https://www.hersheypark.com/tickets/", note: "Buy online to skip the line" },
          { label: "Chocolate World", url: "https://www.chocolateworld.com/experiences", note: "Spring Bundle saves $$$" },
          { label: "Hershey Gardens", url: "https://www.hersheygardens.org/plan-your-visit/tickets/", note: "Also available at the door" },
          { label: "Indian Echo Caverns", url: "https://www.indianechocaverns.com/", note: "Walk-up tickets at the door" },
        ].map(s => (
          <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #E8DDD4", textDecoration: "none", color: "#3B2314" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#5B2C0E" }}>{s.label}</div>
              <div style={{ fontSize: "12px", color: "#9B8B7A", marginTop: 2 }}>{s.note}</div>
            </div>
            <span style={{ fontSize: "18px", color: "#8B4513" }}>→</span>
          </a>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, color: "#5B2C0E", margin: "0 0 10px" }}>🍽️ Dinner Options by Day</h3>
        {[
          { day: "Thursday", color: "#D4A574", options: [
            { name: "Simply Greek", desc: "Gyros, falafel, Greek salads. Very vegetarian-friendly.", map: "https://www.google.com/maps/search/?api=1&query=Simply+Greek+Hershey+PA" },
            { name: "Chipotle", desc: "Sofritas bowls, veggie burritos, chips & guac.", map: "https://www.google.com/maps/search/?api=1&query=Chipotle+Hershey+PA" },
            { name: "Noodles & Co", desc: "Mac & cheese for kids, pesto cavatappi for adults.", map: "https://www.google.com/maps/search/?api=1&query=Noodles+and+Company+Hershey+PA" },
          ]},
          { day: "Friday", color: "#E8B86D", options: [
            { name: "What If... Of Hershey", desc: "Casual savory & sweet crepes. Great vegetarian options.", map: "https://www.google.com/maps/search/?api=1&query=What+If+Of+Hershey+PA" },
            { name: "Red Robin", desc: "Veggie burgers, bottomless fries. Easy after a park day.", map: "https://www.google.com/maps/search/?api=1&query=Red+Robin+Hershey+PA" },
            { name: "Panera Bread", desc: "Soups, salads, mac & cheese for kids.", map: "https://www.google.com/maps/search/?api=1&query=Panera+Bread+Hershey+PA" },
          ]},
          { day: "Saturday", color: "#A8C5A0", options: [
            { name: "Khana Indian Bistro", desc: "Dal, paneer, veggie biryani, naan. Tons of vegetarian options.", map: "https://www.google.com/maps/search/?api=1&query=Khana+Indian+Bistro+Hershey+PA" },
            { name: "The Mill", desc: "Good beer, great food, praised for vegetarian options.", map: "https://www.google.com/maps/search/?api=1&query=The+Mill+Hershey+PA" },
            { name: "Del Taco", desc: "Bean burritos, veggie tacos. Cheap & easy.", map: "https://www.google.com/maps/search/?api=1&query=Del+Taco+Hershey+PA" },
          ]},
        ].map(d => (
          <div key={d.day} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #E8DDD4", marginBottom: 10 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", background: d.color, display: "inline-block", borderRadius: 4, padding: "2px 8px", marginBottom: 8 }}>{d.day}</div>
            {d.options.map((o, i) => (
              <div key={i} style={{ fontSize: "13px", marginBottom: 4, lineHeight: 1.5 }}>
                <a href={o.map} target="_blank" rel="noopener noreferrer" style={{ color: "#5B2C0E", fontWeight: 700, textDecoration: "none" }}>{o.name}</a> — <span style={{ color: "#6B5B4E" }}>{o.desc}</span>
                <a href={o.map} target="_blank" rel="noopener noreferrer" style={{ color: "#8B4513", fontSize: "11px", marginLeft: 4, textDecoration: "none" }}>📍 Map</a>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
