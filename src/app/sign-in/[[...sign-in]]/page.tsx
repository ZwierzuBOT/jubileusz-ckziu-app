// /app/sign-in/[[...sign-in]]/page.tsx

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="w-screen h-[87vh] flex items-center justify-center absolute top-0 left-0">
      <SignIn />
    </div>
  );
}

