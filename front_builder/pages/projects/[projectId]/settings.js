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
import ProjectUsersModal from "../../../components/modals/ProjectUsersModal";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import dayjs from "dayjs";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/outline";

export default function Settings({ user }) {
  const toast = useToast();
  const renameInput = useRef();
  const router = useRouter();
  const { projectId } = router.query;
  const [usersProject, setUsersProject] = useState(0);
  const [projects, setProjects] = useState([]);

  // useEffect(() => {
  //   const dataProjects = {
  //     id: user.id,
  //   };
  //   $.ajax({
  //     url: "http://localhost:8001/project/search_by_user",
  //     type: "POST",
  //     data: dataProjects,
  //     success: function (resp) {
  //       setProjects(resp.result);
  //       console.log(resp);
  //     },
  //     error: function () {
  //       console.log("failure");
  //     },
  //   });
  // }, []);

  return (
    <>
      <Container
        maxW={"container.xls"}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Heading fontSize={"4xl"} my={4}>
          Settings
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
            <Input variant="filled" isDisabled placeholder="projects" />
            {projects.map((project) => (
              <Tr key={project.id}>
                <Input variant="filled" isDisabled placeholder="projects" />
              </Tr>
            ))}
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme={"blue"}
            px={3}
            mt={5}
            onClick={() => setUsersProject(projectId)}
          >
            Add users
          </Button>
        </Box>
      </Container>
      <ProjectUsersModal
        projectId={usersProject}
        setProjectId={setUsersProject}
      />
    </>
  );
}

export const getServerSideProps = requireAuth;
