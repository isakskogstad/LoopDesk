// Server component - allows export const dynamic
import ForgotPasswordForm from "./ForgotPasswordForm";

// Force dynamic rendering to skip build-time prerendering
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
