import requireAuth from "../../../middleware/requireAuth";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";
import { CloseIcon, HamburgerIcon, Icon } from "@chakra-ui/icons";
import { SaveIcon } from "@heroicons/react/outline";

const links = [
  {
    label: "Close",
    href: "/projects",
    icon: <CloseIcon />,
  },
  {
    label: "Save",
    onClick: "/projects",
    icon: <Icon as={SaveIcon} boxSize={5} />,
  },
];

export default function ProjectDetails() {
  const router = useRouter();
  const { projectId } = router.query;

  useEffect(() => {}, []);

  return (
    <>
      <Head>
        <title>Edit Project</title>
      </Head>
      <Box position={"relative"}>
        <Flex
          align={"center"}
          justify={"space-between"}
          position={"fixed"}
          w={"100vw"}
          zIndex={100}
          p={2}
          bg={"whiteAlpha.700"}
          borderBottom={"1px"}
          borderColor={"gray.100"}
        >
          <Flex flex={1}>
            <Menu>
              <MenuButton
                shadow={"xs"}
                border={"solid 1px gray.800"}
                as={IconButton}
                icon={<HamburgerIcon />}
                bgColor={"white"}
              />
              <MenuList>
                {links.map((link) => (
                  <MenuItem key={link.label} icon={link.icon}>
                    {link.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Flex>
          <Flex flex={1} justify={"center"}>
            <Heading>Project Graph</Heading>
          </Flex>
          <Flex flex={1} justify={"right"}>
            <Text color={"gray.500"}>Id: {projectId}</Text>
          </Flex>
        </Flex>
        <Box bg={useColorModeValue("gray.50", "gray.800")} minH={"100vh"} p={1}>
          {/* REPLACE CODE BELLOW WITH GRAPH */}
          {/* --- START --- */}
          <Box h={"200px"} w={"200px"} bgColor={"red"} px={4} py={14}>
            REPLACE THIS CODE WITH GRAPH CONTENT
          </Box>
          {/* --- END --- */}
        </Box>
      </Box>
    </>
  );
}

export const getServerSideProps = requireAuth;

ProjectDetails.layout = false;
