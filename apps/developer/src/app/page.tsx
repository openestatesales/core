import { createOesClient } from "@oes/sdk";
import { Landing } from "../components/Landing";
import { SdkSanityCheck } from "../components/SdkSanityCheck";

export default function DeveloperHomePage() {
  const client = createOesClient({
    baseUrl: "https://openestatesales.com",
  });

  return (
    <Landing sdkBaseUrl={client.baseUrl}>
      <SdkSanityCheck baseUrl={client.baseUrl} />
    </Landing>
  );
}

