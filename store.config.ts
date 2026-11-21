/**
 * ============================================================================
 *  STORE SETTINGS FILE — the products shown on the app's FRONT PAGE
 * ============================================================================
 *  Copied from https://iuicdc.company.site/products. Graphics are the ones
 *  used on that website for now; swap the `image` addresses when new
 *  artwork is ready. Edit this file to add, remove or rename anything.
 */

export const storeInfo = {
  name: 'iuic.dc',
  tagline: 'Store · Kitchen · Events · Giving',
  website: 'https://iuicdc.company.site',
  /** Where payment instructions come from on the website */
  paymentNote:
    'Complete your purchase on the iuic.dc website. For event tickets: after registering, pay via PayPal and send payment confirmation by DM to Ofc Abiyah or Ofc Stephen.',
};

const img = (id: string) => `https://d2j6dbq0eux0bg.cloudfront.net/images/128457045/${id}.jpg`;

export type ProductField = { id: string; label: string; placeholder: string; required: boolean };

export type StoreProduct = {
  id: string;
  categoryId: string;
  title: string;
  /** Price in dollars. Leave undefined when the website shows no fixed price. */
  price?: number;
  priceNote?: string;
  /** Web address, or a bundled file from the assets folder */
  image: string | number;
  description: string;
  /** Extra bullet lines shown under the description */
  details?: string[];
  /** Things the customer types in before adding to the bag */
  fields?: ProductField[];
  stock?: number;
  /** Page on the website for completing the purchase */
  url: string;
};

export type StoreCategory = {
  id: string;
  title: string;
  description: string;
  /** Web address, or a bundled file from the assets folder */
  image: string | number;
  /** Wide pictures are cropped to a circle on the home page: 0 = keep left side, 50 = center, 100 = keep right side */
  focusX?: number;
  /** 'kitchen' opens the restaurant ordering area inside the app */
  kind?: 'kitchen';
  url: string;
};

export const storeCategories: StoreCategory[] = [
  {
    id: 'alms',
    title: 'Alms',
    description: 'Give toward feeding the children and feast day needs.',
    image: require('./assets/Give-Alms.png'),
    focusX: 41,
    url: 'https://iuicdc.company.site/products/alms-193879506',
  },
  {
    id: 'kitchen',
    title: 'Sweet Savor Cafe',
    description: 'DC Kitchen — order pickup meals from the Sweet Savor Cafe.',
    image: require('./assets/Sweet-savor.jpg'),
    kind: 'kitchen',
    url: 'https://iuicdc.company.site/products/dc-kitchen-sweet-savor-cafe',
  },
  {
    id: 'events',
    title: 'Local School Events',
    description: 'Tickets and registration for local school events.',
    image: require('./assets/Fellowship-Fun.png'),
    focusX: 30,
    url: 'https://iuicdc.company.site/products/local-school-events',
  },
  {
    id: 'school-store',
    title: 'DC School Store',
    description: 'Purchase the latest Original Royalty products along with essential study supplies. Sowing services also available.',
    image: require('./assets/Store-Emblem.png'),
    url: 'https://iuicdc.company.site/products/dc-school-store',
  },
  {
    id: 'prophets',
    title: 'Traveling Prophets Support',
    description: 'Help us send our local Prophets worldwide. We appreciate your support to help spread the truth worldwide. Shalom. MHNCB',
    image: require('./assets/TP-Outreach.png'),
    focusX: 10,
    url: 'https://iuicdc.company.site/products/traveling-prophets-support',
  },
  {
    id: 'fundraisers',
    title: 'Fundraisers',
    description: "Shalom Israel. Let's support our local fundraiser events.",
    image: require('./assets/Community-Fundraiser.png'),
    focusX: 38,
    url: 'https://iuicdc.company.site/products/fundraisers',
  },
];

export const storeProducts: StoreProduct[] = [
  {
    id: 'wine-tasting-event',
    categoryId: 'events',
    title: 'Wine Tasting Event',
    price: 45,
    image: img('products/873584058/6349115369'),
    description: 'Join us for an afternoon wine tasting. Adults, all are welcome — married or single.',
    details: [
      'Date: 11/15/26',
      'Time: 3pm – 6pm',
      'Location: Will be provided after registration.',
      'Who can attend: Adults, all are welcome. Married or Single.',
      'Once registration is complete, send your payment via PayPal, then DM your payment confirmation to Ofc Abiyah or Ofc Stephen. Your registration and ticket will not be counted unless you complete these steps. Shalom. MHNCB',
    ],
    fields: [{ id: 'name', label: 'Name', placeholder: 'Name for the ticket', required: true }],
    stock: 4,
    url: 'https://iuicdc.company.site/products/wine-tasting-event',
  },
  {
    id: 'kids-plate-donation',
    categoryId: 'alms',
    title: 'Kids Plate Donation',
    priceNote: '$5 a month feeds a child',
    price: 5,
    image: require('./assets/Kids-Plate.png'),
    description: "Shalom Israel. Let's make sure we take care of our children. All we need is $5 a month to feed the children in the school. This is for after Sabbath meals.",
    url: 'https://iuicdc.company.site/products/kids-plate-donation',
  },
  {
    id: 'feast-day-alms',
    categoryId: 'alms',
    title: 'Feast Day Alms',
    image: img('5506470024'),
    description: 'Give toward feast day needs. Amount is set on the website at checkout.',
    url: 'https://iuicdc.company.site/products/feast-day-alms',
  },
];

/** Products pinned on the front page */
export const featuredProductIds = ['wine-tasting-event'];
