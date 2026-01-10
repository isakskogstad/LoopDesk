"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

const RESET_REDIRECT_URL = "https://loopdesk-production.up.railway.app/auth/reset";

export default function ForgotPasswordForm() {
  const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseBrowser> | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Supabase client only on client-side
    try {
      setSupabase(createSupabaseBrowser());
    } catch (e) {
      setErrorMessage("Supabase är inte konfigurerat.");
    }
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setErrorMessage("Supabase är inte konfigurerat.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: RESET_REDIRECT_URL,
      });

      if (error) throw error;

      setSuccessMessage(
        "Om ett konto finns på den adressen har vi skickat en återställningslänk."
      );
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Kunde inte skicka återställningsmejl.";
      setErrorMessage(errorMsg);
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
                Glömt lösenord
              </CardTitle>
              <CardDescription
                className={`text-base transition-all duration-500 delay-400 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                Ange din e-postadress så skickar vi en återställningslänk.
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
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-600 text-sm animate-in fade-in slide-in-from-top-2 duration-300 dark:bg-green-950 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Forgot Password Form */}
              {!successMessage && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">E-post</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="din@email.se"
                        className="pl-11 h-12 text-base"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
                    disabled={isLoading || !email || !supabase}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : null}
                    Skicka återställningslänk
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
