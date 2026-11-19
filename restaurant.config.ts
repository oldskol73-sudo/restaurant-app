/**
 * ============================================================================
 *  RESTAURANT SETTINGS FILE  —  the ONLY file you edit to swap in a new restaurant
 * ============================================================================
 *  Change the name, logo, colors, hours, address, tax rate and the whole menu
 *  below, save, and the app updates. (Owners can also change many of these from
 *  inside the app on the "Settings" staff screen — those changes are saved on
 *  the phone and win over this file until you tap "Reset to defaults".)
 */

export type OptionChoice = { id: string; label: string; price: number };
export type OptionGroup = {
  id: string;
  label: string;
  required: boolean;
  multiple?: boolean;
  choices: OptionChoice[];
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  photo: string;
  /** Small tag shown on the photo, e.g. "Chef's Pick" */
  badge?: string;
  /** Sale tag (wine red). Set both to show a "was $X" price. */
  saleLabel?: string;
  wasPrice?: number;
  soldOut: boolean;
  /** Add-ons (sauces, extra bacon...) don't show in the main menu list. */
  isAddOn?: boolean;
  optionGroupIds: string[];
  /** Items that appear in "Complete the Plate" for this meal. */
  pairings: string[];
};

export type DayHours = { day: string; open: string; close: string; closed?: boolean };

// ---------------------------------------------------------------------------
// 1. THE BASICS
// ---------------------------------------------------------------------------
export const restaurant = {
  name: 'Sweet Savor Cafe',
  tagline: 'Pickup Kitchen',
  /** Big headline on the kitchen's front screen (white line, then orange line). */
  heroLine1: 'Fresh. Hot.',
  heroLine2: 'Ready for Pickup',
  heroSub: 'Order ahead, skip the line, and pay with PayPal or cash at the counter.',
  /** Two letters shown inside the gold logo ring. */
  monogram: 'SS',
  /** Optional: paste a web address of your logo image. Leave '' to use the monogram. */
  logoUrl: '',
  address: '214 Harbor Street, Portsmouth, NH 03801',
  phone: '(603) 555-0142',
  /** Sales tax, as a percent. 8 means 8%. */
  taxRatePercent: 8,
  currency: '$',
  /** 4-digit code staff type to open the staff screens. CHANGE THIS. */
  staffPin: '1234',
  /** Extra 4-digit code needed to open the Sales tab (reports). CHANGE THIS. */
  salesPin: '5678',
  /** Hours use 24-hour time. */
  hours: [
    { day: 'Monday', open: '11:00', close: '21:00' },
    { day: 'Tuesday', open: '11:00', close: '21:00' },
    { day: 'Wednesday', open: '11:00', close: '21:00' },
    { day: 'Thursday', open: '11:00', close: '22:00' },
    { day: 'Friday', open: '11:00', close: '23:00' },
    { day: 'Saturday', open: '10:00', close: '23:00' },
    { day: 'Sunday', open: '10:00', close: '20:00' },
  ] as DayHours[],
};

// ---------------------------------------------------------------------------
// 2. COLORS  (Modern Upscale palette)
// ---------------------------------------------------------------------------
export const palette = {
  background: '#0A0A0A', // near-black
  surface: '#151515',
  surfaceHigh: '#232323',
  accent: '#FF9F1C', // bright orange
  text: '#FFF6EA', // warm white
  muted: '#A39C93', // warm gray
  wine: '#C2362B', // brick red — sale tags & unpaid highlights
  success: '#5FA777',
  cream: '#FFE9D2', // soft peach used for light panels
};

// ---------------------------------------------------------------------------
// 3. REWARDS
// ---------------------------------------------------------------------------
export const rewards = {
  enabled: true,
  /** Every this-many orders earns one reward. */
  ordersPerReward: 5,
  rewardName: 'Free side of your choice',
  /** Menu category the reward discounts (cheapest item in that category is free). */
  rewardCategory: 'Sides',
  /** Points earned for every dollar spent. */
  pointsPerDollar: 10,
};

// ---------------------------------------------------------------------------
// 4. PAYMENTS  (pickup only: PayPal in-app or cash at the counter)
// ---------------------------------------------------------------------------
export const payments = {
  /** Paste your PayPal "Client ID" here when you go live. Empty = demo PayPal sheet. */
  paypalClientId: '',
  paypalBusinessName: 'Sweet Savor Cafe',
};

// ---------------------------------------------------------------------------
// 4b. SHARED DATABASE (Supabase). These two values are PUBLIC by design (safe to
//     commit). The database's own rules decide who can read or change what.
//     Leave both empty to run in local demo mode (data stays on one phone).
// ---------------------------------------------------------------------------
export const backend = {
  supabaseUrl: 'https://poyofvyolqsqfdjhjncv.supabase.co',
  supabaseKey: 'sb_publishable_rcIc5zBbjiXk2cb07gf45Q_vNnMgCsj',
};

