import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  Stack,
  Td,
  Textarea,
  Tr,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import $ from "jquery";
import requireAuth from "../../../components/utils/requireAuth";
import { useRouter } from "next/router";
import ProjectAddUsersModal from "../../../components/modals/ProjectAddUsersModal";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import dayjs from "dayjs";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/outline";

export default function Settings({ user }) {
  const toast = useToast();
  const renameInput = useRef();
  const router = useRouter();
  const projectName = "";
  const { projectId } = router.query;
  const [dataProject, setDataProject] = useState({ name: "", users: [] });
  const [addUserIsOpen, setAddUserIsOpen] = useState(false);

  useEffect(() => {
    $.ajax({
      url: "http://localhost:8001/project/search",
      type: "POST",
      data: {
        id: projectId,
      },
      success: function (resp) {
        setDataProject(resp.result[0]);
        console.log(resp);
      },
      error: function () {
        console.log("failure");
      },
    });
  }, []);

  return (
    <>
      <Container
        maxW={"container.xls"}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Heading fontSize={"4xl"} my={4}>
          Settings {dataProject.name}
        </Heading>
        <Box
          mx={"auto"}
          w={"100%"}
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Heading size={"md"} mb={3}>
            Manage users
          </Heading>
          <Box maxW={"45%"}>
            {dataProject.users.map((user) => (
              <Input
                variant="filled"
                mb={2}
                isDisabled
                placeholder={user.name}
              />
            ))}
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme={"blue"}
            px={3}
            mt={5}
            onClick={() => setAddUserIsOpen(true)}
          >
            Add users
          </Button>
        </Box>
      </Container>
      <ProjectAddUsersModal
        isOpen={addUserIsOpen}
        setIsOpen={setAddUserIsOpen}
        projectId={projectId}
      />
    </>
  );
}

export const getServerSideProps = requireAuth;
