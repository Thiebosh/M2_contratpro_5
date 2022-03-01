import { Fragment } from "react";
import Link from "next/link";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/react/outline";
import { Box, Image } from "@chakra-ui/react";
import NavBar from "./NavBar";

const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};
const navigation = [
  { name: "Home", href: "/", current: true },
  { name: "Dashboard", href: "/dashboard", current: false },
  { name: "Projects", href: "/projects", current: false },
  { name: "About", href: "/about", current: false },
];
const userNavigation = [
  { name: "Your Profile", href: "/account" },
  { name: "Settings", href: "/account/settings" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Layout({ children }) {
  const { logout } = () => {};

  return (
    <>
      <NavBar />
      <Box>{children}</Box>
    </>
  );
}
