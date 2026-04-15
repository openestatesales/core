// Google Maps API loader utility
let isGoogleMapsLoaded = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(
      new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"),
    );
  }
  // If already loaded, return resolved promise
  if (
    isGoogleMapsLoaded &&
    typeof google !== "undefined" &&
    typeof google.maps?.Map === "function"
  ) {
    return Promise.resolve();
  }

  // If already loading, return existing promise
  if (loadPromise) {
    return loadPromise;
  }

  // Create new loading promise
  loadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (
      typeof google !== "undefined" &&
      typeof google.maps?.Map === "function"
    ) {
      isGoogleMapsLoaded = true;
      resolve();
      return;
    }

    const callbackName = "__oes_gmaps_onload__";
    (window as unknown as Record<string, unknown>)[callbackName] = async () => {
      try {
        // If supported, ensure the required libraries are actually ready.
        if (typeof google !== "undefined" && "importLibrary" in google.maps) {
          await google.maps.importLibrary("maps");
          await google.maps.importLibrary("marker");
          await google.maps.importLibrary("places");
        }

        if (typeof google.maps?.Map !== "function") {
          throw new Error("Google Maps loaded, but Map is unavailable");
        }

        isGoogleMapsLoaded = true;
        resolve();
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      } finally {
        try {
          delete (window as unknown as Record<string, unknown>)[callbackName];
        } catch {
          // ignore
        }
      }
    };

    // Create script element
    const script = document.createElement('script');
    // Google recommends adding `loading=async` (in addition to script.async) to avoid perf warnings.
    // Use callback= so we only resolve after Maps is fully initialized.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async&callback=${callbackName}&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

export const isGoogleMapsReady = (): boolean => {
  return isGoogleMapsLoaded && typeof google !== "undefined";
};