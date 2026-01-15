"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token) {
      setErrorMessage("Token saknas. Öppna länken från mejlet igen.");
      setIsLoading(false);
      return;
    }

    if (password.length < 10) {
      setErrorMessage("Lösenordet måste vara minst 10 tecken.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Lösenorden matchar inte.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(data.error || "Kunde inte återställa lösenordet.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Klart! Ditt lösenord är uppdaterat. Du kan logga in nu.");
    } catch {
      setErrorMessage("Något gick fel. Försök igen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md py-10">
        <div
          className={`transform transition-all duration-700 ease-out ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 scale-95"
          }`}
        >
          <Card className="w-full">
            <CardHeader className="text-center pb-2">
              <div
                className={`mx-auto mb-6 h-16 w-16 rounded-2xl border border-border bg-card flex items-center justify-center shadow-sm transform transition-all duration-500 delay-200 ${
                  isVisible ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-12"
                }`}
              >
                <span className="text-foreground font-bold text-2xl tracking-tight">LD</span>
              </div>
              <CardTitle
                className={`text-2xl font-semibold transition-all duration-500 delay-300 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                Återställ lösenord
              </CardTitle>
              <CardDescription
                className={`text-base transition-all duration-500 delay-400 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                Ange ditt nya lösenord nedan.
              </CardDescription>
            </CardHeader>
            <CardContent
              className={`space-y-6 pt-4 transition-all duration-500 delay-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm animate-in fade-in slide-in-from-top-2 duration-300 dark:bg-red-950 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-600 text-sm animate-in fade-in slide-in-from-top-2 duration-300 dark:bg-green-950 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                  <Link href="/login">
                    <Button className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 transition-colors">
                      Gå till inloggning
                    </Button>
                  </Link>
                </div>
              )}

              {/* Reset Password Form */}
              {!successMessage && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Nytt lösenord</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Minst 10 tecken"
                        className="pl-11 h-12 text-base"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Upprepa nytt lösenord</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Skriv lösenordet igen"
                        className="pl-11 h-12 text-base"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
                    disabled={isLoading || !password || !token}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : null}
                    Spara nytt lösenord
                  </Button>
                </form>
              )}

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Tillbaka till inloggning
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
