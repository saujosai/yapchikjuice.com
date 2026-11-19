// The strip manifest. This is the only file you edit to publish a new comic.
//
// To add a strip:
//   1. Copy its finished PNG/JPEG into site/comics/ (mark, sponsor, signature,
//      and copyright already composited onto the art).
//   2. Append an entry below with the next sequential number and its
//      publication date (the date the beehiiv article went live).
//   3. Redeploy. The highest number automatically becomes the home page.
//
// Entries are in chronological order, oldest first. `date` is display-only;
// ordering is by `number`.

window.COMICS = [
  {
    number: 1,
    slug: "frum-inventions",
    title: "Frum Inventions",
    date: "2026-11-06",
    image: "comics/frum-inventions.jpeg",
    alt: "A new look at safety: a frum inventor unveils his latest protective helmet."
  },
  {
    number: 2,
    slug: "rrrring-rrrring",
    title: "Rrrring Rrrring",
    date: "2026-11-07",
    image: "comics/rrrring-rrrring.png",
    alt: "A row of phones waits at a phone tower, each one ringing."
  },
  {
    number: 3,
    slug: "frum-tech-2",
    title: "Yapchik Juice - Frum Tech 2",
    date: "2026-11-09",
    image: "comics/frum-tech-2.png",
    alt: "A homemade catapult offers long-distance Shabbos transportation to a bar mitzvah on the other side of town."
  },
  {
    number: 4,
    slug: "kallah-couture",
    title: "Kallah Couture",
    date: "2026-11-10",
    image: "comics/kallah-couture.jpeg",
    alt: "The latest in kallah couture, modeled with great confidence."
  },
  {
    number: 5,
    slug: "shul-renovation",
    title: "Shul Renovation",
    date: "2026-11-11",
    image: "comics/shul-renovation.jpeg",
    alt: "A shul renovation with a very unexpected architect, as overheard in the title: \"I hear the architect was this yid Escher\"."
  },
  {
    number: 6,
    slug: "experiential-learning",
    title: "Experiential Learning",
    date: "2026-11-12",
    image: "comics/experiential-learning.png",
    alt: "A hands-on lesson that takes experiential learning rather too literally. Forward this to a Rebbe you know."
  },
  {
    number: 7,
    slug: "discount-chanuka-gifts",
    title: "Discount Chanuka Gifts",
    date: "2026-11-15",
    image: "comics/discount-chanuka-gifts.png",
    alt: "A discount Chanuka gift that she is going to love."
  },
  {
    number: 8,
    slug: "show-and-bath",
    title: "Show and Bath",
    date: "2026-11-18",
    image: "comics/show-and-bath.png",
    alt: "Two-panel comic: a father discovers his bathtub was taken for preschool show-and-tell. We'll never know."
  },
  {
    number: 9,
    slug: "factory-direct",
    title: "Factory Direct",
    date: "2026-11-19",
    image: "comics/factory-direct.png",
    alt: "The only real way to verify single donor hair: straight from the factory."
  }
];
