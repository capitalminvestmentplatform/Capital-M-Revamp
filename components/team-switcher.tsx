"use client";
import * as React from "react";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex justify-center">
        <Link href={"/"}>
          <Image
            src="/images/company/logo-1.png"
            alt="brand"
            width={70}
            height={70}
            className="my-7"
          />
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
