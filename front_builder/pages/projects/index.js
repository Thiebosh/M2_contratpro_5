import {
  Avatar,
  Box,
  Container,
  Center,
  Flex,
  IconButton,
  Table,
  TableCaption,
  SimpleGrid,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

import { EditIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import $ from "jquery";
import requireAuth from "../../components/utils/requireAuth";

export default function Projets() {
  useEffect(() => {
    $.ajax({
      url: "http://localhost:8001/account/connect",
      type: "POST",
      data: {
        name: "test",
        password: "test",
      },
      success: function (resp) {
        console.log(resp.id);
      },
      error: function () {
        console.log("failure");
      },
    });
  }, []);

  return (
    <Container maxW={"container.xl"} py={8}>
      <Box className="header" m={5}>
        <Wrap>
          <WrapItem>
            <Avatar size="xl" src="https://bit.ly/code-beast" />
          </WrapItem>
          <WrapItem>
            <Center w="200px" h="100px">
              <Text fontSize="xl">Projets en cours...</Text>
            </Center>
          </WrapItem>
        </Wrap>
      </Box>

      <Box className="container">
        <Wrap direction="column">
          <Table variant="simple">
            <TableCaption>Liste des projets en cours</TableCaption>
            <div className="numberProjects"></div>
            <Thead>
              <Tr>
                <Th>Nom</Th>
                <Th>Date de création</Th>
                <Th>Dernière modification au</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>BenPorj</Td>
                <Td> 20/01/2022</Td>
                <Td>12/10/2020</Td>
                <Td>
                  <IconButton aria-label="modifier" icon={<EditIcon />} />
                </Td>
              </Tr>
              <Tr>
                <Td>Bennne</Td>
                <Td>12/10/2020</Td>
                <Td>28/11/2020</Td>
                <Td>
                  <IconButton aria-label="modifier" icon={<EditIcon />} />
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Wrap>
      </Box>
    </Container>
  );
}

export const getServerSideProps = requireAuth;
