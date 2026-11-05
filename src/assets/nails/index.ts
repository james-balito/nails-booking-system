import { nailsData } from "../nailsData";

// 1. Automatically grab all images in the current folder (src/assets/nails)
const imageModules = import.meta.glob('./*.{png,jpg,jpeg,webp,avif}', { eager: true });

// 2. Combine the images and the data
export const nailsImages = Object.keys(imageModules)
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
    const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
    return numA - numB;
  })
  .map((key, index) => {
    // 👇 FIXED: Just remove the "./" and the file extension
    const filename = key.replace('./', '').replace(/\.(png|jpg|jpeg|webp|avif)$/, '');
    
    // 👇 DEBUG LOG: Uncomment this to see exactly what is happening in your browser console
    // console.log("Glob Key:", key, "| Extracted Filename:", filename);

    // Look up the text data using the filename
    const data = nailsData.find((item) => item.filename === filename);

    // Get the actual image URL from Vite
    const module = imageModules[key] as { default: string };

    // Return the fully combined object
    return {
      id: index,
      img: module.default,
      // If you forgot to add data for an image, these fallbacks prevent crashing
      title: data?.title || `GlossX Set #${index + 1}`,
      description: data?.description || "Custom handcrafted nail design.",
      category: data?.category || "Custom",
    };
  });