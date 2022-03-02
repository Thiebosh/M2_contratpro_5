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
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import Link from "next/link";

const NavLink = ({ link }) => (
  <Link href={link.href}>
    <a>
      <Button colorScheme="gray.200" variant="ghost">
        {link.label}
      </Button>
    </a>
  </Link>
);

export default function NavBar() {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const links = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Projects", href: "/projects" },
  ];

  const accountLinks = [
    { label: "Account", href: "/account" },
    { label: "Settings", href: "/account/settings" },
  ];

  return (
    <Box
      boxShadow="md"
      px={4}
      bgColor={useColorModeValue("blue.600", "gray.900")}
      color={"white"}
    >
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          size={"md"}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />

        <HStack spacing={8} alignItems={"center"}>
          <Text fontWeight={"bold"}>&lt;SpecTry/&gt;</Text>
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
            variant={""}
          />
          <Menu>
            <MenuButton
              as={Button}
              rounded={"full"}
              variant={"link"}
              cursor={"pointer"}
              minW={0}
            >
              <Avatar size={"sm"} />
            </MenuButton>
            <MenuList color={"gray.800"}>
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
