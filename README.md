# موقع دوبلي (Dubli) — static site

موقع تعريفي صغير لتطبيق **دوبلي**. صفحة واحدة ثابتة (HTML/CSS/JS)، بدون أي خادم، بدون نماذج، بدون تتبّع، وبدون أي طلب
خارجي (الخط والأيقونة واللقطات كلها داخل المجلد).

## الملفات
```
website/
  index.html                      الصفحة (كل الـ CSS والـ JS بداخلها)
  assets/
    dubli-icon.png                أيقونة التطبيق (256px)
    favicon-96.png                أيقونة التبويب
    IBMPlexSansArabic-Medium.ttf  خط التطبيق (OFL)
    IBMPlexSansArabic-OFL.txt     رخصة الخط
  shots/
    themes.jpg                    لقطة حقيقية: الإعدادات + لوحة الألوان
    live.jpg                      لقطة حقيقية: مساحة الترجمة الحية
  README.md
```

## تفعيل زر التحميل (مهم)
الزر **معطّل** عمداً لين ينزل أول إصدار. افتح `index.html` وعدّل هذا الجزء فقط (في بداية الـ `<script>`):

```js
var CFG = {
  nameAr: 'دوبلي',
  nameEn: 'Dubli',
  fileName: 'Dubli.exe',
  release: { url: '', sha256: '', version: '' }
};
```

- `url`: رابط التحميل المباشر للملف.
- `sha256`: بصمة SHA-256 للملف (من الأمر `Get-FileHash -Algorithm SHA256 .\Dubli.exe`).
- `version`: اسم/رقم النسخة (اختياري).

الزر ما يشتغل إلا لمّا **الرابط والبصمة** الاثنين مملوءين بإصدار حقيقي ومجرَّب. لا تحط رابطاً وهمياً.

## النشر

### GitHub Pages
1. ارفع محتويات مجلد `website/` إلى مستودع (أو خلّ المستودع كامل وحدّد مجلد `/website`).
2. في المستودع: **Settings → Pages**.
3. **Source**: "Deploy from a branch"، اختر الفرع `main` والمجلد `/root` (لو الملفات بجذر المستودع) أو `/website`.
4. احفظ، وبعد دقيقة يعطيك رابط `https://<اسمك>.github.io/<المستودع>/`.

> ملاحظة: مجلد `website/` داخل مستودع `sada`. لو تبي رابطاً نظيفاً، سوِّ مستودعاً مستقلاً اسمه مثلاً `dubli-site` وحط فيه
> محتويات `website/` بالجذر، وفعّل Pages عليه.

### Cloudflare Pages
1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages**.
2. اربط حساب GitHub واختر المستودع.
3. **Build command**: اتركه فاضي. **Build output directory**: `website` (أو `/` لو الملفات بالجذر).
4. **Save and Deploy** — يعطيك رابط `https://<المشروع>.pages.dev`.

لا يحتاج أي خطوة بناء: الموقع ملفات ثابتة جاهزة.

## تجربة محلية
افتح `index.html` مباشرة بالمتصفّح، أو شغّل خادماً بسيطاً داخل المجلد:
```bash
python -m http.server 8080
```
ثم افتح `http://localhost:8080`.

## ملاحظات
- يدعم RTL عربي + تبديل إنجليزي، فاتح/داكن، ولوحة ألوان بنفس ثيمات التطبيق — الاختيارات تُحفظ في المتصفّح (localStorage).
- اللقطات حقيقية من التطبيق (مو صور ألعاب). الرسم «قبل/بعد» في الأعلى موضَّح أنه رسم توضيحي.
- الخط IBM Plex Sans Arabic برخصة OFL (نفس خط التطبيق)، مرفقة رخصته.
