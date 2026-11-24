# Yashil Maydon

Mini futbol stadionini bron qilish uchun React 18, TypeScript va Vite ilovasi. Hozirgi versiya backend'siz ishlaydi: mock API ma'lumotlarni brauzer `localStorage`'ida saqlaydi.

## O'rnatish va ishga tushirish

```bash
npm install
npm run dev
```

Production build va TypeScript tekshiruvi:

```bash
npm run build
npm run lint
```

## Demo admin

- Telefon: `+998900000000`
- Parol: `admin123`
- Admin sahifa: `/admin`

Bu demo mock autentifikatsiya hisoblanadi. Parollar mahalliy brauzerda ochiq saqlanadi; haqiqiy foydalanuvchilar yoki internetga ochiq production uchun ishlatmang.

## Backend'ga ulash

`src/services/api.ts` hozirgi persistence adapteridir. `api` obyektining metodlarini HTTP so'rovlari bilan almashtiring, javoblarni `src/types/index.ts` turlariga mos tekshiring. Har bir metod async `Promise` qaytaradi; shu sababli Zustand store va UI backend almashuvida o'zgarish talab qilmaydi. Production autentifikatsiyada parolni server tomonda xeshlash, sessiyani xavfsiz cookie/token bilan boshqarish va slot bronlashni server tranzaksiyasida atomik tekshirish kerak. `localStorage` mock ma'lumotini backend bazasiga ko'chirmang.

Maydon narxlari va aloqa ma'lumotlari `src/config/stadium.ts` ichida sozlanadi. Tarjimalar `src/i18n/uz.json`, `ru.json` va `en.json` fayllarida.
