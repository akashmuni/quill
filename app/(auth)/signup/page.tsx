import { SignupForm } from '@/components/auth/SignupForm'
import { AuthMarketingPanel } from '@/components/auth/AuthMarketingPanel'
import { AuthFormPanel } from '@/components/auth/AuthFormPanel'

export default function SignupPage() {
  return (
    <div className="auth-split grid min-h-dvh grid-cols-1 overflow-x-hidden lg:grid-cols-2 lg:min-h-screen lg:overflow-hidden">
      <AuthMarketingPanel />
      <AuthFormPanel active="signup">
        <SignupForm />
      </AuthFormPanel>
    </div>
  )
}
