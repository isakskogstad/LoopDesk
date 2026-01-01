import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Företaget hittades inte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Vi kunde inte hitta något företag med det angivna organisationsnumret.
            Kontrollera att du angett rätt nummer.
          </p>
          <Link href="/">
            <Button>Tillbaka till sökning</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
