# The Last Sprite — Action Plan · Setup Guide

## ทดลองรันในเครื่อง

```bash
npm install
npm run dev
# เปิด http://localhost:5173/The-Sprite/
```

ถ้าไม่ได้ตั้งค่า Firebase แอปยังใช้ได้ แต่บันทึกเฉพาะในเครื่องนั้น (localStorage)

---

## เปิดซิงค์ข้ามอุปกรณ์ (Firebase)

### 1. สร้าง Firebase Project (ฟรี)

1. ไปที่ [console.firebase.google.com](https://console.firebase.google.com)
2. คลิก **Add project** → ตั้งชื่อ เช่น `the-sprite-checklist`
3. ปิด Google Analytics ได้เลย → **Create project**

### 2. เปิด Firestore Database

1. ในโปรเจกต์ → เมนูซ้าย **Firestore Database** → **Create database**
2. เลือก **Start in production mode** → เลือก region ใกล้ที่สุด → **Enable**
3. ไปที่ **Rules** → แทนทั้งหมดด้วย:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /checklists/{code} {
      allow read, write: if true;
    }
  }
}
```

4. คลิก **Publish**

### 3. เอา Firebase Config

1. โปรเจกต์ → ไอคอนเฟือง → **Project settings**
2. เลื่อนลง **Your apps** → คลิก **</>** (Web app)
3. ตั้งชื่อ App → **Register app**
4. จะได้ config แบบนี้:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123:web:abc..."
};
```

### 4. ตั้งค่า .env (รันในเครื่อง)

```bash
cp .env.example .env
```

แก้ `.env` ใส่ค่าจาก Firebase config:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123...
VITE_FIREBASE_APP_ID=1:123:web:abc...
```

---

## Deploy ขึ้น GitHub Pages (อัตโนมัติ)

### 1. ใส่ Firebase Secrets ใน GitHub

1. ไปที่ repo → **Settings** → **Secrets and variables** → **Actions**
2. คลิก **New repository secret** ทีละตัว:

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | ค่าจาก Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | ค่าจาก Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ค่าจาก Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | ค่าจาก Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ค่าจาก Firebase |
| `VITE_FIREBASE_APP_ID` | ค่าจาก Firebase |

### 2. เปิด GitHub Pages

1. repo → **Settings** → **Pages**
2. **Source** → เลือก **GitHub Actions**
3. Push โค้ดขึ้น `main` → GitHub จะ build และ deploy อัตโนมัติ
4. แอปจะอยู่ที่ `https://<username>.github.io/The-Sprite/`

---

## วิธีซิงค์ข้ามอุปกรณ์

1. เปิดแอปในอุปกรณ์ที่ 1 → กดปุ่ม **ซิงค์** ที่ header
2. จะเห็น **Sync Code** 6 ตัวอักษร เช่น `AB12CD`
3. กด **คัดลอก**
4. เปิดแอปในอุปกรณ์ที่ 2 → กด **ซิงค์** → วาง Code → **เชื่อมต่อ**
5. ข้อมูลจะซิงค์แบบ real-time ทั้งสองเครื่อง
