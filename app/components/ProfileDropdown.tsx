import {
  LogOut,
  Settings,
  UserRound,
  User,
  File,
  ChartBar,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ProfileDropdown = () => {
  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Ensures cookies are sent and received
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        // Redirect user or update UI after logout
        window.location.href = "/auth/login"; // Redirect to login page
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserRound className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User />
            <Link href={"/user/profile"}>Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            <Link href={"/user/profile"}>Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <File />
            <Link href={"/dashboard/documents"}>Documents</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ChartBar />
            <Link href={"/dashboard/panda-connect"}>Stats</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button
            className="w-full bg-primaryBG hover:bg-primaryBG"
            onClick={handleSubmit}
          >
            <LogOut /> Log out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
