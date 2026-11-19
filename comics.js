// The strip manifest. This is the only file you edit to publish a new comic.
//
// To add a strip:
//   1. Copy its finished PNG/JPEG into site/comics/ (mark, sponsor, signature,
//      and copyright already composited onto the art).
//   2. Append an entry below with the next sequential number, its publication
//      date (when the beehiiv article went live), and the image dimensions.
//   3. Run `node tools/build.js` to regenerate the static pages, then deploy.
//
// Entries are in chronological order, oldest first. `date` is display-only;
// ordering is by `number`. The highest number becomes the home page.

window.COMICS = [
  {
    number: 1,
    slug: "frum-inventions",
    title: "Frum Inventions",
    date: "2026-11-06",
    image: "comics/frum-inventions.jpeg",
    width: 1376,
    height: 768,
    alt: "A new look at safety: a frum inventor unveils his latest protective helmet."
  },
  {
    number: 2,
    slug: "rrrring-rrrring",
    title: "Rrrring Rrrring",
    date: "2026-11-07",
    image: "comics/rrrring-rrrring.png",
    width: 765,
    height: 1024,
    alt: "A row of phones waits at a phone tower, each one ringing."
  },
  {
    number: 3,
    slug: "frum-tech-2",
    title: "Yapchik Juice - Frum Tech 2",
    date: "2026-11-09",
    image: "comics/frum-tech-2.png",
    width: 1024,
    height: 765,
    alt: "A homemade catapult offers long-distance Shabbos transportation to a bar mitzvah on the other side of town."
  },
  {
    number: 4,
    slug: "kallah-couture",
    title: "Kallah Couture",
    date: "2026-11-10",
    image: "comics/kallah-couture.jpeg",
    width: 1088,
    height: 1445,
    alt: "The latest in kallah couture, modeled with great confidence."
  },
  {
    number: 5,
    slug: "shul-renovation",
    title: "Shul Renovation",
    date: "2026-11-11",
    image: "comics/shul-renovation.jpeg",
    width: 1264,
    height: 843,
    alt: "A shul renovation with a very unexpected architect, as overheard in the title: \"I hear the architect was this yid Escher\"."
  },
  {
    number: 6,
    slug: "experiential-learning",
    title: "Experiential Learning",
    date: "2026-11-12",
    image: "comics/experiential-learning.png",
    width: 896,
    height: 1200,
    alt: "A hands-on lesson that takes experiential learning rather too literally. Forward this to a Rebbe you know."
  },
  {
    number: 7,
    slug: "discount-chanuka-gifts",
    title: "Discount Chanuka Gifts",
    date: "2026-11-15",
    image: "comics/discount-chanuka-gifts.png",
    width: 896,
    height: 1200,
    alt: "A discount Chanuka gift that she is going to love."
  },
  {
    number: 8,
    slug: "show-and-bath",
    title: "Show and Bath",
    date: "2026-11-18",
    image: "comics/show-and-bath.png",
    width: 1448,
    height: 1138,
    alt: "Two-panel comic: a father discovers his bathtub was taken for preschool show-and-tell. We'll never know."
  },
  {
    number: 9,
    slug: "factory-direct",
    title: "Factory Direct",
    date: "2026-11-19",
    image: "comics/factory-direct.png",
    width: 1280,
    height: 721,
    alt: "The only real way to verify single donor hair: straight from the factory."
  }
];
