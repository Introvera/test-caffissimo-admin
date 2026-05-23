"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";

interface LocationInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (address: string, lat?: number, lng?: number) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function LocationInput({
  value,
  onChange,
  onSelect,
  disabled = false,
  className = "",
  placeholder = "Search address on Google Maps...",
}: LocationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadingScript, setLoadingScript] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (typeof window !== "undefined" && (window as any).google?.maps?.places) {
      setScriptLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined. Falling back to manual address input.");
      return;
    }

    setLoadingScript(true);

    const scriptId = "google-maps-places-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const handleScriptLoad = () => {
      setScriptLoaded(true);
      setLoadingScript(false);
    };

    script.addEventListener("load", handleScriptLoad);

    return () => {
      if (script) {
        script.removeEventListener("load", handleScriptLoad);
      }
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !inputRef.current) return;

    const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "au" },
    });

    const inputElement = inputRef.current;
    
    // Prevent form submission on Enter when selecting address from dropdown
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    };
    
    inputElement.addEventListener("keydown", handleKeyDown);

    // Dismiss the autocomplete dropdown when scrolling the page or any parent container
    const handleScroll = () => {
      if (document.activeElement === inputElement) {
        inputElement.blur();
      }
    };
    window.addEventListener("scroll", handleScroll, true);

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const formattedAddress = place.formatted_address || inputRef.current?.value || "";
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      
      onSelect(formattedAddress, lat, lng);
    });

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("keydown", handleKeyDown);
      }
      window.removeEventListener("scroll", handleScroll, true);
      (window as any).google?.maps?.event?.clearInstanceListeners(autocomplete);
    };
  }, [scriptLoaded, onSelect]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`pl-10 ${className}`}
        placeholder={placeholder}
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {loadingScript ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </div>
    </div>
  );
}
