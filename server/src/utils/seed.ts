/**
 * Seed script: creates the admin user, the 12 electronics categories, and the
 * full product catalog. Product images are intentionally left empty — you upload
 * the real images per product from the admin panel (they go to Cloudinary).
 * Run with: npm run seed
 **/

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { slugify } from './slugify';

const CATEGORIES = [
  { name: 'AirPods', description: 'True wireless earbuds and charging cases.' },
  { name: 'Camera', description: 'DSLR, mirrorless, instant and action cameras plus accessories.' },
  { name: 'Earphones', description: 'Wireless neckbands and on-ear headphones.' },
  { name: 'Mobile', description: 'Smartphones from realme and Samsung.' },
  { name: 'Mouse', description: 'Wired and wireless computer mice.' },
  { name: 'Printers', description: 'All-in-one inkjet printers.' },
  { name: 'Processor', description: 'Desktop CPUs.' },
  { name: 'Refrigerator', description: 'Single and double door refrigerators.' },
  { name: 'Speakers', description: 'Portable and home Bluetooth speakers.' },
  { name: 'Trimmers', description: 'Grooming trimmers and clippers.' },
  { name: 'TV', description: 'HD, 4K, QLED and OLED smart televisions.' },
  { name: 'Watches', description: 'Bluetooth-calling smartwatches.' },
];

type SeedProduct = {
  name: string;
  category: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  featured?: boolean;
  description: string;
};

