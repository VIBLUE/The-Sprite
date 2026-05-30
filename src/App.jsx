import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

const STORAGE_KEY = "last-sprite-checklist";
const SYNC_CODE_KEY = "last-sprite-sync-code";

const SECTIONS = [
  {
    id: "urgent",
    emoji: "🚨",
    label: "ด่วนที่สุด — 7 วันแรก",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.07)",
    border: "rgba(239,68,68,0.4)",
    goal: "แก้ Itch.io Page แล้วเห็นยอดโหลดเพิ่มภายในสัปดาห์แรก",
    weeks: [
      {
        id: "u-d1", label: "วันที่ 1", title: "แก้ราคา + เตรียมไฟล์ฟรี", time: "~30 นาที",
        tasks: [
          { id: "u1", text: "Itch.io → Edit Pack → Pricing → Pay what you want, min $0, suggested $2 → Save" },
          { id: "u2", text: "Aseprite → เลือก 3 icons ที่ดีสุด (Aries, Moon, Crystal Ball) → Export PNG แยกตัว" },
          { id: "u3", text: "Zip 3 icons เป็น free_sample_zodiac.zip → เก็บไว้รอ upload" },
        ]
      },
      {
        id: "u-d2", label: "วันที่ 2", title: "Mockup รูปที่ 1: Icons ทั้งหมด", time: "~1 ชม.",
        tasks: [
          { id: "u4", text: "Canva → New Design 1280×720 → Background สีเข้ม #1a1a2e" },
          { id: "u5", text: "Upload icons ทุกตัว → จัด Grid → ใส่ชื่อ Pack" },
          { id: "u6", text: "Download PNG → บันทึก preview_01_all_icons.png" },
        ]
      },
      {
        id: "u-d3", label: "วันที่ 3", title: "Mockup รูปที่ 2: จำลอง Game UI", time: "~1 ชม.",
        tasks: [
          { id: "u7", text: "Canva → New Design 1280×720 → วาด Inventory Bar / Skill Slot จำลอง" },
          { id: "u8", text: "วาง Icons ลง Slot ให้ดูเหมือนอยู่ในเกมจริง" },
          { id: "u9", text: "เพิ่ม Text: 'Works with Godot / Unity / RPGMaker' → Download → preview_02_ingame_mockup.png" },
        ]
      },
      {
        id: "u-d4", label: "วันที่ 4", title: "Mockup รูปที่ 3: Sprite Sheet + Grid", time: "~45 นาที",
        tasks: [
          { id: "u10", text: "Aseprite → File → Export Sprite Sheet → Grid layout → save spritesheet.png" },
          { id: "u11", text: "Canva → เปิด spritesheet → วาด Grid 16×16 overlay" },
          { id: "u12", text: "ใส่ label '16×16 px each' → Download → preview_03_spritesheet.png" },
        ]
      },
      {
        id: "u-d5", label: "วันที่ 5", title: "แก้ Tags + Description", time: "~30 นาที",
        tasks: [
          { id: "u13", text: "Itch.io Edit → Tags → ลบ '16-bit' → เพิ่ม: fantasy, ui, magic, rpg-icons, game-asset, icon-pack" },
          { id: "u14", text: "Description → เพิ่ม: 'Compatible with Godot 4, Unity, RPGMaker MZ/MV, GMS2 and any engine that supports PNG'" },
          { id: "u15", text: "เพิ่ม Section: 'What's included' / 'How to use' / 'License' เป็น bullet points" },
        ]
      },
      {
        id: "u-d6", label: "วันที่ 6", title: "Upload Gallery + ไฟล์ฟรี", time: "~30 นาที",
        tasks: [
          { id: "u16", text: "Itch.io Edit → Screenshots → Upload preview_01, preview_02, preview_03" },
          { id: "u17", text: "Files section → Add free_sample_zodiac.zip → ติ๊ก 'This file is free'" },
          { id: "u18", text: "เปลี่ยน Cover Image เป็น preview_02 (ดูดีสุด)" },
        ]
      },
      {
        id: "u-d7", label: "วันที่ 7", title: "Publish + โพสต์ Social แรก", time: "~45 นาที",
        tasks: [
          { id: "u19", text: "Preview Page ทั้งหมด → อ่าน Description ใหม่เหมือนเป็นคนซื้อ" },
          { id: "u20", text: "Save → Publish → เปิดใน Incognito ดูว่าโอเคไหม" },
          { id: "u21", text: "สร้าง Account X (Twitter) หรือ TikTok สำหรับ Devlog โดยเฉพาะ (เช่น @thelastspritedev)" },
          { id: "u22", text: "โพสต์แรก: 'ฉันกำลังทำ Pixel Art RPG คนเดียว 🎮' + รูป preview_02 + #pixelart #gamedev #indiedev" },
        ]
      },
    ]
  },
  {
    id: "month1",
    emoji: "📅",
    label: "เดือน 1 — ฐานที่แข็งแรง",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.06)",
    border: "rgba(124,58,237,0.3)",
    goal: "Itch.io โอเค + เรียน Godot พื้นฐาน + เริ่ม Social",
    weeks: [
      {
        id: "m1w2", label: "สัปดาห์ 2", title: "เรียน Godot + ตัวละครขยับได้", time: "~8 ชม.",
        tasks: [
          { id: "m1w2a", text: "ดู YouTube: GDQuest 'Your First 2D Game in Godot 4' (ฟรี ~1.5 ชม.) — ดูให้จบก่อน อย่าเพิ่งทำตาม" },
          { id: "m1w2b", text: "Install Godot 4 (godotengine.org) → ทำความรู้จัก UI: Node, Scene, Inspector" },
          { id: "m1w2c", text: "New Project → New Scene → เพิ่ม CharacterBody2D Node" },
          { id: "m1w2d", text: "เขียน GDScript: กด ← → ให้ตัวละครขยับซ้าย-ขวา (~10 บรรทัด)" },
          { id: "m1w2e", text: "F5 Run → ตัวละครขยับได้ = ✅ สำเร็จ!" },
          { id: "m1w2f", text: "Screen Record → Export GIF (ShareX ฟรี) → โพสต์ Devlog #2" },
        ]
      },
      {
        id: "m1w3", label: "สัปดาห์ 3", title: "วาด Sprite ตัวเอก + ใส่ใน Godot", time: "~8 ชม.",
        tasks: [
          { id: "m1w3a", text: "Aseprite → New 16×16 หรือ 32×32 → วาด Idle frame 1–2 frame (ขยิบตา/หายใจ)" },
          { id: "m1w3b", text: "วาด Walk animation 2–4 frame (ก้าวซ้าย, ก้าวขวา)" },
          { id: "m1w3c", text: "Export PNG Spritesheet → บันทึกลง Godot Project Folder" },
          { id: "m1w3d", text: "Godot → AnimatedSprite2D Node → Import Spritesheet → ตั้ง Frame" },
          { id: "m1w3e", text: "Code: เล่น animation 'walk' เมื่อกด ← → และ 'idle' เมื่อหยุด" },
          { id: "m1w3f", text: "GIF → โพสต์ Devlog #3: 'สร้างตัวละคร Aseprite → Godot'" },
        ]
      },
      {
        id: "m1w4", label: "สัปดาห์ 4", title: "เริ่มวาด Asset Pack ชุดที่ 2", time: "~8 ชม.",
        tasks: [
          { id: "m1w4a", text: "เลือกธีม Pack ชุด 2 (Fantasy Potion Icons หรือ RPG Weapon Icons) — เช็คว่าธีมไหนมีคนค้นหาเยอะบน Itch.io" },
          { id: "m1w4b", text: "วาด icons ให้ได้ 15–20 ตัวในสัปดาห์นี้ (เป้ารวม 30+ ใน สัปดาห์ 5–6)" },
          { id: "m1w4c", text: "ถ่าย Process Timelapse วาด Sprite 30–60 วินาที → โพสต์ Devlog #4" },
          { id: "m1w4d", text: "เช็ค Itch.io Analytics → ดูยอด View หลังแก้ Page เพิ่มขึ้นไหม" },
        ]
      },
    ]
  },
  {
    id: "month2",
    emoji: "💰",
    label: "เดือน 2 — Pack ใหม่ + ระบบต่อสู้",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.06)",
    border: "rgba(6,182,212,0.3)",
    goal: "ปล่อย Pack ชุดที่ 2 + Combat System ทำงานได้ไม่ Crash",
    weeks: [
      {
        id: "m2w56", label: "สัปดาห์ 5–6", title: "วาด Pack ครบ + ปล่อย Itch.io", time: "~16 ชม.",
        tasks: [
          { id: "m2w56a", text: "วาด icons ให้ครบ 30+ ตัว" },
          { id: "m2w56b", text: "เลือก 3 icons Free tier → สร้าง Mockup 3 รูปเหมือน Pack แรก" },
          { id: "m2w56c", text: "Itch.io → New Page → Pay what you want, min $1, suggested $2–3" },
          { id: "m2w56d", text: "เขียน Description → Upload Gallery → Publish" },
          { id: "m2w56e", text: "โพสต์ Social ประกาศ Pack ใหม่ + ลิงก์ Itch.io" },
        ]
      },
      {
        id: "m2w78", label: "สัปดาห์ 7–8", title: "Turn-based Combat ใน Godot", time: "~16 ชม.",
        tasks: [
          { id: "m2w78a", text: "สร้าง BattleScene → Node: Player, Enemy, UI" },
          { id: "m2w78b", text: "Player.gd: ตัวแปร max_hp, current_hp, attack_power" },
          { id: "m2w78c", text: "Enemy.gd: ตัวแปร max_hp, current_hp, attack_power" },
          { id: "m2w78d", text: "ปุ่ม Attack → หัก HP ศัตรู: damage = player.attack - enemy.defense" },
          { id: "m2w78e", text: "ปุ่ม Item → ใช้ยา → เพิ่ม HP ผู้เล่น 20 จุด" },
          { id: "m2w78f", text: "Enemy AI: หลัง Player Attack → ศัตรู Attack กลับ" },
          { id: "m2w78g", text: "HP Bar (ProgressBar Node) อัปเดตตาม Script" },
          { id: "m2w78h", text: "Battle Log (RichTextLabel): 'Player attacks for 8 damage!'" },
          { id: "m2w78i", text: "Test: สู้ 1 รอบจนจบโดยไม่ Crash → โพสต์ GIF Devlog" },
        ]
      },
    ]
  },
  {
    id: "month3",
    emoji: "🗺️",
    label: "เดือน 3 — Core Loop ครบ",
    color: "#10b981",
    bg: "rgba(16,185,129,0.06)",
    border: "rgba(16,185,129,0.3)",
    goal: "เดิน → เก็บของ → สู้ — เชื่อมกันได้ทั้งหมด",
    weeks: [
      {
        id: "m3w910", label: "สัปดาห์ 9–10", title: "Map + Inventory + Random Encounter", time: "~16 ชม.",
        tasks: [
          { id: "m3w910a", text: "MapScene → 3 Location Nodes (ป่า, ถ้ำ, หมู่บ้าน) — Point-and-Click" },
          { id: "m3w910b", text: "Inventory: Dictionary {item_name: quantity} → UI แสดงรายการ" },
          { id: "m3w910c", text: "Random: เก็บของ 70% | เจอศัตรู 30% → trigger BattleScene" },
          { id: "m3w910d", text: "Test loop: Map → เก็บของ → เจอศัตรู → ชนะ → กลับ Map" },
        ]
      },
      {
        id: "m3w1112", label: "สัปดาห์ 11–12", title: "Enemy Sprites + ระบบธาตุ 3 สี", time: "~16 ชม.",
        tasks: [
          { id: "m3w1112a", text: "วาด Background: ป่า, เหมือง (Tile 16×16 ใน Aseprite)" },
          { id: "m3w1112b", text: "วาด Enemy Sprite 2 ตัว (ตัวละตัวไม่เกิน 2 วัน)" },
          { id: "m3w1112c", text: "ระบบธาตุ Fire/Water/Wood → Type Chart: Fire แพ้ Water → Dictionary ใน GDScript" },
          { id: "m3w1112d", text: "Damage Multiplier: ธาตุเอาชนะ = ×1.5" },
          { id: "m3w1112e", text: "โพสต์ Devlog: 'Demo เล่นได้แล้ว ยังไม่เสร็จแต่เล่นได้!' + GIF" },
        ]
      },
    ]
  },
  {
    id: "month4",
    emoji: "⚔️",
    label: "เดือน 4 — เนื้อหาครบ + Balance",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.3)",
    goal: "เนื้อหาครบขั้นต่ำ + Balance Testing เสร็จสิ้น",
    weeks: [
      {
        id: "m4", label: "ทั้งเดือน", title: "Content Checklist + Balance", time: "~32 ชม.",
        tasks: [
          { id: "m4a", text: "🗺️ โซน 3 แห่ง: ป่า / เหมือง / วิหาร — แต่ละโซนมี 3–5 ห้อง" },
          { id: "m4b", text: "👾 ศัตรู 5 ตัว — เขียน Stats ลงกระดาษก่อน แล้วค่อย Code ประหยัดเวลามาก" },
          { id: "m4c", text: "💊 ไอเทม 3 ชนิด: ยา HP +30 / ยาเพิ่ม Attack ×2 ใน 1 ตา / โล่ลด Damage 50%" },
          { id: "m4d", text: "⬆️ Upgrade 1 อย่าง: เก็บ EXP → เพิ่ม Attack หรือ Max HP" },
          { id: "m4e", text: "🏁 Boss ตัวสุดท้าย → ชนะ → จอ 'Demo End — Thank you for playing!'" },
          { id: "m4f", text: "🧪 Balance Test: ให้คน 2–3 คนเล่น → ถาม 'ยากหรือง่ายเกินไปไหม'" },
          { id: "m4g", text: "📊 ปรับตัวเลข HP/Damage ตามผล → Test อีกรอบ" },
        ]
      },
    ]
  },
  {
    id: "month5",
    emoji: "🚀",
    label: "เดือน 5 — Polish + ปล่อยเกม!",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.06)",
    border: "rgba(236,72,153,0.3)",
    goal: "Demo บน Itch.io พร้อมรับเงิน — มีคนโหลด 50+ ใน 1 เดือนแรก",
    weeks: [
      {
        id: "m5w1718", label: "สัปดาห์ 17–18", title: "Polish: Sound + Screen", time: "~16 ชม.",
        tasks: [
          { id: "m5a", text: "Sound FX: freesound.org → ค้นหา 'RPG attack', 'menu click', 'level up' → CC0 License เท่านั้น" },
          { id: "m5b", text: "BGM: opengameart.org → ค้นหา 'RPG background music'" },
          { id: "m5c", text: "Godot → AudioStreamPlayer Node → เล่นเสียงตามสถานการณ์" },
          { id: "m5d", text: "Title Screen: ชื่อเกม + ปุ่ม 'New Game' + รูปพื้นหลัง" },
          { id: "m5e", text: "Game Over Screen: 'You Died' + ปุ่ม 'Try Again' และ 'Main Menu'" },
          { id: "m5f", text: "เล่น Full Playthrough ตัวเอง → จด Bug → แก้เฉพาะที่รบกวนมาก" },
        ]
      },
      {
        id: "m5w19", label: "สัปดาห์ 19", title: "เตรียม Itch.io Page เกม", time: "~8 ชม.",
        tasks: [
          { id: "m5g", text: "Godot → Export → Web (HTML5) หรือ Windows → Test ว่า export แล้วเล่นได้จริง" },
          { id: "m5h", text: "GIF Gameplay 10–15 วินาที (แสดง Combat + Map)" },
          { id: "m5i", text: "Cover Image ใน Canva 630×500: ชื่อเกม + Screenshot สวยสุด" },
          { id: "m5j", text: "Screenshot 4 รูป: Map, Combat, Inventory, Boss" },
          { id: "m5k", text: "Description: 'What is this?' / 'How to play?' / 'What's in demo?'" },
          { id: "m5l", text: "ตั้งราคา: Pay what you want, min $0, suggested $3 → เปิด 'Accept donations'" },
        ]
      },
      {
        id: "m5w20", label: "สัปดาห์ 20 🎉", title: "LAUNCH DAY!", time: "~8 ชม.",
        tasks: [
          { id: "m5m", text: "Publish เกม → เปิดใน Incognito ตรวจทุกอย่างอีกรอบ" },
          { id: "m5n", text: "โพสต์ประกาศ X/TikTok: 'Demo พร้อมแล้ว!' + GIF + ลิงก์ Itch.io" },
          { id: "m5o", text: "Reddit: r/indiegaming, r/pixelart, r/gamedev — แนะนำตัวก่อน อย่า spam link" },
          { id: "m5p", text: "Discord: Godot Community + Pixel Art Community" },
          { id: "m5q", text: "เช็ค Analytics ทุกวัน → ตอบ Comment ทุกอัน" },
        ]
      },
    ]
  },
];

