import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordPage } from '@/views/auth/ResetPasswordPage';

export const Route = createFileRoute('/reset-password')({
  head: () => ({
    meta: [
      { title: 'Reset Password · FaceAttend AI' },
      { name: 'description', content: 'Choose a new password for your FaceAttend AI account.' },
      { property: 'og:title', content: 'Reset Password · FaceAttend AI' },
      { property: 'og:description', content: 'Choose a new password for your FaceAttend AI account.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: ResetPasswordPage,
});