const PRODUCTS: SeedProduct[] = [
  // ---------------- AirPods (boAt) — 16 (TRebel Airdopes 431 left for manual test) ----------------
  { name: 'boAt Airdopes 111', category: 'AirPods', brand: 'boAt', price: 17.99, stock: 80, description: 'Everyday true wireless earbuds with boAt Signature Sound, Insta Wake N Pair and a pocket-friendly charging case.' },
  { name: 'boAt Airdopes 115', category: 'AirPods', brand: 'boAt', price: 16.99, stock: 90, description: 'Compact TWS earbuds tuned for boAt Signature Sound with quick auto-pairing and all-day comfort.' },
  { name: 'boAt Airdopes 121 v2', category: 'AirPods', brand: 'boAt', price: 15.99, stock: 100, description: 'Refreshed budget earbuds delivering punchy Signature Sound with Insta Wake N Pair and Type-C charging.' },
  { name: 'boAt Airdopes 131', category: 'AirPods', brand: 'boAt', price: 18.99, compareAtPrice: 24.99, stock: 120, featured: true, description: 'Fan-favourite earbuds with 13mm drivers, bass-forward Signature Sound, Type-C charging and a long-lasting case.' },
  { name: 'boAt Airdopes 172', category: 'AirPods', brand: 'boAt', price: 19.99, stock: 85, description: 'Lightweight earbuds with a snug sporty fit, crisp Signature Sound and splash resistance for workouts.' },
  { name: 'boAt Airdopes 192', category: 'AirPods', brand: 'boAt', price: 21.99, stock: 110, description: 'Popular TWS earbuds with 13mm drivers, immersive Signature Sound and ENx-assisted clear calling.' },
  { name: 'boAt Airdopes 201', category: 'AirPods', brand: 'boAt', price: 20.99, stock: 75, description: 'True wireless earbuds with immersive Signature Sound, easy in-ear controls and a reliable charging case.' },
  { name: 'boAt Airdopes 381', category: 'AirPods', brand: 'boAt', price: 22.99, stock: 70, description: 'Sleek earbuds with boAt Signature Sound, ENx clear calling and instant pairing.' },
  { name: 'boAt Airdopes 381 MKI', category: 'AirPods', brand: 'boAt', price: 23.99, stock: 60, description: 'A styled edition of the 381 with the same immersive sound and clear-calling mics in a distinctive design.' },
  { name: 'boAt Airdopes 411 ANC', category: 'AirPods', brand: 'boAt', price: 29.99, stock: 55, featured: true, description: 'Active Noise Cancellation earbuds that cut background noise for focused, immersive listening.' },
  { name: 'boAt Airdopes 451v2', category: 'AirPods', brand: 'boAt', price: 24.99, stock: 65, description: 'Refined earbuds combining Signature Sound with a secure fit, clear mics and long playback.' },
  { name: 'boAt Airdopes 501 ANC', category: 'AirPods', brand: 'boAt', price: 34.99, stock: 50, description: 'Premium-feel ANC earbuds with deep sound, ENx clear calling and long battery life.' },
  { name: 'boAt Airdopes 511 V2', category: 'AirPods', brand: 'boAt', price: 25.99, stock: 70, description: 'Upgraded TWS earbuds with rich Signature Sound, stable Bluetooth and splash resistance.' },
  { name: 'boAt Airdopes 701 ANC', category: 'AirPods', brand: 'boAt', price: 39.99, stock: 45, featured: true, description: 'Flagship-tier earbuds with Active Noise Cancellation, premium mics and BEAST Mode low latency.' },
  { name: 'boAt Immortal 121', category: 'AirPods', brand: 'boAt', price: 24.99, compareAtPrice: 42.99, stock: 90, featured: true, description: 'Gaming earbuds with BEAST Mode 40ms low latency, quad ENx mics, blazing RGB lights and up to 40 hours playback.' },
  { name: 'boAt TRebel Airdopes 181', category: 'AirPods', brand: 'boAt', price: 21.99, stock: 60, description: 'Style-forward earbuds pairing standout looks with immersive Signature Sound and all-day battery.' },

  // ---------------- Camera — 13 (Tygot bracket left for manual test) ----------------
  { name: 'Canon EOS 5D Mark IV (24-105mm f/4L IS II USM Kit)', category: 'Camera', brand: 'Canon', price: 2499, compareAtPrice: 2699, stock: 8, featured: true, description: '30.4MP full-frame DSLR with 4K video and Dual Pixel autofocus, bundled with the versatile EF 24-105mm f/4L zoom.' },
  { name: 'Canon EOS 200D II (18-55mm STM, Black)', category: 'Camera', brand: 'Canon', price: 599, stock: 20, description: 'Compact 24.1MP APS-C DSLR with a vari-angle touchscreen and 4K video, ideal for beginners and vloggers.' },
  { name: 'Canon EOS 1500D (EF-S 18-55mm IS II Lens)', category: 'Camera', brand: 'Canon', price: 399, stock: 25, description: 'Entry-level 24.1MP APS-C DSLR with guided controls and Wi-Fi for an easy step up from a phone.' },
  { name: 'CP PLUS 3MP Full HD Security Camera', category: 'Camera', brand: 'CP PLUS', price: 45, stock: 60, description: '3MP Full HD surveillance camera for sharp day and night home or business monitoring.' },
  { name: 'DIGITEK DTR 260 Tripod', category: 'Camera', brand: 'DIGITEK', price: 29, stock: 70, description: 'Lightweight adjustable tripod for DSLRs, mirrorless and action cameras with a quick-release mount.' },
  { name: 'Fujifilm Instax Mini 9 Instant Camera (Cobalt Blue)', category: 'Camera', brand: 'Fujifilm', price: 69, stock: 50, description: 'Fun instant-print camera for credit-card-sized photos, with a selfie mirror and close-up lens.' },
  { name: 'Fujifilm Instax Mini 9 (Box with 10 Shots)', category: 'Camera', brand: 'Fujifilm', price: 79, stock: 40, description: 'The Instax Mini 9 bundled with a 10-sheet film pack so you can start printing right away.' },
  { name: 'Nikon D780 DSLR (Body, Black)', category: 'Camera', brand: 'Nikon', price: 1999, stock: 10, featured: true, description: '24.5MP full-frame DSLR with fast hybrid autofocus, 4K video and excellent low-light performance.' },
  { name: 'Nikon D850 (45.7MP, with Memory Card)', category: 'Camera', brand: 'Nikon', price: 2799, stock: 8, description: '45.7MP full-frame DSLR for high-resolution stills and 4K, a favourite for landscape and studio work.' },
  { name: 'Osaka OS 550 Aluminium Tripod', category: 'Camera', brand: 'Osaka', price: 34, stock: 60, description: 'Sturdy aluminium tripod with adjustable height and a pan-tilt head for cameras and camcorders.' },
  { name: 'SJCAM SJ4000 WiFi Action Camera (Gold)', category: 'Camera', brand: 'SJCAM', price: 99, stock: 40, description: 'Budget-friendly Wi-Fi action camera for POV and adventure footage, with waterproof housing.' },
  { name: 'Sony Alpha ILCE-6400 (Body, Black)', category: 'Camera', brand: 'Sony', price: 899, stock: 15, featured: true, description: '24.2MP APS-C mirrorless camera with lightning-fast real-time autofocus and a 180-degree flip screen.' },
  { name: 'Syvo WT 3130 Aluminium Tripod (Brown)', category: 'Camera', brand: 'Syvo', price: 25, stock: 65, description: 'Portable aluminium tripod for cameras and smartphones with adjustable legs and a travel-ready build.' },

  // ---------------- Earphones (boAt Rockerz) — 14 ----------------
  { name: 'boAt Rockerz 103 Pro', category: 'Earphones', brand: 'boAt', price: 16, stock: 90, description: 'Wireless neckband with boAt Signature Sound and a lightweight, sweat-resistant build for workouts.' },
  { name: 'boAt Rockerz 258 Pro+', category: 'Earphones', brand: 'boAt', price: 22, stock: 110, featured: true, description: 'Popular Bluetooth neckband with deep bass, ASAP Charge, magnetic earbuds and IPX water resistance.' },
  { name: 'boAt Rockerz 330', category: 'Earphones', brand: 'boAt', price: 20, stock: 85, description: 'Comfortable neckband with immersive Signature Sound, ENx clear calling and long battery life.' },
  { name: 'boAt Rockerz 330 Pro', category: 'Earphones', brand: 'boAt', price: 24, stock: 70, description: 'Upgraded 330 with extended playback, refined sound, ASAP Charge and a secure sporty fit.' },
  { name: 'boAt Rockerz 375', category: 'Earphones', brand: 'boAt', price: 18, stock: 80, description: 'Neckband earphones with punchy bass, magnetic buds, splash resistance and all-day battery.' },
  { name: 'boAt Rockerz 400', category: 'Earphones', brand: 'boAt', price: 25, stock: 60, description: 'On-ear Bluetooth headphones with plush earcups, Signature Sound and long wireless playback.' },
  { name: 'boAt Rockerz 450 (Batman DC Edition)', category: 'Earphones', brand: 'boAt', price: 32, compareAtPrice: 39, stock: 55, featured: true, description: 'Best-selling on-ear wireless headphones in a special Batman DC design with 40mm drivers and a foldable build.' },
  { name: 'boAt Rockerz 510', category: 'Earphones', brand: 'boAt', price: 30, stock: 50, description: 'On-ear Bluetooth headphones with powerful bass, cushioned earcups and extended battery.' },
  { name: 'boAt Rockerz 518', category: 'Earphones', brand: 'boAt', price: 29, stock: 55, description: 'On-ear wireless headphones with large dynamic drivers, plush comfort and long playback.' },
  { name: 'boAt Rockerz 558', category: 'Earphones', brand: 'boAt', price: 34, stock: 45, description: 'Over-ear wireless headphones with immersive Signature Sound, cushioned earcups and long battery life.' },
  { name: 'boAt TRebel Rockerz 235 V2', category: 'Earphones', brand: 'boAt', price: 19, stock: 70, description: 'Style-forward TRebel neckband with magnetic buds, ASAP Charge and Signature Sound.' },
  { name: 'boAt TRebel Rockerz 255 Pro', category: 'Earphones', brand: 'boAt', price: 21, stock: 75, description: 'Fan-favourite TRebel neckband with deep bass, ASAP Charge, IPX water resistance and a lightweight design.' },
  { name: 'boAt TRebel Rockerz 450', category: 'Earphones', brand: 'boAt', price: 31, stock: 50, description: 'On-ear wireless headphones from the TRebel line pairing bold styling with Signature Sound and comfort.' },
  { name: 'boAt Rockerz 265 V2', category: 'Earphones', brand: 'boAt', price: 17, stock: 80, description: 'Bluetooth neckband with magnetic earbuds, splash resistance and dependable all-day battery.' },

  // ---------------- Mobile — realme (16). Storage truncated: add "xxx GB" to names when known. ----------------
  { name: 'realme 7 Pro (6GB RAM, Mirror Silver)', category: 'Mobile', brand: 'realme', price: 259, stock: 20, featured: true, description: 'Mid-range smartphone with a Super AMOLED display and fast charging.' },
  { name: 'realme 9 5G (6GB RAM, Stargaze White)', category: 'Mobile', brand: 'realme', price: 229, stock: 25, description: '5G smartphone with a 90Hz display and 48MP camera.' },
  { name: 'realme 9 Pro 5G (6GB RAM, Midnight Black)', category: 'Mobile', brand: 'realme', price: 279, stock: 20, description: '5G smartphone with a 120Hz display and 64MP camera.' },
  { name: 'realme 9i 5G (4GB RAM, Soulful Blue)', category: 'Mobile', brand: 'realme', price: 179, stock: 30, description: 'Budget 5G smartphone with a 90Hz display and long battery life.' },
  { name: 'realme C25s (4GB RAM, Watery Grey)', category: 'Mobile', brand: 'realme', price: 149, stock: 35, description: 'Big-battery budget phone with a 48MP camera and large display.' },
  { name: 'realme C30 (2GB RAM, Bamboo Green)', category: 'Mobile', brand: 'realme', price: 99, stock: 40, description: 'Entry-level smartphone with a slim design and long battery life.' },
  { name: 'realme C33 (3GB RAM, Night Sea)', category: 'Mobile', brand: 'realme', price: 129, stock: 35, description: 'Budget smartphone with a 50MP camera and a sleek build.' },
  { name: 'realme C35 (4GB RAM, Glowing Black)', category: 'Mobile', brand: 'realme', price: 159, stock: 30, description: 'Budget smartphone with a Full HD+ display and 50MP camera.' },
  { name: 'realme GT 5G (12GB RAM, Racing Yellow)', category: 'Mobile', brand: 'realme', price: 449, compareAtPrice: 499, stock: 15, featured: true, description: 'Flagship smartphone with Snapdragon 888 and a 120Hz AMOLED display.' },
  { name: 'realme GT NEO 2 (8GB RAM, Neo Green)', category: 'Mobile', brand: 'realme', price: 399, stock: 18, description: 'Performance smartphone with a 120Hz AMOLED display and fast charging.' },
  { name: 'realme GT Neo 3 (8GB RAM, Asphalt Black)', category: 'Mobile', brand: 'realme', price: 419, stock: 16, description: 'Fast-charging performance smartphone with a 120Hz AMOLED display.' },
  { name: 'realme Narzo 30 Pro 5G (6GB RAM)', category: 'Mobile', brand: 'realme', price: 199, stock: 25, description: '5G smartphone with a 120Hz display built for gaming and streaming.' },
  { name: 'realme Narzo 50 (4GB RAM, Speed Blue)', category: 'Mobile', brand: 'realme', price: 179, stock: 28, description: 'Gaming-tier budget smartphone with a 120Hz display.' },
  { name: 'realme Narzo 50A (4GB RAM, Oxygen Green)', category: 'Mobile', brand: 'realme', price: 159, stock: 30, description: 'Big-battery budget smartphone with a 50MP camera.' },
  { name: 'realme Narzo 50A Prime (4GB RAM)', category: 'Mobile', brand: 'realme', price: 149, stock: 30, description: 'Slim budget smartphone with a Full HD+ display and 50MP camera.' },
  { name: 'realme X7 Pro 5G (8GB RAM)', category: 'Mobile', brand: 'realme', price: 399, stock: 15, description: '5G smartphone with a 120Hz AMOLED display and fast charging.' },

  // ---------------- Mobile — Samsung (6). Model suffix truncated: verify A03 vs A03s, A14 4G/5G. ----------------
  { name: 'Samsung Galaxy A03s (3GB RAM)', category: 'Mobile', brand: 'Samsung', price: 129, stock: 35, description: 'Entry-level smartphone with a large display and long battery life.' },
  { name: 'Samsung Galaxy A10s (3GB RAM)', category: 'Mobile', brand: 'Samsung', price: 139, stock: 30, description: 'Budget smartphone with a dual camera and dependable battery.' },
  { name: 'Samsung Galaxy A12 (6GB RAM)', category: 'Mobile', brand: 'Samsung', price: 179, stock: 30, description: 'Budget smartphone with a 48MP quad camera and big battery.' },
  { name: 'Samsung Galaxy A13 (6GB RAM)', category: 'Mobile', brand: 'Samsung', price: 189, stock: 28, description: 'Budget smartphone with a 50MP camera and a large display.' },
  { name: 'Samsung Galaxy A14 (4GB RAM)', category: 'Mobile', brand: 'Samsung', price: 199, stock: 28, description: 'Budget smartphone with a 90Hz display and 50MP camera.' },
  { name: 'Samsung Galaxy A23 (8GB RAM)', category: 'Mobile', brand: 'Samsung', price: 259, stock: 22, description: 'Mid-budget smartphone with a 50MP OIS camera and a 120Hz display.' },

  // ---------------- Mouse — 13 ----------------
  { name: 'ASUS Marshmallow MD100 Wireless Mouse (Quiet Blue)', category: 'Mouse', brand: 'ASUS', price: 22, stock: 60, description: 'Dual-mode wireless mouse (Bluetooth and 2.4GHz) with silent clicks and a compact design.' },
  { name: 'Dell MS116 Wired Optical Mouse (USB, Black)', category: 'Mouse', brand: 'Dell', price: 9, stock: 120, description: 'Reliable wired optical mouse with a comfortable ambidextrous shape and 1000 DPI tracking.' },
  { name: 'Flipkart SmartBuy Wireless Mouse (Midnight Black)', category: 'Mouse', brand: 'Flipkart SmartBuy', price: 8, stock: 100, description: 'Affordable wireless optical mouse with a plug-and-play nano receiver.' },
  { name: 'HP 250 Wireless Optical Mouse (Black)', category: 'Mouse', brand: 'HP', price: 14, stock: 90, description: 'Slim wireless mouse with a 2.4GHz receiver and long battery life.' },
  { name: 'HP x1000 Wired Optical Mouse (USB 2.0, Black)', category: 'Mouse', brand: 'HP', price: 8, stock: 110, description: 'Everyday wired optical mouse with a comfortable grip and 1000 DPI tracking.' },
  { name: 'Lenovo 130 Wireless Optical Mouse (Black)', category: 'Mouse', brand: 'Lenovo', price: 12, stock: 90, description: 'Compact wireless mouse with a nano receiver and an ergonomic build.' },
  { name: 'Lenovo 400 Wireless Optical Mouse', category: 'Mouse', brand: 'Lenovo', price: 15, stock: 80, description: 'Full-size wireless mouse with smooth optical tracking and long battery life.' },
  { name: 'Logitech B100 Wired Optical Mouse (USB, Black)', category: 'Mouse', brand: 'Logitech', price: 9, stock: 130, featured: true, description: 'Simple, durable wired mouse with ambidextrous comfort and 800 DPI tracking.' },
  { name: 'Logitech B175 Wireless Optical Mouse (Black)', category: 'Mouse', brand: 'Logitech', price: 13, stock: 100, description: 'Wireless mouse with a tiny receiver and reliable 2.4GHz connectivity.' },
  { name: 'Portronics Toad 22 Wireless Mouse (Black)', category: 'Mouse', brand: 'Portronics', price: 11, stock: 85, description: 'Slim wireless mouse with adjustable DPI and a compact travel-friendly design.' },
  { name: 'Portronics Toad 24 Wireless Mouse (Black)', category: 'Mouse', brand: 'Portronics', price: 12, stock: 85, description: 'Lightweight wireless mouse with silent clicks and multiple DPI levels.' },
  { name: 'Portronics Toad One Bluetooth Mouse (Black)', category: 'Mouse', brand: 'Portronics', price: 15, stock: 70, description: 'Bluetooth mouse for laptops and tablets with a slim rechargeable design.' },
  { name: 'Zoook Bomber Wired Mouse (USB 2.0, Black)', category: 'Mouse', brand: 'Zoook', price: 7, stock: 100, description: 'Budget wired optical mouse with a sturdy build and smooth tracking.' },

  // ---------------- Printers (Canon) — 2 ----------------
  { name: 'Canon PIXMA MG2570S All-in-One Inkjet Printer', category: 'Printers', brand: 'Canon', price: 55, stock: 40, featured: true, description: 'Compact all-in-one inkjet for printing, scanning and copying at home, with ink cartridges included.' },
  { name: 'Canon PIXMA MG2470 All-in-One Inkjet Printer', category: 'Printers', brand: 'Canon', price: 50, stock: 35, description: 'Space-saving all-in-one inkjet for everyday print, scan and copy, with ink cartridges included.' },

  // ---------------- Processor — 3 ----------------
  { name: 'AMD Ryzen 7 3700X Processor (Silver)', category: 'Processor', brand: 'AMD', price: 179, stock: 30, featured: true, description: '8-core, 16-thread AM4 desktop processor with a 4.4GHz boost, great for gaming and content creation.' },
  { name: 'AMD Ryzen 7 3800XT Processor (Silver)', category: 'Processor', brand: 'AMD', price: 219, stock: 25, description: '8-core, 16-thread AM4 processor with higher clocks for demanding gaming and creative workloads.' },
  { name: 'GIGASTAR 3.2 GHz LGA Processor (Silver)', category: 'Processor', brand: 'GIGASTAR', price: 59, stock: 40, description: 'Budget LGA desktop processor for everyday computing builds. Verify exact model and socket.' },

  // ---------------- Refrigerator — 7 visible (folder cut off; append tail if any) ----------------
  { name: 'Godrej 215 L Direct Cool Single Door Refrigerator (Aqua Blue)', category: 'Refrigerator', brand: 'Godrej', price: 219, stock: 15, description: 'Single-door direct-cool refrigerator with efficient cooling and a spacious 215L capacity.' },
  { name: 'Godrej 236 L Frost Free Double Door Refrigerator', category: 'Refrigerator', brand: 'Godrej', price: 289, stock: 12, description: 'Frost-free double-door refrigerator with 236L capacity and even, consistent cooling.' },
  { name: 'Haier 195 L Direct Cool Single Door Refrigerator (HED-1954CPG-E)', category: 'Refrigerator', brand: 'Haier', price: 189, stock: 18, description: 'Compact 195L single-door direct-cool refrigerator ideal for small households.' },
  { name: 'Haier 258 L Frost Free Double Door Refrigerator (HRF-2784PXG-E)', category: 'Refrigerator', brand: 'Haier', price: 319, stock: 12, description: 'Frost-free 258L double-door refrigerator with convertible cooling modes.' },
  { name: 'LG 185 L Direct Cool Single Door Refrigerator (GL-B199OERD)', category: 'Refrigerator', brand: 'LG', price: 199, stock: 16, description: 'Energy-efficient 185L single-door refrigerator with a smart inverter compressor.' },
  { name: 'LG 185 L Direct Cool Single Door Refrigerator (GL-D201ABCU)', category: 'Refrigerator', brand: 'LG', price: 205, stock: 15, featured: true, description: 'Reliable 185L single-door direct-cool refrigerator with fast, even cooling.' },
  { name: 'LG 260 L Frost Free Double Door Refrigerator (GL-N292RERY)', category: 'Refrigerator', brand: 'LG', price: 349, stock: 10, description: 'Frost-free 260L double-door refrigerator with a smart inverter compressor and convertible modes.' },

  // ---------------- Speakers (boAt) — 16 visible (folder cut off; append tail if any) ----------------
  { name: 'boAt BLITZ 2000', category: 'Speakers', brand: 'boAt', price: 49, stock: 40, description: 'Powerful multimedia speaker with deep bass and bold sound for home entertainment. Verify brand and model.' },
  { name: 'boAt Rugby Plus', category: 'Speakers', brand: 'boAt', price: 39, stock: 50, description: 'Rugged portable Bluetooth speaker with a carry strap, deep bass and long playtime.' },
  { name: 'boAt Rugby', category: 'Speakers', brand: 'boAt', price: 32, stock: 55, description: 'Portable Bluetooth speaker with a sturdy build, punchy sound and all-day battery.' },
  { name: 'boAt Stone 170', category: 'Speakers', brand: 'boAt', price: 22, compareAtPrice: 29, stock: 90, featured: true, description: 'Compact portable Bluetooth speaker with boAt Signature Sound and IPX water resistance.' },
  { name: 'boAt Stone 180', category: 'Speakers', brand: 'boAt', price: 24, stock: 85, description: 'Pocket-friendly Bluetooth speaker with 5W sound, a rugged build and long playtime.' },
  { name: 'boAt Stone 190', category: 'Speakers', brand: 'boAt', price: 25, stock: 80, description: 'Portable Bluetooth speaker with immersive sound, water resistance and a compact design.' },
  { name: 'boAt Stone 200', category: 'Speakers', brand: 'boAt', price: 27, stock: 75, description: 'Rugged portable speaker with boAt Signature Sound, TWS pairing and splash resistance.' },
  { name: 'boAt Stone 260', category: 'Speakers', brand: 'boAt', price: 29, stock: 70, description: 'Compact Bluetooth speaker with deep bass, IPX water resistance and long battery.' },
  { name: 'boAt Stone 350', category: 'Speakers', brand: 'boAt', price: 34, stock: 65, description: 'Portable Bluetooth speaker with powerful sound, TWS pairing and a durable build.' },
  { name: 'boAt Stone 500', category: 'Speakers', brand: 'boAt', price: 39, stock: 60, description: 'Bold portable speaker with deep bass, water resistance and extended playtime.' },
  { name: 'boAt Stone 620', category: 'Speakers', brand: 'boAt', price: 44, stock: 55, description: 'Water-resistant Bluetooth speaker with 12W stereo sound and TWS pairing.' },
  { name: 'boAt Stone 1000', category: 'Speakers', brand: 'boAt', price: 54, stock: 45, description: 'High-output portable speaker with rich stereo sound and long battery life.' },
  { name: 'boAt Stone 1200', category: 'Speakers', brand: 'boAt', price: 59, stock: 45, description: 'Powerful 14W portable speaker with deep bass, RGB lights and rugged water resistance.' },
  { name: 'boAt Stone 1350', category: 'Speakers', brand: 'boAt', price: 64, stock: 40, description: 'Loud portable speaker with immersive stereo sound, TWS pairing and long playtime.' },
  { name: 'boAt Stone 1450', category: 'Speakers', brand: 'boAt', price: 69, stock: 40, description: 'High-power portable speaker with punchy bass, RGB lighting and rugged durability.' },
  { name: 'boAt Stone 1508', category: 'Speakers', brand: 'boAt', price: 74, stock: 35, description: 'Big-sound portable speaker with 14W output, deep bass and all-day battery.' },

  // ---------------- Trimmers — 10 ----------------
  { name: 'Ambrane AGK-11 Trimmer (Black)', category: 'Trimmers', brand: 'Ambrane', price: 19, stock: 70, description: 'Cordless grooming trimmer with multiple length settings and a rechargeable battery.' },
  { name: 'Luhao Dragon Professional Trimmer (Gold)', category: 'Trimmers', brand: 'Luhao', price: 29, stock: 50, description: 'Professional hair and beard clipper with adjustable settings and a durable metal finish.' },
  { name: 'Mi XXQ01HM Trimmer (Black)', category: 'Trimmers', brand: 'Mi', price: 24, stock: 65, featured: true, description: 'Cordless beard trimmer with self-sharpening blades and long cordless runtime.' },
  { name: 'Nova NHT 1039-05 Trimmer (Blue)', category: 'Trimmers', brand: 'Nova', price: 15, stock: 80, description: 'USB-rechargeable trimmer with multiple length settings for precise grooming.' },
  { name: 'Nova NHT 1052 Trimmer (Black)', category: 'Trimmers', brand: 'Nova', price: 16, stock: 75, description: 'Cordless USB trimmer with adjustable combs and a rechargeable battery.' },
  { name: 'Nova NHT 1058 Waterproof Trimmer (Grey)', category: 'Trimmers', brand: 'Nova', price: 18, stock: 70, description: 'Waterproof cordless trimmer for beard and body grooming with multiple settings.' },
  { name: 'Nova NHT 1073-00 Trimmer (Black, Blue)', category: 'Trimmers', brand: 'Nova', price: 17, stock: 70, description: 'Rechargeable grooming trimmer with adjustable length settings and a comfortable grip.' },
  { name: 'Philips BT1232-15 Beard Trimmer (Blue)', category: 'Trimmers', brand: 'Philips', price: 25, stock: 60, featured: true, description: 'Cordless beard trimmer with adjustable length settings and durable self-sharpening blades.' },
  { name: 'Syska HT200U Trimmer (Black)', category: 'Trimmers', brand: 'Syska', price: 16, stock: 75, description: 'USB-rechargeable trimmer with multiple length combs for precise, cordless grooming.' },
  { name: 'Syska HT450-Apache Trimmer (Green)', category: 'Trimmers', brand: 'Syska', price: 19, stock: 65, description: 'Cordless grooming trimmer with adjustable settings and long rechargeable runtime.' },

  // ---------------- TV — 14 ----------------
  { name: 'Acer I Series 127 cm (50 inch) 4K Ultra HD Smart TV (AR2851UDFL)', category: 'TV', brand: 'Acer', price: 549, stock: 15, featured: true, description: '50-inch 4K Ultra HD smart TV with vibrant colour and built-in streaming apps.' },
  { name: 'iFFALCON by TCL 100 cm (40 inch) Android 11 Smart TV (40F53)', category: 'TV', brand: 'iFFALCON', price: 329, stock: 18, description: '40-inch Full HD Android 11 smart TV with built-in Google apps and crisp visuals.' },
  { name: 'LG 123 cm (49 inch) 4K UHD Smart WebOS TV (49UK7500PTA)', category: 'TV', brand: 'LG', price: 599, stock: 12, description: '49-inch 4K UHD smart TV running WebOS with Active HDR and sharp detail.' },
  { name: 'LG 123 cm (49 inch) Smart WebOS TV', category: 'TV', brand: 'LG', price: 579, stock: 12, description: 'LG 49-inch smart TV with WebOS, vivid picture quality and built-in streaming. Possible duplicate of 49UK7500PTA — verify.' },
  { name: 'LG 164 cm (65 inch) OLED 4K Smart TV', category: 'TV', brand: 'LG', price: 1799, stock: 6, featured: true, description: '65-inch OLED 4K smart TV with self-lit pixels, deep blacks and Dolby Vision.' },
  { name: 'Mi 5A 100 cm (40 inch) Full HD Smart TV (2022 Model)', category: 'TV', brand: 'Mi', price: 299, stock: 20, description: '40-inch Full HD Android smart TV with vivid visuals and built-in apps.' },
  { name: 'Motorola ZX2 100 cm (40 inch) Full HD Smart TV (40SAFHDME)', category: 'TV', brand: 'Motorola', price: 289, stock: 18, description: '40-inch Full HD smart TV with immersive sound and built-in streaming.' },
  { name: 'OnePlus Y1 100 cm (40 inch) Full HD LED Smart TV (40FA1A00)', category: 'TV', brand: 'OnePlus', price: 319, stock: 18, description: '40-inch Full HD smart TV with a bezel-light design and built-in Android apps.' },
  { name: 'Panasonic 100 cm (40 inch) Full HD Smart TV (TH-40HS450DX)', category: 'TV', brand: 'Panasonic', price: 309, stock: 16, description: '40-inch Full HD smart TV with vibrant colour and built-in streaming apps.' },
  { name: 'realme 80 cm (32 inch) HD Ready Android TV (TV 32)', category: 'TV', brand: 'realme', price: 179, stock: 25, description: '32-inch HD Ready Android smart TV with a slim bezel and built-in Google apps.' },
  { name: 'Samsung 80 cm (32 inch) HD Ready Smart TV', category: 'TV', brand: 'Samsung', price: 199, stock: 22, description: '32-inch HD Ready smart TV with crisp picture and a full smart-app suite.' },
  { name: 'Samsung 108 cm (43 inch) 4K Ultra HD Smart TV (43TU8570)', category: 'TV', brand: 'Samsung', price: 449, stock: 15, description: '43-inch 4K UHD smart TV with the Crystal Processor and vibrant HDR visuals.' },
  { name: 'Samsung 163 cm (65 inch) 4K Ultra HD Smart TV', category: 'TV', brand: 'Samsung', price: 899, stock: 8, featured: true, description: '65-inch 4K UHD smart TV with immersive picture quality and smart features.' },
  { name: 'Samsung Q Series 163 cm (65 inch) QLED 4K Smart TV (65Q7FN)', category: 'TV', brand: 'Samsung', price: 1199, stock: 7, description: '65-inch QLED 4K smart TV with Quantum Dot colour and premium contrast.' },

  // ---------------- Watches (boAt) — 14 visible (folder cut off; append tail if any) ----------------
  { name: 'boAt Cosmos Pro', category: 'Watches', brand: 'boAt', price: 44, stock: 60, featured: true, description: 'Smartwatch with a large AMOLED display, Bluetooth calling and multiple sports modes.' },
  { name: 'boAt Storm', category: 'Watches', brand: 'boAt', price: 29, stock: 70, description: 'Feature-packed smartwatch with a colour display, heart-rate tracking and multiple watch faces.' },
  { name: 'boAt Storm Call', category: 'Watches', brand: 'boAt', price: 34, stock: 65, description: 'Smartwatch with Bluetooth calling, a bright display and daily activity tracking.' },
  { name: 'boAt Storm Pro Call', category: 'Watches', brand: 'boAt', price: 39, stock: 55, description: 'Premium-feel smartwatch with Bluetooth calling, a large display and health tracking.' },
  { name: 'boAt Storm RTL', category: 'Watches', brand: 'boAt', price: 32, stock: 60, description: 'Stylish smartwatch with a vivid display, heart-rate monitoring and long battery life.' },
  { name: 'boAt TRebel Blaze', category: 'Watches', brand: 'boAt', price: 36, stock: 55, description: 'Smartwatch from the TRebel line with a bold design, colour display and fitness tracking.' },
  { name: 'boAt TRebel Matrix', category: 'Watches', brand: 'boAt', price: 38, stock: 50, description: 'Feature-rich smartwatch with a large display, health tracking and customizable faces.' },
  { name: 'boAt Wave Beat', category: 'Watches', brand: 'boAt', price: 27, stock: 75, description: 'Everyday smartwatch with a colour display, heart-rate and SpO2 tracking and sports modes.' },
  { name: 'boAt Wave Beat Call', category: 'Watches', brand: 'boAt', price: 31, stock: 70, description: 'Smartwatch with Bluetooth calling, a bright display and comprehensive activity tracking.' },
  { name: 'boAt Wave Call', category: 'Watches', brand: 'boAt', price: 33, stock: 65, description: 'Bluetooth-calling smartwatch with a large display and daily health monitoring.' },
  { name: 'boAt Wave Connect', category: 'Watches', brand: 'boAt', price: 35, stock: 60, description: 'Smartwatch with Bluetooth calling, a big display and multiple sports and health features.' },
  { name: 'boAt Wave Lite', category: 'Watches', brand: 'boAt', price: 25, stock: 75, description: 'Lightweight smartwatch with a 1.69-inch display, health tracking and long battery life.' },
  { name: 'boAt Wave Play', category: 'Watches', brand: 'boAt', price: 26, stock: 70, description: 'Smartwatch with a large display, music-friendly features and daily fitness tracking.' },
  { name: 'boAt Wave Prime 47', category: 'Watches', brand: 'boAt', price: 28, stock: 70, description: 'Smartwatch with a 1.47-inch display, heart-rate tracking and multiple sports modes.' },
];

