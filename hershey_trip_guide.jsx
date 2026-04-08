import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "hershey-trip-checks";

const initialChecks = {};

function App() {
  const [tab, setTab] = useState("itinerary");
  const [checks, setChecks] = useState(initialChecks);
  const [expandedDays, setExpandedDays] = useState({ thu: true, fri: false, sat: false, sun: false });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) setChecks(JSON.parse(result.value));
      } catch (e) { /* first load */ }
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEY, JSON.stringify(checks)).catch(() => {});
  }, [checks, loaded]);

  const toggle = useCallback((id) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleDay = (day) => setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));

  const countChecked = (prefix) => {
    return Object.keys(checks).filter(k => k.startsWith(prefix) && checks[k]).length;
  };

  const countTotal = (items) => items.length;

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
        {tab === "packing" && <PackingList checks={checks} toggle={toggle} countChecked={countChecked} />}
        {tab === "grocery" && <GroceryList checks={checks} toggle={toggle} countChecked={countChecked} />}
        {tab === "tickets" && <Tickets checks={checks} toggle={toggle} />}
      </main>
    </div>
  );
}

function CheckItem({ id, label, checked, toggle, bold }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0", cursor: "pointer", borderBottom: "1px solid #F0EAE3" }}>
      <input type="checkbox" checked={!!checked} onChange={() => toggle(id)} style={{ marginTop: "3px", accentColor: "#8B4513", width: 18, height: 18, flexShrink: 0 }} />
      <span style={{ fontSize: "14px", lineHeight: 1.5, textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.5 : 1, fontWeight: bold ? 600 : 400 }}>{label}</span>
    </label>
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

function PackingList({ checks, toggle, countChecked }) {
  const sections = [
    { id: "pa", icon: "👔", title: "Adults — Clothing (each)", items: [
      "3 long-sleeve shirts or light sweaters", "1 short-sleeve shirt (Friday's warm day)", "3 pairs of pants/jeans",
      "4 pairs of socks + 4 underwear", "1 medium-weight jacket or fleece", "1 packable rain jacket",
      "1 pair of comfortable walking shoes", "Warm pajamas", "Light beanie or hat for chilly mornings"
    ]},
    { id: "pb", icon: "👦", title: "Boy (age 6) — Clothing + Backups", items: [
      "4 long-sleeve shirts + 2 backups", "1–2 short-sleeve shirts", "4 pairs of pants + 1 backup pair",
      "6 pairs of socks + 6 underwear", "1 warm hoodie or zip-up fleece", "1 rain jacket with hood",
      "1 pair of sneakers + 1 backup pair", "Warm pajamas (2 pairs)", "Light gloves + knit hat"
    ]},
    { id: "pc", icon: "👧", title: "Girl (age 2) — Clothing + Extra Backups", items: [
      "5 outfits (leggings + tops) + 3 full backup outfits", "1–2 short-sleeve onesies/shirts",
      "8+ pairs of socks", "1 warm fleece or puffy jacket", "1 toddler-sized rain jacket with hood",
      "1 pair walking shoes + 1 backup pair", "Warm footed pajamas (2–3 pairs)", "Sun hat + warm hat"
    ]},
    { id: "pr", icon: "🌧️", title: "Rain & Weather Gear", items: [
      "Rain jackets for all 4 (listed above)", "Stroller rain cover", "1 compact umbrella (backup)",
      "Gallon-size Ziploc bags (phones, wet clothes)"
    ]},
    { id: "pd", icon: "🍼", title: "Diaper & Toddler Supplies", items: [
      "Diapers — 8–10/day (~30–35 total)", "Wipes (2 packs)", "Diaper cream",
      "Portable changing pad", "Plastic bags for dirty diapers",
      "⚠️ Lovey / comfort item for sleep — DO NOT FORGET",
      "Nightlight for the hotel room", "Sippy cups / toddler water bottle"
    ]},
    { id: "pe", icon: "🛏️", title: "Bedding & Pillows", items: [
      "Bed 1 (queen/full): fitted sheet, flat sheet, comforter, 2 pillows + cases",
      "Bed 2 (queen/full): fitted sheet, flat sheet, comforter, 1–2 pillows + cases",
      "Extra light blanket for 2-year-old", "Mattress protector for kids' bed (optional)"
    ]},
    { id: "pg", icon: "⚙️", title: "Gear", items: [
      "Stroller", "Stroller blanket or bunting", "Reusable water bottles (4)",
      "Small backpack / daypack", "Portable phone charger + cables"
    ]},
    { id: "pba", icon: "🚿", title: "Bathroom Supplies", items: [
      "4 bath towels + 2 hand towels + 4 washcloths", "1–2 extra towels",
      "Shampoo + conditioner", "Body wash / soap", "Toothbrushes + toothpaste (adult + kid)",
      "Deodorant (each adult)", "Hairbrush / comb + hair ties", "Lotion", "Razor",
      "Contact solution / glasses", "Toddler toothbrush + training toothpaste",
      "Hooded towel for toddler bath", "Non-slip bath mat"
    ]},
    { id: "ph", icon: "🩹", title: "Health & Safety", items: [
      "Sunscreen SPF 30+", "Children's Tylenol / ibuprofen", "Antihistamine (Benadryl/Zyrtec)",
      "Band-aids", "Hand sanitizer", "Tissues"
    ]},
    { id: "pi", icon: "🚗", title: "Car / Entertainment", items: [
      "Tablets + headphones", "Coloring supplies or small toys (6-year-old)",
      "Board books or soft toys (2-year-old)", "Light blanket for the car",
      "1 full change of clothes per person IN THE CAR"
    ]},
  ];

  return (
    <div>
      <div style={{ fontSize: "13px", color: "#9B8B7A", marginBottom: 12, textAlign: "center" }}>
        Tap items to check them off. Progress saves automatically.
      </div>
      {sections.map(s => {
        const total = s.items.length;
        const checked = countChecked(s.id);
        return (
          <div key={s.id}>
            <SectionHeader title={s.title} count={checked} total={total} icon={s.icon} />
            <div style={{ background: "#fff", borderRadius: 10, padding: "4px 14px", border: "1px solid #E8DDD4" }}>
              {s.items.map((item, i) => (
                <CheckItem key={`${s.id}-${i}`} id={`${s.id}-${i}`} label={item} checked={checks[`${s.id}-${i}`]} toggle={toggle} bold={item.includes("⚠️")} />
              ))}
            </div>
          </div>
        );
      })}
      <div style={{ background: "#F0EAE3", borderRadius: 10, padding: "12px 14px", marginTop: 16, fontSize: "13px", color: "#6B5B4E" }}>
        <strong>Leave at home:</strong> Swimsuits & water shoes (water parks closed in April), shorts, sandals, heavy winter coat.
      </div>
    </div>
  );
}

function GroceryList({ checks, toggle, countChecked }) {
  const sections = [
    { id: "gb", icon: "🍳", title: "Breakfast Supplies", items: [
      "Eggs (1 dozen)", "Egg bites (pre-made, microwave-friendly)", "Bread (1 loaf)",
      "Butter", "Pancake mix (just-add-water)", "Maple syrup (small bottle)",
      "Cereal (1 box)", "Milk (half gallon)", "Bananas (1 bunch)",
      "Strawberries (1 large container)", "Blueberries (1 container)",
      "Yogurt cups (12+ — plan for every meal)"
    ]},
    { id: "gl", icon: "🥪", title: "Lunch Supplies", items: [
      "Peanut butter (or sun butter)", "Jelly / jam", "Tortillas (for quesadillas)",
      "Goodles mac n cheese (2–3 boxes)", "Shredded cheese (for quesadillas)",
      "Baby carrots or snap peas", "Apple slices or clementines"
    ]},
    { id: "gt", icon: "👶", title: "Toddler Food", items: [
      "Squeeze fruit/veggie pouches (8–10)", "Puffs or baby crackers",
      "Goldfish or animal crackers", "Applesauce cups (4-pack)",
      "Cheerios or dry cereal for snacking"
    ]},
    { id: "gs", icon: "🍿", title: "Snacks (whole family)", items: [
      "Goldfish or Cheez-Its", "Granola bars", "Fruit snacks",
      "Pretzels", "Trail mix or mixed nuts (adults)", "String cheese"
    ]},
    { id: "gd", icon: "🥤", title: "Drinks", items: [
      "Juice boxes (small pack)", "K-cups (your preferred brand)", "Bottled water (1 case)"
    ]},
    { id: "gk", icon: "🍽️", title: "Kitchen Supplies to Bring", items: [
      "Paper towels (1 roll)", "Paper plates + napkins", "Plastic cups for kids",
      "Gallon-size Ziploc bags", "Aluminum foil", "Trash bags (small roll)",
      "Dish soap (travel size) + sponge", "1 sharp knife", "Cooking spray or olive oil",
      "Salt & pepper"
    ]},
  ];

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #E8DDD4", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, color: "#5B2C0E", marginBottom: 8 }}>Meal Plan</div>
        <div style={{ fontSize: "12px", lineHeight: 1.8, color: "#6B5B4E" }}>
          {[
            ["Thu", "Eat on the road", "PB&J", "Out"],
            ["Fri", "Eggs + toast", "Goodles mac n cheese", "Out"],
            ["Sat", "Pancakes + fruit", "Quesadillas", "Out"],
            ["Sun", "Eggs + cereal", "On the road", "Home"],
          ].map(([day, b, l, d], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1fr 1fr 40px", gap: "4px", padding: "2px 0" }}>
              <strong style={{ color: "#8B4513" }}>{day}</strong>
              <span>{b}</span><span>{l}</span><span style={{ textAlign: "right" }}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#E8F5E9", borderRadius: 10, padding: "12px 14px", marginBottom: 12, fontSize: "13px", color: "#2E7D32" }}>
        🏪 <strong>Shop at Giant Food</strong> — 1250 Cocoa Ave, Hershey (6 AM–11 PM). Nature's Promise organic line covers eggs, yogurt, berries & toddler pouches. They carry Goodles.
      </div>

      <div style={{ fontSize: "13px", color: "#9B8B7A", marginBottom: 12, textAlign: "center" }}>
        Tap items to check them off as you shop.
      </div>

      {sections.map(s => {
        const total = s.items.length;
        const checked = countChecked(s.id);
        return (
          <div key={s.id}>
            <SectionHeader title={s.title} count={checked} total={total} icon={s.icon} />
            <div style={{ background: "#fff", borderRadius: 10, padding: "4px 14px", border: "1px solid #E8DDD4" }}>
              {s.items.map((item, i) => (
                <CheckItem key={`${s.id}-${i}`} id={`${s.id}-${i}`} label={item} checked={checks[`${s.id}-${i}`]} toggle={toggle} />
              ))}
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

      <div style={{ marginTop: 16, fontSize: "13px", color: "#6B5B4E", lineHeight: 1.6 }}>
        <strong>Where to buy:</strong>
        <div style={{ marginTop: 4 }}>• Hersheypark: hersheypark.com</div>
        <div>• Chocolate World: chocolateworld.com</div>
        <div>• Hershey Gardens: hersheygardens.org or at the door</div>
        <div>• Indian Echo Caverns: walk-up tickets at the door</div>
      </div>
    </div>
  );
}

export default App;
