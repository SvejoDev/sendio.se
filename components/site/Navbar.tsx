"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/#funktioner" legacyBehavior passHref>
            <NavigationMenuLink className="px-3 py-2 text-sm font-medium">
              Funktioner
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/#priser" legacyBehavior passHref>
            <NavigationMenuLink className="px-3 py-2 text-sm font-medium">
              Priser
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/#sa-fungerar-det" legacyBehavior passHref>
            <NavigationMenuLink className="px-3 py-2 text-sm font-medium">
              Så fungerar det
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Sendio
          </Link>
          <div className="hidden md:block">
            <NavLinks />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/signin">Logga in</Link>
              </Button>
              <Button asChild>
                <Link href="/signin?flow=signUp">Skapa konto</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar>
                  <AvatarFallback>SE</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Konto</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    void signOut().then(() => router.push("/"));
                  }}
                >
                  Logga ut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Meny">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Sendio</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/#funktioner"
                  onClick={() => setOpen(false)}
                  className="py-2"
                >
                  Funktioner
                </Link>
                <Link
                  href="/#priser"
                  onClick={() => setOpen(false)}
                  className="py-2"
                >
                  Priser
                </Link>
                <Link
                  href="/#sa-fungerar-det"
                  onClick={() => setOpen(false)}
                  className="py-2"
                >
                  Så fungerar det
                </Link>
                <div className="h-px my-2 bg-border" />
                {!isAuthenticated ? (
                  <div className="flex gap-2">
                    <Button variant="ghost" asChild className="flex-1">
                      <Link href="/signin" onClick={() => setOpen(false)}>
                        Logga in
                      </Link>
                    </Button>
                    <Button asChild className="flex-1">
                      <Link
                        href="/signin?flow=signUp"
                        onClick={() => setOpen(false)}
                      >
                        Skapa konto
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      void signOut().then(() => {
                        setOpen(false);
                        router.push("/");
                      });
                    }}
                  >
                    Logga ut
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
