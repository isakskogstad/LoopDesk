// Server component - allows export const dynamic
import ResetPasswordForm from "./ResetPasswordForm";

// Force dynamic rendering to skip build-time prerendering
export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
