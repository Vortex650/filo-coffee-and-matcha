export const SITE_URL = "https://filocoffeeph.com";

/**
 * Pre-launch switch. When true, ordering CTAs appear in navigation and on the
 * homepage. Ordering routes stay functional either way.
 */
export const ORDERING_ENABLED = false;

export const business = {
  name: "Filo Coffee and Matcha",
  shortName: "Filo",
  tagline: "Crafted simply. Served warmly.",
  status: "Opening Soon",
  locality: "Reina Mercedes, Isabela",
  region: "Isabela, Philippines",
  address: null as string | null, // to be confirmed
  hours: null as string | null, // to be confirmed
  instagram: "https://instagram.com/filocoffee.ph",
  instagramHandle: "@filocoffee.ph",
  maps: "https://www.google.com/maps/search/?api=1&query=Reina+Mercedes+Isabela",
};

export const navLinks = [
  { label: "Our Story", to: "/#story" },
  { label: "Menu", to: "/menu" },
  { label: "Find Us", to: "/#find-us" },
  { label: "Contact", to: "/contact" },
];

/**
 * Central image registry. Swap these entries for official photography when it
 * is available — nothing else in the UI needs to change.
 *
 * Anything marked `placeholder: true` is temporary art direction, not the
 * actual café.
 */
export type SiteImage = { src: string; alt: string; placeholder: boolean };

const unsplash = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=75`;

export const images: Record<string, SiteImage> = {
  philosophy: {
    src: unsplash("photo-1495474472287-4d71bcdd2085", 1100),
    alt: "Placeholder: coffee being poured slowly",
    placeholder: true,
  },
  coffee: {
    src: unsplash("photo-1442512595331-e89e73853f31", 1100),
    alt: "Placeholder: coffee preparation detail",
    placeholder: true,
  },
  matcha: {
    src: unsplash("photo-1536256263959-770b48d82b0a", 1100),
    alt: "Placeholder: matcha being whisked",
    placeholder: true,
  },
  atmosphereOne: {
    src: unsplash("photo-1554118811-1e0d58224f24", 1200),
    alt: "Placeholder: warm café interior",
    placeholder: true,
  },
  atmosphereTwo: {
    src: unsplash("photo-1511920170033-f8396924c348", 800),
    alt: "Placeholder: coffee on a wooden table",
    placeholder: true,
  },
  atmosphereThree: {
    src: unsplash("photo-1521017432531-fbd92d768814", 800),
    alt: "Placeholder: café seating and light",
    placeholder: true,
  },
  momentCoffee: {
    src: unsplash("photo-1509042239860-f550ce710b93", 900),
    alt: "Placeholder: a warm cup of coffee",
    placeholder: true,
  },
  momentMatcha: {
    src: unsplash("photo-1515823064-d6e0c04616a7", 900),
    alt: "Placeholder: matcha latte",
    placeholder: true,
  },
  momentConnect: {
    src: unsplash("photo-1445116572660-236099ec97a0", 900),
    alt: "Placeholder: people sharing a table at a café",
    placeholder: true,
  },
  socialOne: {
    src: unsplash("photo-1497935586351-b67a49e012bf", 700),
    alt: "Placeholder: coffee and matcha still life",
    placeholder: true,
  },
  socialTwo: {
    src: unsplash("photo-1461023058943-07fcbe16d735", 700),
    alt: "Placeholder: iced coffee detail",
    placeholder: true,
  },
  socialThree: {
    src: unsplash("photo-1515823064-d6e0c04616a7", 700),
    alt: "Placeholder: matcha drink detail",
    placeholder: true,
  },
  socialFour: {
    src: unsplash("photo-1509042239860-f550ce710b93", 700),
    alt: "Placeholder: latte art",
    placeholder: true,
  },
  menuFallback: {
    src: unsplash("photo-1495474472287-4d71bcdd2085", 900),
    alt: "Placeholder: house coffee",
    placeholder: true,
  },
};
