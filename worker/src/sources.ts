import type { Source } from "./types";

// Prefer official employer pages. Aggregators are discovery sources; the crawler
// follows a vacancy link and still requires explicit 2027 evidence on the page.
export const sources: Source[] = [
  { name: "Samsung Early Careers", employer: "Samsung", url: "https://www.samsung.com/uk/about-us/careers/emerging-talent/" },
  { name: "Diageo Graduates", employer: "Diageo", url: "https://www.diageo.com/en/careers/early-careers/graduate-programmes" },
  { name: "Unilever Careers", employer: "Unilever", url: "https://careers.unilever.com/uk-early-careers" },
  { name: "L'Oreal Careers", employer: "L'Oréal", url: "https://careers.loreal.com/en_US/content/UnitedKingdomGraduates" },
  { name: "Nestlé UK Careers", employer: "Nestlé", url: "https://www.nestle.co.uk/en-gb/jobs/students-graduates" },
  { name: "P&G UK Careers", employer: "Procter & Gamble", url: "https://www.pgcareers.com/eu/en/uk-students" }
];
