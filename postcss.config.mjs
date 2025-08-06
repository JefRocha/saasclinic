const config = {
  plugins: [
    ...(process.env.NODE_ENV !== 'test' ? ["@tailwindcss/postcss", "autoprefixer"] : []),
  ],
};

export default config;
