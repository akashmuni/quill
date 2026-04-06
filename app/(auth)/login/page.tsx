import { LoginForm } from '@/components/auth/LoginForm'
import { AuthMarketingPanel } from '@/components/auth/AuthMarketingPanel'
import { AuthFormPanel } from '@/components/auth/AuthFormPanel'

export default function LoginPage() {
  return (
    <div className="auth-split grid min-h-dvh grid-cols-1 overflow-x-hidden lg:grid-cols-2 lg:min-h-screen lg:overflow-hidden">
      <AuthMarketingPanel />
      <AuthFormPanel active="signin">
        <LoginForm />
      </AuthFormPanel>
    </div>
  )
}
