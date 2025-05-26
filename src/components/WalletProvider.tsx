"use client";

import { PropsWithChildren } from "react";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  // We're now only focusing on Stellar wallet connectivity
  // The Stellar wallet connection is handled in the WalletConnect component
  return children;
};