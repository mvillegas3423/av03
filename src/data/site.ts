export const site = {
  name: 'GOLDEN ERA MOTORS',
  // wordmark / logo pieces (used in the nav + footer wordmark)
  brandShort: 'GOLDEN ERA',
  brandTail: 'MOTORS',
  monogram: 'G',
  tagline: 'American classics · Sales & restoration',
  description:
    'Classic American car sales, restoration and service. Hand-picked vintage vehicles with documented history and concours-level workmanship.',
  phone: '+1 (231) 371-0656',
  phoneHref: 'tel:+12313710656',
  email: 'info@goldeneramotors.site',
  address: '3400 Michigan Avenue, Detroit, MI',
  hours: 'Mon–Sat · 9:00–18:00',
  url: 'https://goldeneramotors.site',
  established: '1978',
} as const;

export interface NavItem {
  label: string;
  href: string;
}

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Inventory', href: '/catalog/' },
  { label: 'Restoration', href: '/services/' },
  { label: 'Shipping', href: '/shipping/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contacts/' },
];

export interface Service {
  slug: string;
  title: string;
  description: string;
  price: string;
  /** illustrated plate in /public/scenes */
  image: string;
  alt: string;
}

export const services: Service[] = [
  {
    slug: 'restoration',
    title: 'Full Restoration',
    description:
      'Frame-off restorations to concours standard — documented, photographed and delivered with a full build file.',
    price: 'from $45,000',
    image: '/scenes/service-restoration.webp',
    alt: 'Illustration of a classic car raised on a two-post lift with its wheels set aside',
  },
  {
    slug: 'engine',
    title: 'Engine & Drivetrain',
    description:
      'Matching-numbers rebuilds, period-correct carburetion and transmission work by marque specialists.',
    price: 'from $8,500',
    image: '/scenes/service-engine.webp',
    alt: 'Illustration of a V8 engine block with valve covers, spark plugs and belt drive',
  },
  {
    slug: 'bodywork',
    title: 'Paint & Bodywork',
    description:
      'Metal finishing, lead work and period-correct lacquer or base-coat finishes matched to original codes.',
    price: 'from $12,000',
    image: '/scenes/service-bodywork.webp',
    alt: 'Illustration of a spray gun laying a fan of paint onto a car panel',
  },
  {
    slug: 'chrome',
    title: 'Chrome & Trim',
    description:
      'Show-quality re-plating, stainless polishing and correct fasteners for every nut and bolt.',
    price: 'from $1,800',
    image: '/scenes/service-chrome.webp',
    alt: 'Illustration of a re-plated front bumper, grille and emblem',
  },
  {
    slug: 'interior',
    title: 'Upholstery & Interiors',
    description:
      'Correct hides, period patterns and original-style stitching — down to the door cards and headliner.',
    price: 'from $6,500',
    image: '/scenes/service-interior.webp',
    alt: 'Illustration of a bench seat, steering wheel and instrument panel',
  },
  {
    slug: 'appraisal',
    title: 'Appraisal & Consignment',
    description:
      'Written appraisals for insurance and estate purposes, plus consignment sales to a worldwide buyer list.',
    price: 'on request',
    image: '/scenes/service-appraisal.webp',
    alt: 'Illustration of a signed appraisal document with an approved stamp',
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'They restored my 1965 Mustang to a standard I did not think was still possible. Every fastener is correct.',
    name: 'Walter Brennan',
    role: '1965 Ford Mustang owner',
  },
  {
    quote:
      'The build file alone is worth the money — hundreds of photographs and every invoice documented.',
    name: 'Dolores Hale',
    role: '1957 Chevrolet Bel Air owner',
  },
  {
    quote:
      'I bought a Corvette sight unseen from across the country. It arrived exactly as described. Not a surprise anywhere.',
    name: 'Ray Whitfield',
    role: '1969 Chevrolet Corvette buyer',
  },
];

export const stats = [
  { value: '1978', label: 'Established' },
  { value: '1,200+', label: 'Classics sold' },
  { value: '38', label: 'Concours awards' },
  { value: '12 mo', label: 'Restoration warranty' },
] as const;
