"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const profiles = [
  { name: "Isak", src: "/profiles/Isak.png" },
  { name: "Jenny", src: "/profiles/Jenny.png" },
  { name: "Christian", src: "/profiles/Christian.png" },
  { name: "Camilla", src: "/profiles/Camilla.png" },
  { name: "Diana", src: "/profiles/Diana.png" },
  { name: "Johann", src: "/profiles/Johann.png" },
  { name: "Sandra", src: "/profiles/Sandra.png" },
  { name: "Andreas", src: "/profiles/Andreas.png" },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect authenticated users to /nyheter
    if (status === "authenticated") {
      router.push("/nyheter");
    }
  }, [status, router]);

  const handleProfileClick = (name: string) => {
    // Left click - redirect to login page
    router.push("/login");
  };

  const handleContextMenu = (e: React.MouseEvent, name: string) => {
    // Right click - check if logged in
    e.preventDefault();

    if (status === "authenticated") {
      // User is logged in, can proceed
      console.log(`Right-clicked on ${name} - user is authenticated`);
      router.push("/nyheter");
    } else {
      // User is not logged in, redirect to login
      console.log(`Right-clicked on ${name} - user not authenticated`);
      router.push("/login");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="loopdesk-stage">
      <div className="loopdesk-container">
        <h1 className="loopdesk-title">
          <span>LOOP</span>
          <span>DESK</span>
        </h1>

        <div className="orbit-container">
          {profiles.map((profile, i) => {
            const count = profiles.length;
            const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
            const baseRadius = typeof window !== 'undefined'
              ? Math.min(window.innerWidth, window.innerHeight) * 0.32
              : 300;
            const x = Math.cos(angle) * baseRadius;
            const y = Math.sin(angle) * baseRadius;
            const delay = 0.3 + i * 0.07;
            const floatDuration = 5 + (i % 3);
            const floatDelay = i * 0.25;

            return (
              <button
                key={profile.name}
                className="profile-card"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  animationDelay: `${delay}s`,
                }}
                onClick={() => handleProfileClick(profile.name)}
                onContextMenu={(e) => handleContextMenu(e, profile.name)}
              >
                <div className="profile-avatar-wrapper">
                  <Image
                    src={profile.src}
                    alt={profile.name}
                    width={140}
                    height={140}
                    className="profile-avatar"
                    priority
                  />
                </div>
                <span className="profile-name">{profile.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
