// Challenger videos shown on /community.
// Videos live in the Griptape India Google Drive folder (shared "anyone with link"):
// https://drive.google.com/drive/folders/19MJ77lrVhcTTmjHruVe97vz_ZkcnfstR
//
// To add someone: upload to that folder, copy the file ID from its share link
// (drive.google.com/file/d/<ID>/view) and add a row below.
// `pursuit` is the challenge they took on; `city` is optional.

export type Challenger = {
  name: string;
  driveId: string;
  cohort: number;
  pursuit?: string;
  city?: string;
};

export const challengers: Challenger[] = [
  { name: "Seet", pursuit: "Nuclear Fission", driveId: "1ADF-Funef2_qmdnQMWo1-NZRc2OeuPVi", cohort: 5 },
  { name: "Dibyanshu", pursuit: "Psychology", driveId: "1AaVK1b9TP9gnDjEgf_TAUcVJK-9fz399", cohort: 5 },
  { name: "Deeksha", pursuit: "Writing a Book", driveId: "1A0wZodEVQx8n8evIIt1WmSPQRUsgJ7Li", cohort: 5 },
  { name: "Shreya", pursuit: "Dance & Singing", driveId: "1oC39TppGo0OOJzKpKngr1x4rp6HF-4Un", cohort: 5 },
  { name: "Basant", pursuit: "Astronomy", driveId: "1M_XnUTGOKMcP6FIKVLVT2Zw8tU1iZ4dS", cohort: 5 },
  { name: "Yogita", pursuit: "Writing a Book", driveId: "1O0U8IVlQHIvIbQXU90girtSPdZ1C35WF", cohort: 5 },
  { name: "Ayesha", pursuit: "Electronics", driveId: "1QSlTQ7rLMnpKgDdCqf54CwYTT5CHWA-q", cohort: 5 },
  { name: "Sushmita", pursuit: "Videography", driveId: "1ky3CfOUUVM9PHtjpRzLbhg03lyu1PnF8", cohort: 5 },
  { name: "Yashaswini", pursuit: "Singing", driveId: "1wf7whuK88rlEiYmYpmK4w_nNezsmF2FA", cohort: 5 },
  { name: "Rinku", pursuit: "Singing", driveId: "1WWz2skX5XPGJDr96FZrhr4cjFl45hhC4", cohort: 5 },
  { name: "Amulya", pursuit: "Singing", driveId: "1vU8RAJsBir1xPfaM20fyx_adfhFLsF9M", cohort: 5 },
  { name: "Preetam", pursuit: "Animation", driveId: "1rUeEKjfZyq2DDWz-W45hN90yJIQlCwvN", cohort: 5 },
  { name: "Shitej", pursuit: "Designing", driveId: "1-dacr-5_ntyqvE8ReM2DGaHvhfxaC592", cohort: 5 },
  { name: "Mahalaxmi", pursuit: "Photography", driveId: "1T3nV2vyaBc7Zew2Yyo83q88JyySEZQsu", cohort: 5 },
  { name: "Kushal", pursuit: "UI/UX Design", driveId: "1k-NMKIhKPI1-1kP5SZ5qJVMQCfQ_uBeU", cohort: 5 },
  { name: "Snehal", pursuit: "Drawing", driveId: "10FUVUur4bc3LLWujdJuJ3zOmVxJycbVL", cohort: 5 },
  { name: "Navdeep", pursuit: "Sketching", driveId: "12aqDIWIM8B90X0hGE0Ha2Z0AN_11a9Ln", cohort: 5 },
  { name: "Vishal", pursuit: "Science", driveId: "1nv-zD55_8Kupl5wGarVI1d2338uTlpRf", cohort: 5 },
  { name: "Saba", pursuit: "Guitar & Singing", driveId: "1TCtJFSN8ub4FWPVXfiRiUs-CxJ2NqWna", cohort: 5 },
  { name: "Sowjanya", pursuit: "Dance", driveId: "1lO2Nh0RDHqhmbyvU0aeRw4ILEbysrsop", cohort: 5 },
];
