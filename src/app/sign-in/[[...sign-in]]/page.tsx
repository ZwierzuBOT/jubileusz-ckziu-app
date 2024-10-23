// /app/sign-in/[[...sign-in]]/page.tsx

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="w-screen h-[87vh] flex items-center justify-center">
      <SignIn />
    </div>
  );
}

