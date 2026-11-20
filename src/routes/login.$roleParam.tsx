import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/views/auth/LoginPage';

export const Route = createFileRoute('/login/$roleParam')({
  head: ({ params }) => {
    const label = params.roleParam === 'admin' ? 'Admin' : params.roleParam === 'teacher' ? 'Teacher' : 'Student';
    return {
      meta: [
        { title: `${label} Sign In · FaceAttend AI` },
        { name: 'description', content: `Sign in to the FaceAttend AI ${label} portal.` },
        { property: 'og:title', content: `${label} Sign In · FaceAttend AI` },
        { property: 'og:description', content: `Sign in to the FaceAttend AI ${label} portal.` },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary' },
      ],
    };
  },
  component: LoginPage,
});
