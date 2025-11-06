import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Dimensions } from "react-native";

export default function Index() {
  const [isMobileWeb, setIsMobileWeb] = useState<boolean | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      setIsMobileWeb(false);
      return;
    }

    const checkMobile = () => {
      if (typeof window === "undefined") return false;

      const userAgent = window.navigator.userAgent.toLowerCase();
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        );
      const isSmallScreen = window.innerWidth <= 768;

      return isMobileDevice || isSmallScreen;
    };

    const handleResize = () => {
      setIsMobileWeb(checkMobile());
    };

    setIsMobileWeb(checkMobile());

    const subscription = Dimensions.addEventListener("change", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      subscription?.remove();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isMobileWeb === null) {
    return null;
  }

  if (isMobileWeb) {
    return <Redirect href="/download-app" />;
  }

  return <Redirect href="/(auth)/login" />;
}
