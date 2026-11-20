import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/views/auth/LoginPage';

export const Route = createFileRoute('/login/')({
  head: () => ({
    meta: [
      { title: 'Sign In · FaceAttend AI' },
      { name: 'description', content: 'Sign in to the Admin, Teacher or Student portal of FaceAttend AI.' },
      { property: 'og:title', content: 'Sign In · FaceAttend AI' },
      { property: 'og:description', content: 'Sign in to the Admin, Teacher or Student portal of FaceAttend AI.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: LoginPage,
});