// ---------------------------------------------------------------------------
// 5. MENU
// ---------------------------------------------------------------------------
export const categories = ['Entrees', 'Sandwiches', 'Sides', 'Drinks', 'Desserts'];

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;

export const optionGroups: OptionGroup[] = [
  {
    id: 'size',
    label: 'Size',
    required: true,
    choices: [
      { id: 'reg', label: 'Regular', price: 0 },
      { id: 'lg', label: 'Large', price: 2 },
    ],
  },
  {
    id: 'spice',
    label: 'Spice level',
    required: true,
    choices: [
      { id: 'mild', label: 'Mild', price: 0 },
      { id: 'med', label: 'Medium', price: 0 },
      { id: 'hot', label: 'Hot', price: 0 },
      { id: 'xhot', label: 'Nashville Hot', price: 0 },
    ],
  },
  {
    id: 'temp',
    label: 'How would you like it cooked?',
    required: true,
    choices: [
      { id: 'mr', label: 'Medium Rare', price: 0 },
      { id: 'm', label: 'Medium', price: 0 },
      { id: 'mw', label: 'Medium Well', price: 0 },
      { id: 'wd', label: 'Well Done', price: 0 },
    ],
  },
  {
    id: 'bun',
    label: 'Bun',
    required: false,
    choices: [
      { id: 'brioche', label: 'Toasted brioche', price: 0 },
      { id: 'gf', label: 'Gluten-free bun', price: 1.5 },
      { id: 'lettuce', label: 'Lettuce wrap', price: 0 },
    ],
  },
  {
    id: 'dressing',
    label: 'Dressing',
    required: true,
    choices: [
      { id: 'balsamic', label: 'Honey balsamic', price: 0 },
      { id: 'ranch', label: 'Buttermilk ranch', price: 0 },
      { id: 'lemon', label: 'Lemon & olive oil', price: 0 },
    ],
  },
  {
    id: 'ice',
    label: 'Ice',
    required: false,
    choices: [
      { id: 'reg', label: 'Regular ice', price: 0 },
      { id: 'light', label: 'Light ice', price: 0 },
      { id: 'none', label: 'No ice', price: 0 },
    ],
  },
];

