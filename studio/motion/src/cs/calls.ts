// Real calls from the brief, true as of 17 Oct 2026, soonest first. Each one
// says what it gives, then when it closes.
export type Call = { closes: string; name: string; gives: string };

export const CALLS: Call[] = [
  { closes: "20 Oct", name: "Finnish Film Foundation development", gives: "Up to €250,000" },
  { closes: "22 Oct", name: "Screen Australia First Nations Development", gives: "Up to AUD 65,000" },
  { closes: "24 Oct", name: "Doha Film Institute Short Script Lab", gives: "Online, one-to-one mentoring" },
  { closes: "26 Oct", name: "Film Independent x Humana Foundation Shorts", gives: "$100,000 a team, five teams" },
  { closes: "31 Oct", name: "Roy W. Dean Fall Grant", gives: "$3,500 + $20,000+ in services" },
  { closes: "2 Nov", name: "CNC documentary innovation, writing", gives: "€10,000 to the author" },
  { closes: "3 Nov", name: "Sundance Merata Mita Fellowship 2027", gives: "Free to enter" },
  { closes: "3 Nov", name: "TorinoFilmLab ScriptLab", gives: "Five modules, Malta to Turin" },
  { closes: "3 Nov", name: "CPH:FORUM", gives: "Pitch + financier meetings" },
];

// The one that gets circled.
export const CIRCLED = 6;