const run = async (): Promise<void> => {
  await connectDB();
  console.log('Clearing existing catalog...');
  await Promise.all([Category.deleteMany({}), Product.deleteMany({})]);

  // Admin user (created once)
  const existingAdmin = await User.findOne({ email: env.seedAdmin.email });
  if (!existingAdmin) {
    await User.create({
      name: env.seedAdmin.name,
      email: env.seedAdmin.email,
      password: env.seedAdmin.password,
      role: 'admin',
    });
    console.log(`✓ Admin created: ${env.seedAdmin.email} / ${env.seedAdmin.password}`);
  } else {
    console.log(`• Admin already exists: ${env.seedAdmin.email}`);
  }

  const categoryDocs = await Category.insertMany(
    CATEGORIES.map((c) => ({ ...c, slug: slugify(c.name), image: '' }))
  );
  const bySlug = new Map(categoryDocs.map((c) => [c.slug, c]));
  console.log(`✓ Inserted ${categoryDocs.length} categories`);

  const products = PRODUCTS.map((p) => {
    const cat = bySlug.get(slugify(p.category));
    if (!cat) throw new Error(`Unknown category for product "${p.name}": ${p.category}`);
    return {
      name: p.name,
      slug: `${slugify(p.name)}-${Math.random().toString(36).slice(2, 8)}`,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      category: cat._id,
      images: [],
      stock: p.stock,
      brand: p.brand,
      featured: Boolean(p.featured),
    };
  });
  await Product.insertMany(products);

  // Per-category counts for a quick sanity check
  const counts = PRODUCTS.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`✓ Inserted ${products.length} products:`);
  Object.entries(counts).forEach(([c, n]) => console.log(`   • ${c}: ${n}`));
  console.log('  (images are empty — upload them per product from the admin panel)');

  await mongoose.disconnect();
  console.log('✓ Seed complete');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});