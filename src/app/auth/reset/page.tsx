"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase/client";

// Force dynamic rendering to avoid build-time prerendering without env vars
export const dynamic = "force-dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const supabase = createSupabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Supabase skickar access_token och refresh_token i URL hash
    const url = new URL(window.location.href);
    const accessToken = url.hash.match(/access_token=([^&]+)/)?.[1];
    const refreshToken = url.hash.match(/refresh_token=([^&]+)/)?.[1];

    const initSession = async () => {
      try {
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: decodeURIComponent(accessToken),
            refresh_token: decodeURIComponent(refreshToken),
          });
          if (error) throw error;
          setAuthed(!!data.session);
          // Rensa hash från URL för snyggare adress
          history.replaceState(null, "", window.location.pathname);
        } else {
          // Tokens saknas - visa felmeddelande
          setAuthed(false);
        }
      } catch (e: unknown) {
        setAuthed(false);
        const errorMsg = e instanceof Error ? e.message : "Kunde inte initiera session.";
        setErrorMessage(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setErrorMessage("Lösenordet måste vara minst 8 tecken.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Lösenorden matchar inte.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccessMessage("Lösenordet är uppdaterat! Du kan nu logga in.");
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Kunde inte uppdatera lösenordet.";
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!authed && !successMessage) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="w-full max-w-md py-10">
          <Card className="w-full">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-6 h-16 w-16 rounded-2xl border border-border bg-card flex items-center justify-center shadow-sm">
                <span className="text-foreground font-bold text-2xl tracking-tight">LD</span>
              </div>
              <CardTitle className="text-2xl font-semibold">Ogiltig länk</CardTitle>
              <CardDescription className="text-base">
                Länken har utgått eller redan använts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <Link href="/auth/forgot-password">
                <Button className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 transition-colors">
                  Begär ny återställningslänk
                </Button>
              </Link>
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
      </main>
    );
  }

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
                Sätt nytt lösenord
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
                        placeholder="Minst 8 tecken"
                        className="pl-11 h-12 text-base"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Bekräfta lösenord</Label>
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
                        disabled={isSubmitting}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
                    disabled={isSubmitting || !password}
                  >
                    {isSubmitting ? (
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
