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

export default function ProjectEditNavBar() {
  const router = useRouter();

  return (
    <Box
      boxShadow="md"
      px={4}
      bgColor={useColorModeValue("blue.600", "gray.900")}
      color={"white"}
    >
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <Link href={"/projects"}>
          <a>
            <Button colorScheme="gray.200" variant="ghost">
              Back
            </Button>
          </a>
        </Link>
      </Flex>
    </Box>
  );
}
