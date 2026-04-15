# Body Fat Visualizer App

אפליקציית MVP למובייל עם שני שלבים:
1. הערכת אחוז שומן חזותית מתוך תמונה.
2. יצירת הדמיה חדשה לפי שינוי יחסי באחוזי השומן.

## מה יש בפרויקט
- Next.js (App Router)
- מובייל-פירסט
- API route לניתוח תמונה
- API route ליצירת הדמיה חדשה
- תצוגת לפני/אחרי
- הורדת תמונה

## איך זה עובד
### Analyze
שולח את התמונה למודל חזון ומחזיר:
- אחוז שומן משוער
- טווח סביר
- רמת ביטחון
- הערות איכות

### Generate
שולח את התמונה המקורית + אחוז שומן משוער + דלתא (למשל ‎-4%)
ומבקש עריכה ריאליסטית של הגוף בלבד.

## הפעלה מקומית
```bash
npm install
cp .env.example .env.local
# ערוך OPENAI_API_KEY
npm run dev
```

## פריסה ל-Vercel
1. מעלים את הפרויקט ל-GitHub
2. מחברים את הריפו ל-Vercel
3. מוסיפים Environment Variable:
   - `OPENAI_API_KEY`
4. מבצעים Deploy

## הערות חשובות
- זו **הערכה חזותית בלבד**, לא בדיקה רפואית.
- תמונה עם גוף מלא, עמידה ישרה ותאורה טובה תשפר את התוצאה.
- תמונות עם חולצה רופפת או זווית לא טובה יקטינו דיוק.

## רפרנסים למחקר
המחקר תומך בכך שניתוח גוף מתמונות יכול להיות שימושי, אך אינו מחליף DXA או מדידה קלינית:
- Majmudar et al., 2022 — smartphone camera based assessment of adiposity
- Farina et al., 2022 — digital single-image smartphone assessment of total body fat
- Ferreira et al., 2025 — AI-2D photos vs DXA agreement study