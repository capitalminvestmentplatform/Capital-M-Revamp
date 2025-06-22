import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";

const Home = () => {
  return (
    <div>
      <Image
        src={"/images/logo.png"}
        alt="home-logo"
        width={120}
        height={50}
        className="my-3 mx-10"
      />
      <div className="relative bg-homeBackground bg-cover bg-center h-screen px-16 py-10">
        {/* White Overlay */}
        <div className="absolute inset-0 bg-white bg-opacity-25 z-0" />

        {/* Your content goes here */}
        <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
          <p className="font-bold text-4xl mb-4">Welcome to</p>
          <p className="font-bold text-4xl mb-4">Capital M Investments</p>
          <hr className="bg-black border-black w-52 mb-4" />
          <p className="font-semibold text-xl">
            The Family Investment Office of{" "}
          </p>
          <p className="font-semibold text-xl mb-5">Mostafa Bin Abdullatif</p>

          <Link
            href={"/auth/login"}
            className="bg-primaryBG py-2 px-5 rounded-md text-white text-md hover:bg-primaryBG"
          >
            Investor Login
          </Link>
        </div>
      </div>
      <div className="bg-primaryBG text-white py-10">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl px-4">
            <p className="text-3xl font-bold mb-2">
              A platform for accumulating and increasing the family’s wealth
            </p>
            <p className="mb-2">
              Capital M is the platform for our members to manage their wealth
              more efficiently and getting access to unique investment
              opportunities.
            </p>
            <p>
              Our goal is to protect, grow and preserve the wealth of our
              members.
            </p>
          </div>
        </div>
      </div>
      <div className="py-10">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl px-4">
            <p className="text-4xl text-primaryBG font-bold mb-2">
              In business for a century, here to last
            </p>
            <p className="mb-4">
              Mostafa Bin Abdullatif is a family owned business built on strong
              foundations of fair play, commitment and loyalty as laid down by
              our founder, Sheikh Mostafa Bin Abdullatif.
            </p>

            <p className="mb-6">
              We are operating numerous businesses in UAE and Bahrain for nearly
              a century and have built a diversified portfolio of commercial
              enterprises performing across a broad spectrum of the market.
            </p>
            <Link
              href={"/"}
              className="bg-primaryBG py-2 px-5 rounded-md text-white text-md hover:bg-primaryBG"
            >
              Read more
            </Link>
          </div>
        </div>
      </div>
      <footer className="bg-primaryBG text-white py-10">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl px-4">
            <div className="flex flex-wrap">
              <div className="w-1/2 lg:w-6/12">
                <h5 className="text-lg font-semibold">Address</h5>
                <p className="mb-5">
                  7th floor, O14 Tower, Al Abraj St, Business Bay Dubai, AE,
                </p>
                <div>
                  <a href="mailto:info@capitalm.ae" className="">
                    info@capitalm.ae
                  </a>
                </div>
              </div>

              <div className="w-1/2 lg:w-6/12">
                <h5 className="text-lg font-semibold">About us</h5>
                <p>Family Investment Office of Mostafa Bin Abdullatif</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
