"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDarkMode } from "@/lib/hooks/use-dark-mode";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
}

export default function KontoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDark, toggle, isLoaded } = useDarkMode();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/konto");
    }
  }, [status, router]);

  // Fetch profile
  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/konto");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || "");
        setPhone(data.phone || "");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/konto", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data);
        setMessage({ type: "success", text: "Profilen har sparats" });
      } else {
        setMessage({ type: "error", text: data.error || "Något gick fel" });
      }
    } catch {
      setMessage({ type: "error", text: "Något gick fel" });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="page-wrapper">
          <div className="max-w-2xl">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-muted rounded mb-2" />
              <div className="h-5 w-48 bg-muted rounded mb-8" />
            </div>
            <Card>
              <CardHeader>
                <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-10 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
                <div className="h-10 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="page-wrapper page-content">
        <header className="page-header">
          <h1 className="page-title">Konto</h1>
          <p className="page-subtitle">Hantera din profil och inställningar</p>
        </header>

        <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Hantera din kontoinformation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Namn</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ditt namn"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  E-postadressen kan inte ändras
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Mobilnummer</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+46 70 123 45 67"
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  Används för notifikationer och kontoåterställning
                </p>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.type === "success"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Sparar..." : "Spara ändringar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle>Säkerhet</CardTitle>
            <CardDescription>Hantera ditt lösenord</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Lösenord</p>
                <p className="text-xs text-muted-foreground">
                  Byt ditt lösenord för att hålla kontot säkert
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/konto/losenord">Byt lösenord</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Utseende</CardTitle>
            <CardDescription>Anpassa hur appen ser ut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Mörkt läge</p>
                <p className="text-xs text-muted-foreground">
                  Aktivera mörkt färgschema
                </p>
              </div>
              {isLoaded && (
                <Switch
                  checked={isDark}
                  onCheckedChange={toggle}
                  aria-label="Växla mörkt läge"
                />
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </main>
  );
}
