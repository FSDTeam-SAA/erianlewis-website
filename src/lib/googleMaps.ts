export type GoogleMapsApi = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => {
      panTo: (position: { lat: number; lng: number }) => void;
      setCenter: (position: { lat: number; lng: number }) => void;
      setZoom: (zoom: number) => void;
      fitBounds: (bounds: { extend: (position: { lat: number; lng: number }) => void }, padding?: number) => void;
      getBounds: () => {
        contains: (position: { lat: number; lng: number }) => boolean;
      } | undefined;
    };
    Marker: new (options: Record<string, unknown>) => {
      setMap: (map: unknown) => void;
      addListener: (eventName: string, handler: () => void) => void;
    };
    Size: new (width: number, height: number) => unknown;
    Point: new (x: number, y: number) => unknown;
    LatLngBounds: new () => {
      extend: (position: { lat: number; lng: number }) => void;
    };
    event: {
      addListener: (
        instance: unknown,
        eventName: string,
        handler: () => void,
      ) => {
        remove: () => void;
      };
      trigger: (instance: unknown, eventName: string) => void;
    };
    Geocoder: new () => {
      geocode: (
        request: { address: string },
        callback: (
          results: Array<{
            geometry: {
              location: {
                lat: () => number;
                lng: () => number;
              };
            };
          }> | null,
          status: string,
        ) => void,
      ) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
    __googleMapsLoaderPromise?: Promise<GoogleMapsApi>;
    gm_authFailure?: () => void;
  }
}

export const loadGoogleMapsApi = (): Promise<GoogleMapsApi> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!googleMapsApiKey) {
    return Promise.reject(
      new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment."),
    );
  }

  if (window.__googleMapsLoaderPromise) {
    return window.__googleMapsLoaderPromise;
  }

  window.__googleMapsLoaderPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-google-maps-loader="true"]',
    );

    // Register Google Maps auth failure handler
    window.gm_authFailure = () => {
      reject(
        new Error(
          "API Key Restriction Error: Google Maps has rejected this request. " +
          "Your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY has HTTP referrer restrictions enabled in Google Cloud Console " +
          "that block origin requests from 'http://localhost:3000/*'. " +
          "To fix this, authorize 'http://localhost:3000/*' under Web Restrictions for this key, or use an unrestricted key."
        )
      );
    };

    const handleLoad = () => {
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        reject(new Error("Google Maps failed to initialize."));
      }
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load the Google Maps script.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "true";
    script.onload = handleLoad;
    script.onerror = () =>
      reject(new Error("Failed to load the Google Maps script."));
    document.head.appendChild(script);
  });

  return window.__googleMapsLoaderPromise;
};

export const geocodeAddress = async (
  address: string,
): Promise<{ lat: string; lng: string }> => {
  const googleInstance = await loadGoogleMapsApi();
  const geocoder = new googleInstance.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: String(location.lat()),
          lng: String(location.lng()),
        });
      } else {
        reject(new Error(`Geocoding status: ${status}`));
      }
    });
  });
};

export const getIslandCenter = (
  islandName: string,
): { lat: string; lng: string } | null => {
  const name = islandName.toLowerCase().trim();
  if (name.includes("providence") || name.includes("nassau")) {
    return { lat: "25.047987", lng: "-77.355413" };
  }
  if (name.includes("grand bahama") || name.includes("freeport")) {
    return { lat: "26.533333", lng: "-78.666667" };
  }
  if (name.includes("abaco")) {
    return { lat: "26.368889", lng: "-77.166944" };
  }
  if (name.includes("eleuthera")) {
    return { lat: "25.166667", lng: "-76.25" };
  }
  if (name.includes("exuma")) {
    return { lat: "23.533333", lng: "-75.833333" };
  }
  if (name.includes("bimini")) {
    return { lat: "25.733333", lng: "-79.283333" };
  }
  if (name.includes("andros")) {
    return { lat: "24.7", lng: "-78.0" };
  }
  if (name.includes("long island")) {
    return { lat: "23.15", lng: "-75.1" };
  }
  if (name.includes("san salvador")) {
    return { lat: "24.033333", lng: "-74.5" };
  }
  if (name.includes("cat island")) {
    return { lat: "24.25", lng: "-75.5" };
  }
  if (name.includes("berry")) {
    return { lat: "25.666667", lng: "-77.833333" };
  }
  if (name.includes("acklins")) {
    return { lat: "22.4", lng: "-74.0" };
  }
  if (name.includes("crooked")) {
    return { lat: "22.75", lng: "-74.2" };
  }
  if (name.includes("mayaguana")) {
    return { lat: "22.383333", lng: "-72.933333" };
  }
  if (name.includes("inagua")) {
    return { lat: "21.05", lng: "-73.3" };
  }
  if (name.includes("rum cay")) {
    return { lat: "23.666667", lng: "-74.833333" };
  }
  if (name.includes("ragged")) {
    return { lat: "22.166667", lng: "-75.733333" };
  }
  return null;
};
