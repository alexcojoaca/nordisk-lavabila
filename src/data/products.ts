export type Product = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  alt: string;
  href: string;
};

export const products: Product[] = [
  {
    id: "termoizolanta",
    title: "Vopsea termoizolantă",
    description:
      "2 mm de vopsea țin locul a 15 cm de polistiren și cresc eficiența energetică a peretelui.",
    image: "/images/products/termoizolanta.jpg",
    imageWidth: 640,
    imageHeight: 360,
    alt: "Vopsea termoizolantă Nordisk",
    href: "https://buy.stripe.com/cNi4gA3q364xfMy0Ii4wM02",
  },
  {
    id: "lavabila-exterior",
    title: "Vopsea lavabilă exterior",
    description:
      "Pentru fațadă. Rezistă la intemperii, acoperă uniform și lasă un finisaj perlat.",
    image: "/images/products/lavabila-exterior.jpg",
    imageWidth: 460,
    imageHeight: 360,
    alt: "Vopsea lavabilă exterior Nordisk",
    href: "https://buy.stripe.com/5kQ28s8Kn0Kd0REbmW4wM03",
  },
];
