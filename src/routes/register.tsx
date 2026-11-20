import { createFileRoute } from '@tanstack/react-router';
import { RegisterPage } from '@/views/auth/RegisterPage';

export const Route = createFileRoute('/register')({
  head: () => ({
    meta: [
      { title: 'Register Your Institute · FaceAttend AI' },
      { name: 'description', content: 'Register your institute on FaceAttend AI. The first registered user becomes its Main Admin.' },
      { property: 'og:title', content: 'Register Your Institute · FaceAttend AI' },
      { property: 'og:description', content: 'Register your institute and become its Main Admin.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: RegisterPage,
});
