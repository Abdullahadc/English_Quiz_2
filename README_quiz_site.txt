# Free Quiz/Exam Website (GitHub Pages + Google Sheets)

**What you have here**
1. `english_exam_with_logging.html` – your exam page UI (timer, negative marking, one-attempt lock) that **logs scores to Google Sheets** via Apps Script.
2. `admin.html` – admin dashboard to **see all scores**, filter, and export CSV.
3. `apps_script.gs` – Google Apps Script backend for saving and listing scores.

## How to set up (10–15 minutes)

### A) Google Sheets + Apps Script (free)
1. Create a Google Sheet named **`exam_scores`** and a tab **`Scores`**.
2. Open **Extensions → Apps Script**. Paste the code from `apps_script.gs`.
   - Change `SECRET = 'CHANGE_ME_TOKEN'` to your own secret string. (You'll also paste the same into the HTML files.)
3. Click **Deploy → New deployment → Select type: Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone with the link
   - Deploy. Copy the **Web app URL**.

### B) Put the URL inside the exam page
Open `english_exam_with_logging.html`, find:
```js
const ENDPOINT = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
const SECRET  = 'CHANGE_ME_TOKEN';
```
Paste your URL and same secret.

### C) Host for free (GitHub Pages)
1. Create a public repo on GitHub.
2. Upload `english_exam_with_logging.html` and `admin.html` to the root.
3. Go to **Settings → Pages** → **Deploy from branch** (main branch, `/root`). After a minute, you’ll get a public URL.

Now open:
- Exam page: `https://<your-username>.github.io/<repo>/english_exam_with_logging.html`
- Admin page: `https://<your-username>.github.io/<repo>/admin.html`

Enter your Web App URL + token in the admin page to load scores.

## Notes
- This is fully free under normal classroom usage (Sheets & Apps Script quotas are generous).
- You can duplicate the exam page for different subjects. Just change `subjectKey` at the top.
- If you need stricter security, restrict the Web App to your Google Workspace and pass a rotating token, or move to Firebase Auth + Firestore later.