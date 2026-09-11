/* ---------------------------------------------------------------------------
   Pripojenie na databázu — jediné miesto, ktoré treba vyplniť.

   Kde to nájdeš: Supabase → projekt drescher-cost-cockpit →
   Project Settings → API → Project URL a anon public key.

   Obe hodnoty sú VEREJNÉ, patria do repozitára. Prístup k dátam riadia
   výhradne pravidlá RLS a tabuľka cgos.access.
   Kľúč `service_role` sem NIKDY nepatrí.
--------------------------------------------------------------------------- */
window.CGOS_CONFIG = {
  url:     "https://gxtajhhkhpsjjehzazmk.supabase.co",     // napr. https://abcdefgh.supabase.co
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dGFqaGhraHBzamplaHphem1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMTg5NzYsImV4cCI6MjEwMzY5NDk3Nn0.siDuHS-5fq77bG70e8-kr7mDvJrx5u8gLJrWSc4ux3k"         // eyJhbGciOi...
};
