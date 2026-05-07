"use client";

import { Provider } from "react-redux";
import { store, persistor } from "@/stores/store";
import { PersistGate } from "redux-persist/integration/react";
// Ensures all injected API slices are registered before any hook is called
import "@/stores/api";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
