"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/partner");
  }, [router]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#090d16",
      color: "#f8fafc",
      fontFamily: "system-ui, sans-serif"
    }}>
      <p>Redirecting to merchant portal...</p>
    </div>
  );
}
