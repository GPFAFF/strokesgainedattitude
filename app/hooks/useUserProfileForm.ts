import { useEffect, useState } from "react";

export default function useUserProfileForm(user?: any) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [handicap, setHandicap] = useState("");

  // only initialize once when the user is first loaded
  useEffect(() => {
    if (user) {
      setDisplayName((prev) => prev || user.displayName || "");
      setEmail((prev) => prev || user.email || "");
      setHandicap((prev) => prev || user.handicap?.toString() || "");
    }
  }, [user]);

  return {
    displayName,
    setDisplayName,
    email,
    handicap,
    setHandicap,
  };
}
