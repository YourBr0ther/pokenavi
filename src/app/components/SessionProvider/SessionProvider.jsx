"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

const cstSessionProvider = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default cstSessionProvider;