import {
  Container,
  Button,
  Input,
  Avatar,
  Flex,
  Stack,
  Wrap,
  WrapItem,
  Box,
  useToast,
  Center,
  AvatarBadge,
  FormControl,
  Heading,
  FormLabel,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { SmallCloseIcon } from "@chakra-ui/icons";
import $ from "jquery";

const idUser = "61e131ce9c11b699edc38a1e";
const newUserName = "ben";
const newPassword = "ben";

function changeDataAccount() {
  $.ajax({
    url: "http://localhost:8001/account/update",
    type: "POST",
    data: {
      id: idUser,
      name: newUserName,
    },
    success: function (resp) {
      console.log(resp);
      // const toast = useToast();
      //
      // toast({
      //   title: "Données sauvegardées",
      //   status: "success",
      //   duration: 5000,
      //   isClosable: true,
      // });
    },
    error: function () {
      console.log("failure");
    },
  });
}

export default function Account() {
  return (
    <Flex
      minH={"50vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack
        spacing={4}
        w={"full"}
        maxW={"md"}
        bg={useColorModeValue("white", "gray.700")}
        rounded={"xl"}
        boxShadow={"lg"}
        p={6}
        my={12}
      >
        <Heading lineHeight={1.1} fontSize={{ base: "xl", sm: "3xl" }}>
          User Profile Edit
        </Heading>
        <FormControl id="userName">
          <FormLabel>User Icon</FormLabel>
          <Stack direction={["column", "row"]} spacing={6}>
            <Center>
              <Avatar size="xl" src="https://bit.ly/code-beast">
                <AvatarBadge
                  as={IconButton}
                  size="sm"
                  rounded="full"
                  top="-10px"
                  colorScheme="red"
                  aria-label="remove Image"
                  icon={<SmallCloseIcon />}
                />
              </Avatar>
            </Center>
            <Center w="full">
              <Button w="full">Change Icon</Button>
            </Center>
          </Stack>
        </FormControl>
        <FormControl id="newUserName">
          <FormLabel>Change your user name</FormLabel>
          <Input
            placeholder="New UserName"
            _placeholder={{ color: "gray.500" }}
            type="text"
          />
        </FormControl>
        <FormControl id="newPassword">
          <FormLabel>Change your password</FormLabel>
          <Input
            placeholder="New password"
            _placeholder={{ color: "gray.500" }}
            type="password"
          />
        </FormControl>
        <Stack spacing={6} direction={["column", "row"]}>
          <Button
            bg={"red.400"}
            color={"white"}
            w="full"
            _hover={{
              bg: "red.500",
            }}
          >
            Cancel
          </Button>
          <Button
            bg={"blue.400"}
            color={"white"}
            w="full"
            _hover={{
              bg: "blue.500",
            }}
            onClick={changeDataAccount}
          >
            Submit
          </Button>
        </Stack>
      </Stack>
    </Flex>
  );
}
