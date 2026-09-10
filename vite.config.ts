import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import { createEmailHandler } from './server/test-email.mjs';
export default defineConfig(({command}) => {
  // Public endpoint only, never a provider credential. Static GitHub builds have no backend.
  process.env.NEXT_PUBLIC_TEST_EMAIL_ENDPOINT = command === 'serve' ? '/api/test-course' : '';
  return {css:{postcss:{plugins:[tailwindcss()]}},plugins:[{name:'test-course-email',configureServer(server){server.middlewares.use(createEmailHandler());}},vinext()]};
});
