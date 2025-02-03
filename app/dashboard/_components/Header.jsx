"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

function Header() {
  const { user } = useUser();
  const path = usePathname();
  useEffect(() => {
    console.log(path);
  }, []);

  return (
    <div className="flex p-4 items-center justify-between bg-secondary shadow-sm">
      <Link href={"/"} className="flex items-center space-x-2">
        <Image src={"/logo2.png"} width={50} height={100} alt="logo" />
        <span className="text-3xl ml-3 font-extrabold">MockMantra</span>
      </Link>
      <ul className="hidden md:flex gap-6 ml-[20px]">
        <Link href={"/dashboard"}>
          <li
            className={`hover:text-blue-800 hover:font-bold transition-all
            cursor-pointer
            ${path == "/dashboard" && "text-blue-800 font-bold"}
            `}
          >
            Dashboard
          </li>
        </Link>

        
        {/* <Link href={"/dashboard/upgrade"}>
          <li
            className={`hover:text-blue-800 hover:font-bold transition-all
            cursor-pointer
            ${path == "/dashboard/upgrade" && "text-blue-800 font-bold"}
            `}
          >
            Upgrade
          </li>
        </Link> */}
        <Link href={"/#howItWorks"}>
          <li
            className={`hover:text-blue-800 hover:font-bold transition-all
            cursor-pointer
            ${path == "/dashboard/how" && "text-blue-800 font-bold"}
            `}
          >
            How it Works?
          </li>
        </Link>
      </ul>
      {user?.primaryEmailAddress?.emailAddress != "the.igloo18@gmail.com" && (
        <UserButton />
      )}
    </div>
  );
}

export default Header;
