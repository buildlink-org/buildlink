/// <reference types="vite/client" />

// vite-imagetools directive imports (e.g. "./x.jpg?format=webp&w=800")
declare module "*&format=webp" {
  const src: string;
  export default src;
}
