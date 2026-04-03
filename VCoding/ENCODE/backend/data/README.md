# Seed data

Place your Excel file here and run from backend root:

```bash
npm run seed
```

Or set `SEED_FILE` to the full path of your file.

**Expected Excel structure (Google Sheet export):**

- **First sheet** (e.g. "Lessons" or sheet name from export): one row per lesson  
  | Column | Header in sheet        | Purpose |
  |--------|------------------------|---------|
  | A      | Main Section           | Optional category (e.g. Coding Courses, Life & Character) |
  | B      | Course                 | Course title; course is auto-created if not present |
  | C      | Section                | Section title; section order is computed from first appearance |
  | D      | Lesson Title           | Lesson title |
  | E      | Order                  | Lesson order number |
  | F      | YouTube URL (Embedded) | Video URL (embed or watch format accepted) |

  Rows with empty Course or Lesson Title are skipped.

- **Sheet "Courses"** (optional): one row per course  
  Columns: `title`, `description`, `short_description`, `thumbnail`, `instructor`, `category`, `category_slug`, `difficulty`, `total_duration_hrs`, `rating`, `student_count`, `what_you_learn`

Column names are matched case-insensitively (e.g. "YouTube URL (Embedded)" → `youtube_url_embedded`).