export const menu: MenuItem[] = [
  // ------------------------------- ENTREES ---------------------------------
  {
    id: 'ribeye',
    name: 'Seared Ribeye',
    description:
      '12 oz dry-aged ribeye, finished with garlic-thyme butter and a red wine reduction. Served with crispy potatoes and charred broccolini.',
    price: 38,
    category: 'Entrees',
    photo: photo('1600891964092-4316c288032e'),
    badge: "Chef's Pick",
    soldOut: false,
    optionGroupIds: ['temp'],
    pairings: ['truffle-fries', 'mac', 'garden-salad', 'garlic-butter', 'fried-egg', 'iced-tea', 'tiramisu'],
  },
  {
    id: 'salmon',
    name: 'Pan-Roasted Salmon',
    description:
      'Crisp-skinned Atlantic salmon over lemon-herb risotto with blistered tomatoes and a light dill cream.',
    price: 29,
    category: 'Entrees',
    photo: photo('1467003909585-2f8a72700288'),
    soldOut: false,
    optionGroupIds: [],
    pairings: ['garden-salad', 'tomato-soup', 'lemonade', 'cheesecake', 'garlic-butter'],
  },
  {
    id: 'pappardelle',
    name: 'Wild Mushroom Pappardelle',
    description:
      'Fresh ribbon pasta tossed with roasted wild mushrooms, shallots, white wine and shaved parmesan.',
    price: 24,
    category: 'Entrees',
    photo: photo('1621996346565-e3dbc646d9a9'),
    soldOut: false,
    optionGroupIds: [],
    pairings: ['garden-salad', 'tomato-soup', 'iced-tea', 'tiramisu', 'extra-cheese'],
  },
  {
    id: 'ribs',
    name: 'Smoked Baby Back Ribs',
    description:
      'Half rack, hickory-smoked for six hours and glazed with our house bourbon barbecue. Served with slaw.',
    price: 32,
    category: 'Entrees',
    photo: photo('1544025162-d76694265947'),
    saleLabel: 'Weekend Special',
    wasPrice: 35,
    soldOut: false,
    optionGroupIds: [],
    pairings: ['onion-rings', 'mac', 'bbq', 'hot-honey', 'lemonade', 'brownie'],
  },
  {
    id: 'chicken',
    name: 'Herb-Roasted Half Chicken',
    description:
      'Free-range chicken brined overnight, roasted until golden, with pan jus, whipped potatoes and glazed carrots.',
    price: 26,
    category: 'Entrees',
    photo: photo('1762154194962-cccc677be031'),
    soldOut: false,
    optionGroupIds: [],
    pairings: ['mac', 'tomato-soup', 'garden-salad', 'iced-tea', 'cheesecake'],
  },

  // ------------------------------ SANDWICHES --------------------------------
  {
    id: 'gilded-burger',
    name: 'The Savor Burger',
    description:
      'Two smashed prime patties, aged cheddar, caramelized onions, pickles and truffle aioli on a toasted brioche bun.',
    price: 17,
    category: 'Sandwiches',
    photo: photo('1568901346375-23c9450c58cd'),
    badge: 'Signature',
    saleLabel: 'Lunch Deal',
    wasPrice: 19,
    soldOut: false,
    optionGroupIds: ['temp', 'bun'],
    pairings: ['truffle-fries', 'onion-rings', 'truffle-aioli', 'bacon', 'avocado', 'fried-egg', 'extra-cheese', 'lemonade', 'iced-tea'],
  },
  {
    id: 'smash-double',
    name: 'Double Smash Cheeseburger',
    description: 'Crispy-edged double patty, American cheese, shredded lettuce, house pickles and special sauce.',
    price: 15,
    category: 'Sandwiches',
    photo: photo('1550547660-d9450f859349'),
    soldOut: false,
    optionGroupIds: ['bun'],
    pairings: ['truffle-fries', 'onion-rings', 'bacon', 'extra-cheese', 'truffle-aioli', 'iced-tea', 'brownie'],
  },
  {
    id: 'hot-chicken',
    name: 'Nashville Hot Chicken Sandwich',
    description:
      'Buttermilk-fried chicken thigh brushed with hot oil, cool slaw and pickles on a soft potato roll.',
    price: 16,
    category: 'Sandwiches',
    photo: photo('1626082927389-6cd097cdc6ec'),
    badge: 'Fan Favorite',
    soldOut: false,
    optionGroupIds: ['spice'],
    pairings: ['truffle-fries', 'mac', 'hot-honey', 'bbq', 'avocado', 'lemonade', 'iced-tea'],
  },
  {
    id: 'short-rib',
    name: 'Short Rib Melt',
    description:
      'Braised short rib, gruyère and horseradish cream on grilled sourdough, with a side of au jus for dipping.',
    price: 18,
    category: 'Sandwiches',
    photo: photo('1606755962773-d324e0a13086'),
    soldOut: false,
    optionGroupIds: [],
    pairings: ['tomato-soup', 'truffle-fries', 'garden-salad', 'iced-tea', 'cold-brew'],
  },

  // -------------------------------- SIDES -----------------------------------
  {
    id: 'truffle-fries',
    name: 'Truffle Parmesan Fries',
    description: 'Hand-cut fries, white truffle oil, shaved parmesan and fresh parsley.',
    price: 8,
    category: 'Sides',
    photo: photo('1573080496219-bb080dd4f877'),
    badge: 'Popular',
    soldOut: false,
    optionGroupIds: ['size'],
    pairings: ['truffle-aioli', 'bbq'],
  },
  {
    id: 'onion-rings',
    name: 'Beer-Battered Onion Rings',
    description: 'Thick-cut sweet onions in a crisp lager batter with smoky dipping sauce.',
    price: 7,
    category: 'Sides',
    photo: photo('1639024471283-03518883512d'),
    soldOut: false,
    optionGroupIds: ['size'],
    pairings: ['bbq', 'truffle-aioli'],
  },
  {
    id: 'mac',
    name: 'Four-Cheese Mac',
    description: 'Cavatappi baked in a velvety blend of cheddar, gruyère, fontina and parmesan.',
    price: 8,
    category: 'Sides',
    photo: photo('1688248839500-a47ea459b2a4'),
    soldOut: false,
    optionGroupIds: ['size'],
    pairings: ['bacon', 'hot-honey'],
  },
  {
    id: 'garden-salad',
    name: 'Heirloom Garden Salad',
    description: 'Mixed greens, heirloom tomatoes, shaved radish, cucumber and toasted pepitas.',
    price: 9,
    category: 'Sides',
    photo: photo('1512621776951-a57141f2eefd'),
    soldOut: false,
    optionGroupIds: ['dressing'],
    pairings: ['avocado'],
  },
  {
    id: 'tomato-soup',
    name: 'Roasted Tomato Bisque',
    description: 'Slow-roasted tomatoes, cream and basil oil, served with a parmesan crouton.',
    price: 7,
    category: 'Sides',
    photo: photo('1547592166-23ac45744acd'),
    soldOut: false,
    optionGroupIds: ['size'],
    pairings: [],
  },

  // -------------------------------- DRINKS ----------------------------------
  {
    id: 'lemonade',
    name: 'House Lemonade',
    description: 'Fresh-squeezed lemons, cane sugar and a sprig of mint.',
    price: 4.5,
    category: 'Drinks',
    photo: photo('1621263764928-df1444c5e859'),
    soldOut: false,
    optionGroupIds: ['size', 'ice'],
    pairings: [],
  },
  {
    id: 'iced-tea',
    name: 'Black Currant Iced Tea',
    description: 'Cold-brewed black tea lightly sweetened with currant.',
    price: 4,
    category: 'Drinks',
    photo: photo('1556679343-c7306c1976bc'),
    soldOut: false,
    optionGroupIds: ['size', 'ice'],
    pairings: [],
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew Coffee',
    description: 'Steeped 18 hours, smooth and bold. Served over ice.',
    price: 4.5,
    category: 'Drinks',
    photo: photo('1509042239860-f550ce710b93'),
    soldOut: false,
    optionGroupIds: ['size', 'ice'],
    pairings: [],
  },

  // ------------------------------- DESSERTS ---------------------------------
  {
    id: 'lava-cake',
    name: 'Molten Chocolate Cake',
    description: 'Warm dark-chocolate cake with a molten center, vanilla gelato and sea salt.',
    price: 11,
    category: 'Desserts',
    photo: photo('1578985545062-69928b1d9587'),
    badge: "Chef's Pick",
    soldOut: false,
    optionGroupIds: [],
    pairings: ['cold-brew'],
  },
  {
    id: 'cheesecake',
    name: 'New York Cheesecake',
    description: 'Silky, dense and tangy on a graham crust with seasonal berry compote.',
    price: 10,
    category: 'Desserts',
    photo: photo('1533134242443-d4fd215305ad'),
    soldOut: false,
    optionGroupIds: [],
    pairings: ['cold-brew'],
  },
  {
    id: 'tiramisu',
    name: 'Classic Tiramisu',
    description: 'Espresso-soaked ladyfingers layered with mascarpone cream and cocoa.',
    price: 10,
    category: 'Desserts',
    photo: photo('1571877227200-a0d98ea607e9'),
    soldOut: false,
    optionGroupIds: [],
    pairings: ['cold-brew'],
  },
  {
    id: 'brownie',
    name: 'Fudge Brownie Sundae',
    description: 'Warm fudge brownie, vanilla gelato, salted caramel and toasted pecans.',
    price: 9,
    category: 'Desserts',
    photo: photo('1606313564200-e75d5e30476c'),
    soldOut: false,
    optionGroupIds: [],
    pairings: [],
  },

  // ------------------------------ ADD-ONS -----------------------------------
  { id: 'truffle-aioli', name: 'Truffle Aioli', description: 'Creamy, earthy dipping sauce.', price: 1, category: 'Sides', photo: '', soldOut: false, isAddOn: true, optionGroupIds: [], pairings: [] },
  { id: 'bbq', name: 'Bourbon BBQ Sauce', description: 'Sweet, smoky and sticky.', price: 0.75, category: 'Sides', photo: '', soldOut: false, isAddOn: true, optionGroupIds: [], pairings: [] },
  { id: 'hot-honey', name: 'Hot Honey Drizzle', description: 'Chili-infused wildflower honey.', price: 0.75, category: 'Sides', photo: '', soldOut: false, isAddOn: true, optionGroupIds: [], pairings: [] },
  { id: 'garlic-butter', name: 'Garlic Herb Butter', description: 'Melted over the top.', price: 1.25, category: 'Sides', photo: '', soldOut: false, isAddOn: true, optionGroupIds: [], pairings: [] },
  { id: 'bacon', name: 'Applewood Bacon', description: 'Thick-cut, two slices.', price: 2.5, category: 'Sides', photo: '', soldOut: false, isAddOn: true, optionGroupIds: [], pairings: [] },
  { id: 'avocado', name: 'Smashed Avocado', description: 'With lime and sea salt.', price: 2, category: 'Sides', photo: '', soldOut: false, isAddOn: true, optionGroupIds: [], pairings: [] },
  { id: 'extra-cheese', name: 'Extra Cheese', description: 'Another melty slice.', price: 1.5, category: 'Sides', photo: '', soldOut: false, isAddOn: true, optionGroupIds: [], pairings: [] },
  { id: 'fried-egg', name: 'Fried Egg', description: 'Farm egg, over easy.', price: 1.75, category: 'Sides', photo: '', soldOut: false, isAddOn: true, optionGroupIds: [], pairings: [] },
];
