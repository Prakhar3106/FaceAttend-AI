import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/views/public/HomePage';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'FaceAttend AI - Smart Face Recognition Attendance for Institutes' },
      {
        name: 'description',
        content:
          'AI face recognition attendance for universities and institutes: register your institute, manage teachers and students, and take live attendance.',
      },
      { property: 'og:title', content: 'FaceAttend AI - Smart Face Recognition Attendance for Institutes' },
      {
        property: 'og:description',
        content:
          'Register your institute, manage teachers and students, and take real live face recognition attendance.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: HomePage,
});