function countAll() {
  return SECTIONS.flatMap(s => s.weeks.flatMap(w => w.tasks)).length;
}
function countSection(section, checked) {
  return section.weeks.flatMap(w => w.tasks).filter(t => checked[t.id]).length;
}
function totalSection(section) {
  return section.weeks.flatMap(w => w.tasks).length;
}
function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function App() {
  const [checked, setChecked] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [openSections, setOpenSections] = useState({ urgent: true });
  const [saving, setSaving] = useState(false);
  const [syncCode, setSyncCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [syncStatus, setSyncStatus] = useState("local"); // "local" | "connected" | "error"
  const [showSync, setShowSync] = useState(false);
  const [copied, setCopied] = useState(false);
  const unsubRef = useRef(null);

  // Init: load local data + establish sync code
  useEffect(() => {
    let code = localStorage.getItem(SYNC_CODE_KEY);
    if (!code) {
      code = generateCode();
      localStorage.setItem(SYNC_CODE_KEY, code);
    }
    setSyncCode(code);

    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) setChecked(JSON.parse(local));
    } catch {}
    setLoaded(true);
  }, []);

  // Connect to Firestore when syncCode changes
  useEffect(() => {
    if (!syncCode || !db) {
      setSyncStatus("local");
      return;
    }

    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

    const docRef = doc(db, "checklists", syncCode);

    // Pull latest from cloud on first connect
    getDoc(docRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data().checked;
        if (data) {
          setChecked(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      }
      setSyncStatus("connected");
    }).catch(() => setSyncStatus("error"));

    // Real-time listener (ignores our own writes via hasPendingWrites)
    unsubRef.current = onSnapshot(
      docRef,
      snap => {
        if (snap.exists() && !snap.metadata.hasPendingWrites) {
          const data = snap.data().checked;
          if (data) {
            setChecked(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
        }
        setSyncStatus("connected");
      },
      () => setSyncStatus("error")
    );

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [syncCode]);

  async function toggle(id) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    if (db && syncCode) {
      try {
        await setDoc(doc(db, "checklists", syncCode), {
          checked: next,
          updatedAt: new Date().toISOString(),
        });
      } catch {}
    }
    setTimeout(() => setSaving(false), 600);
  }

  function toggleSection(id) {
    setOpenSections(s => ({ ...s, [id]: !s[id] }));
  }

  function connectCode() {
    const code = inputCode.trim().toUpperCase();
    if (code.length < 4) return;
    localStorage.setItem(SYNC_CODE_KEY, code);
    setSyncCode(code);
    setInputCode("");
    setShowSync(false);
  }

  function resetCode() {
    const code = generateCode();
    localStorage.setItem(SYNC_CODE_KEY, code);
    setSyncCode(code);
  }

  function copyCode() {
    navigator.clipboard.writeText(syncCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const total = countAll();
  const done = Object.values(checked).filter(Boolean).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const statusDot = {
    local: { color: "#6b7280", label: "บันทึกเฉพาะเครื่อง" },
    connected: { color: "#10b981", label: "ซิงค์แล้ว" },
    error: { color: "#ef4444", label: "ไม่ได้เชื่อมต่อ" },
  }[syncStatus];

  if (!loaded) return (
    <div style={{ background: "#0d0d1a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#7c3aed", fontFamily: "monospace", fontSize: 13, letterSpacing: 3 }}>LOADING...</div>
    </div>
  );

  return (
    <div style={{
      background: "#0d0d1a",
      minHeight: "100vh",
      fontFamily: "'Sarabun', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
      backgroundImage: "radial-gradient(ellipse at 15% 10%, rgba(124,58,237,0.12) 0%, transparent 50%), radial-gradient(ellipse at 85% 85%, rgba(6,182,212,0.08) 0%, transparent 50%)",
    }}>

      {/* HEADER */}
      <div style={{
        background: "rgba(19,19,43,0.95)",
        borderBottom: "1px solid #2a2a5a",
        padding: "16px 16px 12px",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#f59e0b", letterSpacing: 2, fontWeight: 700 }}>THE LAST SPRITE</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>แผนปฏิบัติการ 5 เดือน</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Sync button */}
              <button
                onClick={() => setShowSync(v => !v)}
                title="ตั้งค่าซิงค์"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: statusDot.color,
                  borderRadius: 4,
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: "'Sarabun', sans-serif",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusDot.color, display: "inline-block", flexShrink: 0 }} />
                ซิงค์
              </button>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: pct === 100 ? "#10b981" : "#fff" }}>{pct}%</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{done}/{total} ข้อ</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, background: "#1a1a35", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
              transition: "width 0.4s ease",
            }} />
          </div>
          {saving && <div style={{ fontSize: 10, color: "#10b981", marginTop: 4, letterSpacing: 1 }}>💾 บันทึกแล้ว</div>}
        </div>
      </div>

      {/* SYNC PANEL */}
      {showSync && (
        <div style={{
          background: "rgba(19,19,43,0.98)",
          borderBottom: "1px solid #2a2a5a",
          padding: "16px",
        }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>
              🔄 ซิงค์ข้ามอุปกรณ์
            </div>

            {!db && (
              <div style={{ fontSize: 12, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "10px 12px", marginBottom: 14, border: "1px solid rgba(245,158,11,0.3)" }}>
                ⚠️ ยังไม่ได้ตั้งค่า Firebase — ดู SETUP.md ในโปรเจกต์เพื่อเปิดซิงค์
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>Sync Code ของคุณ (แชร์ให้อุปกรณ์อื่น)</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{
                  fontFamily: "monospace", fontSize: 20, fontWeight: 800,
                  color: "#7c3aed", letterSpacing: 4, padding: "8px 16px",
                  background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)",
                  flex: 1, textAlign: "center",
                }}>{syncCode}</div>
                <button onClick={copyCode} style={btnStyle("#7c3aed")}>
                  {copied ? "✓ คัดลอกแล้ว" : "คัดลอก"}
                </button>
                <button onClick={resetCode} title="สร้างโค้ดใหม่" style={btnStyle("#374151")}>↺</button>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #2a2a5a", paddingTop: 12 }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>ใส่ Sync Code จากอุปกรณ์อื่น</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && connectCode()}
                  placeholder="เช่น AB12CD"
                  maxLength={8}
                  style={{
                    flex: 1, background: "#0d0d1a", border: "1px solid #2a2a5a",
                    color: "#e2e8f0", padding: "8px 12px", fontFamily: "monospace",
                    fontSize: 16, letterSpacing: 3, outline: "none",
                  }}
                />
                <button onClick={connectCode} style={btnStyle("#06b6d4")}>เชื่อมต่อ</button>
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 11, color: "#374151", lineHeight: 1.7 }}>
              สถานะ: <span style={{ color: statusDot.color }}>{statusDot.label}</span>
              {syncStatus === "connected" && <> · โค้ด <span style={{ fontFamily: "monospace", color: "#7c3aed" }}>{syncCode}</span></>}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px 12px 60px" }}>

        {SECTIONS.map(section => {
          const sdone = countSection(section, checked);
          const stotal = totalSection(section);
          const spct = stotal ? Math.round((sdone / stotal) * 100) : 0;
          const isOpen = !!openSections[section.id];

          return (
            <div key={section.id} style={{ marginBottom: 12, border: `1px solid ${section.border}`, background: section.bg }}>
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  padding: "14px 16px", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                }}
              >
                <span style={{ fontSize: 18 }}>{section.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{section.label}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{section.goal}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: section.color }}>{sdone}/{stotal}</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{spct}%</div>
                </div>
                <span style={{ color: "#6b7280", fontSize: 12, flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
              </button>

              <div style={{ height: 3, background: "rgba(255,255,255,0.05)", margin: "0 16px" }}>
                <div style={{ height: "100%", width: `${spct}%`, background: section.color, transition: "width 0.3s" }} />
              </div>

              {isOpen && (
                <div style={{ padding: "8px 0 12px" }}>
                  {section.weeks.map(week => {
                    const wdone = week.tasks.filter(t => checked[t.id]).length;
                    const wall = week.tasks.length;
                    return (
                      <div key={week.id} style={{ margin: "8px 12px 0", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                          background: "rgba(0,0,0,0.2)",
                        }}>
                          <span style={{ fontFamily: "monospace", fontSize: 9, color: "#f59e0b", fontWeight: 700, minWidth: 70 }}>{week.label}</span>
                          <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: "#fff" }}>{week.title}</span>
                          <span style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap" }}>{week.time}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            color: wdone === wall ? "#10b981" : "#6b7280",
                            whiteSpace: "nowrap",
                          }}>{wdone}/{wall}</span>
                        </div>
                        <div style={{ padding: "8px 14px" }}>
                          {week.tasks.map(task => (
                            <label key={task.id} style={{
                              display: "flex", gap: 10, alignItems: "flex-start",
                              padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.03)",
                              cursor: "pointer",
                            }}>
                              <div
                                onClick={() => toggle(task.id)}
                                style={{
                                  width: 18, height: 18, flexShrink: 0, marginTop: 1,
                                  border: checked[task.id] ? "2px solid #10b981" : "2px solid #2a2a5a",
                                  background: checked[task.id] ? "#10b981" : "transparent",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  transition: "all 0.15s", cursor: "pointer",
                                }}
                              >
                                {checked[task.id] && <span style={{ color: "#000", fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                              </div>
                              <span
                                onClick={() => toggle(task.id)}
                                style={{
                                  fontSize: 13, lineHeight: 1.5, flex: 1,
                                  color: checked[task.id] ? "#4b5563" : "#d1d5db",
                                  textDecoration: checked[task.id] ? "line-through" : "none",
                                  transition: "all 0.15s",
                                }}
                              >{task.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* DONT DO */}
        <div style={{
          marginTop: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)",
          padding: "14px 16px",
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#ef4444", marginBottom: 10 }}>⚠️ ห้ามทำก่อนปล่อย Demo</div>
          {["เพิ่มโซนมากกว่า 3 โซน", "ทำระบบ Crafting หรือ Quest ซับซ้อน", "วาดตัวละครเพิ่มก่อนที่ระบบจะทำงานได้", "รอให้งานสมบูรณ์ 100% ก่อนปล่อย"].map(d => (
            <div key={d} style={{ display: "flex", gap: 10, padding: "5px 0", fontSize: 13, color: "#fca5a5", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <span style={{ color: "#ef4444", fontWeight: 700 }}>✕</span>
              <span>{d}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(0,0,0,0.3)", borderLeft: "3px solid #f59e0b", fontSize: 13 }}>
            <strong style={{ color: "#fcd34d" }}>กฎ:</strong>{" "}
            <span style={{ color: "#e2e8f0" }}>ถ้าเล่นได้และไม่ Crash — ปล่อยได้แล้ว</span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 30, fontFamily: "monospace", fontSize: 9, color: "#374151", letterSpacing: 2 }}>
          THE LAST SPRITE · พฤษภาคม 2026
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg) {
  return {
    background: bg,
    border: "none",
    color: "#fff",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'Sarabun', sans-serif",
    whiteSpace: "nowrap",
  };
}
