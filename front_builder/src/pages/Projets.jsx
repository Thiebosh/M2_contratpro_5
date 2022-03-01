import {
    Avatar,
    Box,
    Center,
    Flex, IconButton,
    Table,
    TableCaption,
    Tbody, Td,
    Text, Tfoot,
    Th,
    Thead,
    Tr,
    Wrap,
    WrapItem
} from "@chakra-ui/react";

import { EditIcon } from '@chakra-ui/icons'
import {useEffect} from "react";
import axios from "axios";

export default function Projets() {

    useEffect(()=> {
        axios.post('/user', {
            firstName: 'Fred',
            lastName: 'Flintstone'
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }, [])


  return (
      <div className='projetsPage'>
          <Flex>
              <div className='avatar'>
                  <Wrap>
                      <WrapItem>
                          <Avatar size='xl' src='https://bit.ly/code-beast' />
                      </WrapItem>
                  </Wrap>
              </div>

              <div className='container'>
                  <Wrap direction='column'>
                      <WrapItem>
                          <Center w='300px' h='80px'>
                              <Text fontSize='2xl'>Projets en cours...</Text>
                          </Center>
                      </WrapItem>
                      <Table variant='simple'>
                          <TableCaption>Liste des projets en cours</TableCaption>
                          <div className='numberProjects'>

                          </div>
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
                                      <IconButton aria-label='modifier' icon={<EditIcon />} />
                                  </Td>
                              </Tr>
                              <Tr>
                                  <Td>Bennne</Td>
                                  <Td>12/10/2020</Td>
                                  <Td>28/11/2020</Td>
                                  <Td>
                                      <IconButton aria-label='modifier' icon={<EditIcon />} />
                                  </Td>
                              </Tr>
                          </Tbody>
                      </Table>
                  </Wrap>
              </div>
          </Flex>

      </div>
  );
}
