// /app/sign-up/[[...sign-up]]/page.tsx

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="w-screen h-[87vh] flex items-center justify-center absolute top-0 left-0 ">
      <SignUp />
    </div>
  );
}

