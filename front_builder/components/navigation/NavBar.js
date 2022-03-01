import React from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import Link from "next/link";

const links = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
];

const accountLinks = [
  { label: "Account", href: "/account" },
  { label: "Settings", href: "/account/settings" },
];

const NavLink = ({ link }) => (
  <Link href={link.href}>
    <a>
      <Button colorScheme="teal" variant="ghost">
        {link.label}
      </Button>
    </a>
  </Link>
);

export default function Simple() {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box boxShadow="base" px={4}>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          size={"md"}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />

        <HStack spacing={8} alignItems={"center"}>
          <Box>LOGO</Box>
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            {links.map((link) => (
              <NavLink key={link.label} link={link} />
            ))}
          </HStack>
        </HStack>

        <Flex alignItems={"center"}>
          <IconButton
            mr={2}
            onClick={toggleColorMode}
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            aria-label={"Toggle dark mode"}
          />
          <Menu>
            <MenuButton
              as={Button}
              rounded={"full"}
              variant={"link"}
              cursor={"pointer"}
              minW={0}
            >
              <Avatar
                size={"sm"}
                src={
                  "https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                }
              />
            </MenuButton>
            <MenuList>
              {accountLinks.map((link) => (
                <Link href={link.href} key={link.href}>
                  <a>
                    <MenuItem>{link.label}</MenuItem>
                  </a>
                </Link>
              ))}
              <MenuDivider />
              <Link href="/account/logout">
                <a>
                  <MenuItem>Logout</MenuItem>
                </a>
              </Link>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as={"nav"} spacing={4}>
            {links.map((link) => (
              <NavLink key={link} link={link} />
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
