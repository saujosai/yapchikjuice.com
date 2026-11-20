// The strip manifest. This is the only file you edit to publish a new comic.
//
// To add a strip:
//   1. Copy its finished PNG/JPEG into site/comics/ (mark, sponsor, signature,
//      and copyright already composited onto the art).
//   2. Append an entry below with the next sequential number, its publication
//      date (when the beehiiv article went live), and the image dimensions.
//   3. Run `node tools/build.js` to regenerate the static pages, then deploy.
//
// `alt` is the full, literal image description for screen readers.
// `lead` is the short, curiosity-building SEO lead-in: it must tease the strip
//   without revealing the punchline.
// `thumb` is the cropped image used for search/social previews. Generate it
//   with `python3 tools/make-thumbs.py` (see that script for the crop boxes).
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
    alt: "A new look at safety: a frum inventor unveils his latest protective helmet.",
    lead: "Riding a scooter through the neighborhood comes with a few unusual complications. One inventor thinks he's solved them all.",
    thumb: "comics/thumbs/frum-inventions.jpg"
  },
  {
    number: 2,
    slug: "rrrring-rrrring",
    title: "Rrrring Rrrring",
    date: "2026-11-07",
    image: "comics/rrrring-rrrring.png",
    width: 765,
    height: 1024,
    alt: "A row of phones waits at a phone tower, each one ringing.",
    lead: "It's a quiet morning in the shul — until one man's phone starts ringing. Then another. Then another.",
    thumb: "comics/thumbs/rrrring-rrrring.jpg"
  },
  {
    number: 3,
    slug: "frum-tech-2",
    title: "Yapchik Juice - Frum Tech 2",
    date: "2026-11-09",
    image: "comics/frum-tech-2.png",
    width: 1024,
    height: 765,
    alt: "A homemade catapult offers long-distance Shabbos transportation to a bar mitzvah on the other side of town.",
    lead: "A simcha across town and a very unusual way to get there. The helmet is included.",
    thumb: "comics/thumbs/frum-tech-2.jpg"
  },
  {
    number: 4,
    slug: "kallah-couture",
    title: "Kallah Couture",
    date: "2026-11-10",
    image: "comics/kallah-couture.jpeg",
    width: 1088,
    height: 1445,
    alt: "The latest in kallah couture, modeled with great confidence.",
    lead: "The jeweler has a new collection for kallahs, and it might just become the next essential.",
    thumb: "comics/thumbs/kallah-couture.jpg"
  },
  {
    number: 5,
    slug: "shul-renovation",
    title: "Shul Renovation",
    date: "2026-11-11",
    image: "comics/shul-renovation.jpeg",
    width: 1264,
    height: 843,
    alt: "A shul renovation with a very unexpected architect, as overheard in the title: \"I hear the architect was this yid Escher\".",
    lead: "The shul renovation is finally finished. Something about the new design feels a little off.",
    thumb: "comics/thumbs/shul-renovation.jpg"
  },
  {
    number: 6,
    slug: "experiential-learning",
    title: "Experiential Learning",
    date: "2026-11-12",
    image: "comics/experiential-learning.png",
    width: 896,
    height: 1200,
    alt: "A hands-on lesson that takes experiential learning rather too literally. Forward this to a Rebbe you know.",
    lead: "Rabbi Heller is a firm believer in learning by doing. His latest lesson is especially hands-on.",
    thumb: "comics/thumbs/experiential-learning.jpg"
  },
  {
    number: 7,
    slug: "discount-chanuka-gifts",
    title: "Discount Chanuka Gifts",
    date: "2026-11-15",
    image: "comics/discount-chanuka-gifts.png",
    width: 896,
    height: 1200,
    alt: "A discount Chanuka gift that she is going to love.",
    lead: "Still looking for the perfect Chanuka gift? This one might be the most practical present she gets all year.",
    thumb: "comics/thumbs/discount-chanuka-gifts.jpg"
  },
  {
    number: 8,
    slug: "show-and-bath",
    title: "Show and Bath",
    date: "2026-11-18",
    image: "comics/show-and-bath.png",
    width: 1448,
    height: 1138,
    alt: "Two-panel comic: a father discovers his bathtub was taken for preschool show-and-tell. We'll never know.",
    lead: "Binyamin had a very eventful day at preschool. His parents have some questions.",
    thumb: "comics/thumbs/show-and-bath.jpg"
  },
  {
    number: 9,
    slug: "factory-direct",
    title: "Factory Direct",
    date: "2026-11-19",
    image: "comics/factory-direct.png",
    width: 1280,
    height: 721,
    alt: "The only real way to verify single donor hair: straight from the factory.",
    lead: "She's found the hair of her dreams at a price that seems too good to be true. But is it really?",
    thumb: "comics/thumbs/factory-direct.jpg"
  },
  {
    number: 10,
    slug: "the-benjamins",
    title: "The Benjamins",
    date: "2026-11-20",
    image: "comics/the-benjamins.png",
    width: 1408,
    height: 1117,
    alt: "In a wood-paneled shoe store, a smiling saleswoman holds up a pair of loafers made from hundred-dollar bills with Benjamin Franklin portraits while a mother and her teenage daughter look on hopefully.",
    lead: "A mother and daughter are shopping for shoes, and the daughter has very firm ideas about what everyone is wearing. The answer may cost more than they thought.",
    thumb: "comics/thumbs/the-benjamins.jpg"
  }
];
