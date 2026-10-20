import { useState } from "react";
import NailsCard from "../../nails-card";

export default function Gallery() {
  const images = [
    {
      id: 1,
      category: "Chrome",
      title: "Silver Chrome Set",
      description: "Mirror-finish chrome powder on a natural almond shape.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      category: "Acrylic",
      title: "Classic Acrylic",
      description: "Durable acrylic extension with a glossy top coat.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      category: "Gel",
      title: "Gel Overlay",
      description: "Strengthening gel overlay for a natural look.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      category: "3D Art",
      title: "Floral 3D Art",
      description: "Hand-sculpted 3D acrylic flowers.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 5,
      category: "French Tip",
      title: "Classic French",
      description: "Timeless white tips on a sheer pink base.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 6,
      category: "Ombre",
      title: "Pink Ombre",
      description: "Smooth fade from nude to vibrant pink.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 7,
      category: "Minimalist",
      title: "Micro Line Art",
      description: "Delicate gold foil lines on a matte base.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 8,
      category: "Stiletto",
      title: "Sharp Stiletto",
      description: "Long, dramatic stiletto shape with a matte black finish.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 9,
      category: "Chrome",
      title: "Rose Gold Chrome",
      description: "Warm rose gold mirror finish.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 10,
      category: "Acrylic",
      title: "Coffin Acrylic",
      description: "Trendy coffin shape with a subtle glitter fade.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 11,
      category: "Gel",
      title: "Matte Gel",
      description: "Velvet matte top coat over a deep burgundy.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 12,
      category: "3D Art",
      title: "Pearl Accents",
      description: "Tiny pearls arranged along the cuticle.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 13,
      category: "French Tip",
      title: "Micro French",
      description: "Ultra-thin white lines on a clear base.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 14,
      category: "Ombre",
      title: "Blue Ombre",
      description: "Ocean blue gradient with holographic accents.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 15,
      category: "Minimalist",
      title: "Geometric",
      description: "Black geometric shapes on a nude base.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 16,
      category: "Stiletto",
      title: "Red Stiletto",
      description: "Classic red stiletto with a glossy finish.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 17,
      category: "Chrome",
      title: "Aurora Chrome",
      description: "Iridescent chrome powder that shifts color.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 18,
      category: "Acrylic",
      title: "Almond Acrylic",
      description: "Natural almond shape with a clear acrylic overlay.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 19,
      category: "Gel",
      title: "Glitter Gel",
      description: "Fine glitter gel polish over a pale pink.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 20,
      category: "3D Art",
      title: "Sugared Texture",
      description: "Textured sugar effect on the ring finger.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 21,
      category: "French Tip",
      title: "Colored French",
      description: "Neon pink French tips.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 22,
      category: "Ombre",
      title: "Sunset Ombre",
      description: "Orange to yellow gradient.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 23,
      category: "Minimalist",
      title: "Negative Space",
      description: "Clear polish with black half-moons.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 24,
      category: "Stiletto",
      title: "Nude Stiletto",
      description: "Elegant nude stiletto nails.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 25,
      category: "Chrome",
      title: "Gold Chrome",
      description: "Luxurious gold mirror finish.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 26,
      category: "Acrylic",
      title: "Square Acrylic",
      description: "Short square acrylics with a matte top coat.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 27,
      category: "Gel",
      title: "Cat Eye Gel",
      description: "Magnetic cat eye effect in deep emerald.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 28,
      category: "3D Art",
      title: "Encapsulated Art",
      description: "Dried flowers encapsulated in clear acrylic.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 29,
      category: "French Tip",
      title: "Ombre French",
      description: "White tips that fade seamlessly into nude.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 30,
      category: "Ombre",
      title: "Purple Ombre",
      description: "Lavender to deep violet fade.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 31,
      category: "Minimalist",
      title: "Dotticure",
      description: "Simple black polka dots.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 32,
      category: "Stiletto",
      title: "Gothic Stiletto",
      description: "Black stiletto nails with silver crosses.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 33,
      category: "Chrome",
      title: "Pearl Chrome",
      description: "Soft pearl effect.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 34,
      category: "Acrylic",
      title: "Stiletto Acrylic",
      description: "Long stiletto extensions with a pink ombre.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 35,
      category: "Gel",
      title: "Chrome Gel",
      description: "Chrome powder over gel.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 36,
      category: "3D Art",
      title: "Raindrop Art",
      description: "Clear 3D gel drops for a water effect.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 37,
      category: "French Tip",
      title: "Glitter French",
      description: "French tips with a glitter stripe.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 38,
      category: "Ombre",
      title: "Green Ombre",
      description: "Mint to forest green fade.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 39,
      category: "Minimalist",
      title: "Line Art",
      description: "Thin abstract lines.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 40,
      category: "Stiletto",
      title: "Glitter Stiletto",
      description: "Fully encrusted with crystals.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 41,
      category: "Chrome",
      title: "Mermaid Chrome",
      description: "Under-the-sea color shifting chrome.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 42,
      category: "Acrylic",
      title: "Glitter Acrylic",
      description: "Fine holographic glitter mixed into clear acrylic.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 43,
      category: "Gel",
      title: "Milky White Gel",
      description: "Opaque milky white finish.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 44,
      category: "3D Art",
      title: "Sculpted Bow",
      description: "3D acrylic bow on the accent nail.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 45,
      category: "French Tip",
      title: "Black French",
      description: "Edgy black French tips.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 46,
      category: "Ombre",
      title: "Black Ombre",
      description: "Smokey black fade over clear.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 47,
      category: "Minimalist",
      title: "Half Moon",
      description: "Simple half-moon cuticle design.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 48,
      category: "Stiletto",
      title: "Chrome Stiletto",
      description: "Silver chrome on stiletto shape.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 49,
      category: "Chrome",
      title: "Holographic Chrome",
      description: "Rainbow holographic effect.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 50,
      category: "Acrylic",
      title: "Ombre Acrylic",
      description: "Pink and white ombre blend.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 51,
      category: "Gel",
      title: "Coral Gel",
      description: "Bright coral gel polish.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 52,
      category: "3D Art",
      title: "Caviar Beads",
      description: "Microbeads clustered at the base.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 53,
      category: "French Tip",
      title: "Gold Leaf French",
      description: "French tips with gold foil flakes.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 54,
      category: "Ombre",
      title: "Red Ombre",
      description: "Blood red gradient.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 55,
      category: "Minimalist",
      title: "Single Stripe",
      description: "One thin vertical stripe.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 56,
      category: "Stiletto",
      title: "White Stiletto",
      description: "Sharp white stiletto nails.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 57,
      category: "Chrome",
      title: "Amethyst Chrome",
      description: "Purple chrome mirror.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 58,
      category: "Acrylic",
      title: "French Acrylic",
      description: "Classic French acrylics.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 59,
      category: "Gel",
      title: "Neon Gel",
      description: "High-vis neon green gel.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 60,
      category: "3D Art",
      title: "Shell Art",
      description: "3D sculpted sea shells.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 61,
      category: "French Tip",
      title: "Double French",
      description: "Two parallel white lines.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 62,
      category: "Ombre",
      title: "Silver Ombre",
      description: "Metallic silver fade.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 63,
      category: "Minimalist",
      title: "Matte Nude",
      description: "Simple matte nude polish.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 64,
      category: "Stiletto",
      title: "Gold Stiletto",
      description: "Gold leaf accents on black.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 65,
      category: "Chrome",
      title: "Emerald Chrome",
      description: "Deep green mirror finish.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 66,
      category: "Acrylic",
      title: "Clear Acrylic",
      description: "Clear acrylic over natural nails.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 67,
      category: "Gel",
      title: "Pastel Gel",
      description: "Soft pastel pink gel.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 68,
      category: "3D Art",
      title: "Chain Art",
      description: "Dangling chains from the cuticle.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 69,
      category: "French Tip",
      title: "V-Cut French",
      description: "V-shaped white tips.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 70,
      category: "Ombre",
      title: "Peach Ombre",
      description: "Warm peach fade.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 71,
      category: "Minimalist",
      title: "Tiny Heart",
      description: "Single red heart on the ring finger.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 72,
      category: "Stiletto",
      title: "Pink Stiletto",
      description: "Hot pink stiletto nails.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 73,
      category: "Chrome",
      title: "Bronze Chrome",
      description: "Metallic bronze powder.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 74,
      category: "Acrylic",
      title: "Pink Acrylic",
      description: "Bright pink acrylics.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 75,
      category: "Gel",
      title: "Black Gel",
      description: "Glossy black gel.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 76,
      category: "3D Art",
      title: "Crystal Art",
      description: "Swarovski crystals on every nail.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 77,
      category: "French Tip",
      title: "Pastel French",
      description: "Soft pastel yellow tips.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 78,
      category: "Ombre",
      title: "Teal Ombre",
      description: "Teal to blue gradient.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 79,
      category: "Minimalist",
      title: "Abstract Swirl",
      description: "Black abstract swirls.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 80,
      category: "Stiletto",
      title: "Matte Stiletto",
      description: "Matte black stiletto.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 81,
      category: "Chrome",
      title: "Ruby Chrome",
      description: "Red chrome mirror.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 82,
      category: "Acrylic",
      title: "Ombre Acrylic",
      description: "Green ombre acrylics.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 83,
      category: "Gel",
      title: "White Gel",
      description: "Stark white gel polish.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 84,
      category: "3D Art",
      title: "Lace Art",
      description: "White 3D lace pattern.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 85,
      category: "French Tip",
      title: "Glitter French",
      description: "Glitter French tips.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 86,
      category: "Ombre",
      title: "Pink Ombre",
      description: "Hot pink to light pink.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 87,
      category: "Minimalist",
      title: "Cross Art",
      description: "Tiny black crosses.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 88,
      category: "Stiletto",
      title: "Gold Stiletto",
      description: "Gold chrome stiletto nails.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 89,
      category: "Chrome",
      title: "Sapphire Chrome",
      description: "Deep blue mirror finish.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 90,
      category: "Acrylic",
      title: "Red Acrylic",
      description: "Classic red acrylics.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 91,
      category: "Gel",
      title: "Purple Gel",
      description: "Vibrant purple gel.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 92,
      category: "3D Art",
      title: "Snake Skin",
      description: "3D snake skin texture.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 93,
      category: "French Tip",
      title: "Micro French",
      description: "Tiny micro French tips.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 94,
      category: "Ombre",
      title: "Orange Ombre",
      description: "Bright orange fade.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 95,
      category: "Minimalist",
      title: "Chevron Art",
      description: "Sharp black chevrons.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 96,
      category: "Stiletto",
      title: "Blue Stiletto",
      description: "Electric blue stiletto.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 97,
      category: "Chrome",
      title: "Copper Chrome",
      description: "Metallic copper finish.",
      img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 98,
      category: "Acrylic",
      title: "Glitter Acrylic",
      description: "Silver glitter acrylics.",
      img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 99,
      category: "Gel",
      title: "Matte Gel",
      description: "Matte black gel.",
      img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 100,
      category: "3D Art",
      title: "Floral Art",
      description: "Pink 3D flowers.",
      img: "https://images.unsplash.com/photo-1632345031435-8706d4e0da4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  const [activeFilter, setActiveFilter] = useState("All");

  const [visibleCount, setVisibleCount] = useState(9);

  // 1. Create the unique categories for the filter buttons
  const categories = ["All", ...new Set(images.map((image) => image.category))];

  // 2. Filter the images based on the active filter
  const filteredImages =
    activeFilter === "All"
      ? images
      : images.filter((image) => image.category === activeFilter);

  // 3. Slice the filtered images to show only the first 12
  const visibleImages = filteredImages.slice(0, visibleCount);

  const handleFilterChange = (category: any) => {
    setActiveFilter(category);
    setVisibleCount(9);
  };

  return (
    <div className="py-20 ">
      <div className="flex flex-col items-center">
        <span className="px-2 text-[#FF007F] flex items-center uppercase font-bold text-sm lg:text-base">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-sparkles preview-icon mr-2"
          >
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
            <path d="M20 2v4" />
            <path d="M22 4h-4" />
            <circle cx="4" cy="20" r="2" />
          </svg>
          Nail Designs Gallery
        </span>

        <h1 className="cormorant-garamond-header text-white font-medium text-2xl md:text-3xl lg:text-5xl py-4">
          The Glossx.Claw Collections
        </h1>
        <p className="leading-tight inter-subcaption text-[#F9FAFB]/60 text-sm md:text-base lg:text-base text-center">
          Explore our latest handcrafted custom sets. Click any look to inspect
          the design specs or book it directly for your next appointment.
        </p>

        {/* 3. Render the filter buttons dynamically */}
        <div className="flex flex-wrap justify-center items-center py-10 gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleFilterChange(category)}
              className={`mt-4 px-6 py-2 border rounded-full transition-all duration-300 cursor-pointer ${
                activeFilter === category
                  ? "bg-[#FF007F] border-[#FF007F] text-white shadow-[0_0_35px_rgba(255,0,127,0.5)]"
                  : "border-white/20 bg-[#F9FAFB]/10 text-[#F9FAFB]/70 hover:bg-[#F9FAFB]/20"
              }`}
            >
              <span className="leading-tight font-bold text-sm">
                {category === "All" ? "All Sets" : category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Map over filteredImages instead of images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {visibleImages.map((image) => (
          <NailsCard
            key={image.id}
            img={image.img}
            title={image.title}
            description={image.description}
            category={image.category}
          />
        ))}
      </div>

      {/* Group both buttons into one container */}
      {visibleCount < filteredImages.length && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16 mb-10">
          {/* Primary Button: Load 6 More */}
          <button 
            onClick={() => setVisibleCount(visibleCount + 6)}
            className="group flex items-center gap-2 px-8 py-3.5 bg-[#FF007F] text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:bg-[#ff1a8c] hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,0,127,0.5)] cursor-pointer"
          >
            Load More Looks
            {/* Optional: Add a subtle down arrow that bounces on hover */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:translate-y-0.5 transition-transform duration-300"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </button>

          {/* Secondary Button: Show All */}
          <button
            onClick={() => setVisibleCount(filteredImages.length)}
            className="px-8 py-3.5 bg-transparent border border-white/20 text-[#F9FAFB]/70 hover:text-white hover:border-white/50 text-sm font-semibold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer"
          >
            Show All ({filteredImages.length})
          </button>
        </div>
      )}

      <div className={`p-10 rounded-[2rem] border-1 border-white/20 flex justify-between items-center`}>
        <div>
          <span className="text-[#FF007F] flex items-center uppercase font-bold text-sm lg:text-base">
            Custom Design Request
          </span>

          <h1
            className={`playfair-display-header text-white text-xl md:text-2xl lg:text-3xl py-2`}
          >
            Have a Pinterest board or photo reference?
          </h1>
          <p
            className={`text-white/60 font-thin text-sm md:text-base lg:text-base`}
          >
            Upload your design idea in our booking portal for an exact quote.
          </p>
        </div>

        <div>
          <button className = {`flex items-center gap-2 px-8 py-3.5 bg-[#FF007F] text-white text-sm font-bold uppercase tracking-wider rounded-full transition-all duration-300 shadow-[0_0_25px_rgba(255,0,127,0.5)] hover:bg-[#ff1a8c] hover:shadow-[0_0_40px_rgba(255,0,127,0.5)] cursor-pointer`}>
            Book Custom Inspo Set
          </button>
        </div>
      </div>
    </div>
  );
}
