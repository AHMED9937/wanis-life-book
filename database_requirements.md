# Database Requirements for Wanis (ونيس)

This document outlines the full data requirements necessary to generate the Entity-Relationship Diagram (ERD) for the Wanis application. It fully supports the **"One Life Book per Resident"** architecture and multi-tenant (Care Home) structure.

---

## 1. Core Entities & Attributes

### 1.1 Care Home (`care_homes`)
*Represents the nursing home or organization using the app.*
- **ID:** Primary Key (UUID)
- **Name:** String (e.g., "دار الأمان لرعاية المسنين")
- **Contact Number:** String
- **Address:** Text
- **Timestamps:** Created At, Updated At

### 1.2 User (`users`)
*Staff members (Caregivers, Admins) who log in via Clerk to record stories.*
- **ID:** Primary Key (UUID)
- **Clerk ID:** String (Unique identifier from Clerk Auth)
- **Care Home ID:** Foreign Key (References `care_homes`) - *A user belongs to a specific care home.*
- **Role:** Enum (`admin`, `caregiver`)
- **Full Name:** String
- **Email:** String (Unique)
- **Avatar URL:** String
- **Timestamps:** Created At, Updated At

### 1.3 Resident (`residents` / الأجداد والجدات)
*The elderly individuals residing in the care home. By definition, creating a resident automatically implies the creation of their "Life Book".*
- **ID:** Primary Key (UUID)
- **Care Home ID:** Foreign Key (References `care_homes`)
- **First Name:** String
- **Last Name / Family Name:** String
- **Gender:** Enum (`male`, `female`)
- **Date of Birth:** Date (Optional)
- **Room Number:** String (Optional)
- **Profile Image URL:** String (Optional)
- **Timestamps:** Created At, Updated At

### 1.4 Life Book (`life_books` / كتاب الحياة)
*While closely tied 1:1 with a Resident, separating the Book allows us to store book-specific customization (like cover design) independently of the resident's personal medical/administrative data.*
- **ID:** Primary Key (UUID)
- **Resident ID:** Foreign Key (References `residents` - Unique/1-to-1)
- **Book Title:** String (Default: "مذكرات [اسم المقيم]" e.g., "مذكرات أبو محمد")
- **Cover Style:** Enum (`classic_leather`, `vintage_gold`, `forest_green`) - Allows visual customization of the book cover.
- **Timestamps:** Created At, Updated At

### 1.5 Story (`stories` / حكايات)
*A single chapter or memory recorded inside a specific Life Book.*
- **ID:** Primary Key (UUID)
- **Life Book ID:** Foreign Key (References `life_books`) - *Which book this story belongs to.*
- **Recorded By:** Foreign Key (References `users`) - *The caregiver who pressed record.*
- **Audio File URL:** String (URL to Vercel Blob where the raw voice is stored)
- **Raw Transcript:** Text (The raw Whisper AI text)
- **Literary Content:** Text (The final, polished GPT-4o story text)
- **Title:** String (AI-generated title for the chapter, e.g., "أيام المدرسة")
- **Status:** Enum (`processing`, `ready`, `failed`)
- **Duration Seconds:** Integer (Length of the audio recording)
- **Timestamps:** Created At, Updated At

### 1.6 Share Link (`share_links` / روابط المشاركة)
*Used when a caregiver wants to share a story or an entire Life Book with a resident's family member securely.*
- **ID:** Primary Key (UUID)
- **Type:** Enum (`single_story`, `full_book`)
- **Life Book ID:** Foreign Key (References `life_books`) - *Required if sharing the whole book.*
- **Story ID:** Foreign Key (References `stories`) - *Required if sharing just one story (nullable).*
- **Access Token:** String (Unique hash for the public URL)
- **Expires At:** Timestamp (Optional - for temporary access)
- **Timestamps:** Created At

---

## 2. Entity Relationships (For the ERD)

1. **`care_homes` to `users`:** One-to-Many (1:N). A care home has many caregivers.
2. **`care_homes` to `residents`:** One-to-Many (1:N). A care home has many residents.
3. **`residents` to `life_books`:** One-to-One (1:1). Each resident has exactly one Life Book.
4. **`life_books` to `stories`:** One-to-Many (1:N). A single Life Book contains many stories/chapters.
5. **`users` to `stories`:** One-to-Many (1:N). A caregiver can record many stories (across different books).
6. **`life_books` to `share_links`:** One-to-Many (1:N). A book can have multiple sharing links generated for families.

---

## 3. Business Logic constraints
- If a `Resident` is deleted, their `Life Book` and all associated `Stories` should cascade delete.
- A `Share Link` of type `single_story` MUST have a `Story ID`. A `Share Link` of type `full_book` MUST have a `Life Book ID` and NULL for `Story ID`.
- The `Stories` table uses a status enum (`processing`, `ready`, `failed`) to handle the asynchronous nature of the Whisper/GPT AI pipeline so the UI knows when to show a loading spinner.
