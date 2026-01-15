import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ personId: string }>;
}

interface AllabolagPersonData {
  props?: {
    pageProps?: {
      person?: {
        name: string;
        businessPersonId: string;
        companyRoles?: {
          orgnr: string;
          companyName: string;
          roleName: string;
          companyStatus?: { status: string };
        }[];
      };
      rolePerson?: {
        name: string;
        personId: string;
        roles?: {
          id: string;
          name: string;
          role: string;
          status?: { status: string; statusFlag?: string };
        }[];
      };
    };
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { personId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const nameParam = searchParams.get("name") || undefined;

  const slugifyName = (name: string): string =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const candidateUrls = [
    `https://www.allabolag.se/befattningshavare/${personId}`,
  ];

  if (nameParam) {
    const slug = slugifyName(nameParam);
    if (slug) {
      candidateUrls.push(
        `https://www.allabolag.se/befattning/${slug}/-/${personId}`
      );
    }
  } else {
    candidateUrls.push(
      `https://www.allabolag.se/befattning/person/-/${personId}`
    );
  }

  try {
    for (const url of candidateUrls) {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      const html = await response.text();

      // Extract __NEXT_DATA__ JSON
      const match = html.match(
        /<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/
      );
      if (!match) {
        continue;
      }

      const data: AllabolagPersonData = JSON.parse(match[1]);
      const person = data.props?.pageProps?.person;
      const rolePerson = data.props?.pageProps?.rolePerson;

      if (!person && !rolePerson) {
        continue;
      }

      const engagements = person
        ? (person.companyRoles || []).map((role) => ({
            orgNr: role.orgnr,
            companyName: role.companyName,
            role: role.roleName,
            active: role.companyStatus?.status === "ACTIVE",
          }))
        : (rolePerson?.roles || []).map((role) => ({
            orgNr: role.id,
            companyName: role.name,
            role: role.role,
            active:
              role.status?.status === "ACTIVE" ||
              role.status?.statusFlag === "ACTIVE",
          }));

      return NextResponse.json({
        name: person?.name || rolePerson!.name,
        id: person?.businessPersonId || rolePerson!.personId,
        engagements,
      });
    }

    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching person:", error);
    return NextResponse.json({ error: "Failed to fetch person" }, { status: 500 });
  }
}
