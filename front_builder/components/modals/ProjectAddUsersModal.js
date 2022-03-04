import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  TagCloseButton,
  TagLabel,
} from "@chakra-ui/react";
import { useState } from "react";
import { Autocomplete } from "chakra-ui-simple-autocomplete";

export default function ProjectAddUsersModal({
  isOpen,
  options,
  cancelAdd,
  saveAdd,
}) {
  const [results, setResults] = useState([]);

  function handleSave() {
    saveAdd(results);
    setResults([]);
  }

  function handleCancel() {
    cancelAdd();
    setResults([]);
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Users</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Box maxW="md">
              <Autocomplete
                autoComplete="off"
                id="name"
                options={options}
                result={results}
                setResult={(options) => setResults(options)}
                placeholder="Autocomplete"
                allowCreation={false}
                renderBadge={(option) => (
                  <Tag
                    size={"lg"}
                    key={option.value}
                    borderRadius="full"
                    mr={1}
                    mb={1}
                  >
                    <Avatar size="xs" ml={-1} mr={2} />
                    <TagLabel>{option.label}</TagLabel>
                    <TagCloseButton />
                  </Tag>
                )}
              />
            </Box>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Add
          </Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
