import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useRef } from "react";

export default function ConfirmDeleteDialog({
  title,
  text,
  deleteAction,
  cancelAction,
  objectId,
}) {
  const cancelRef = useRef();

  return (
    <>
      <AlertDialog
        isOpen={objectId}
        leastDestructiveRef={cancelRef}
        onClose={cancelAction}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {title}
            </AlertDialogHeader>

            <AlertDialogBody>{text}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={cancelAction}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => deleteAction(objectId)}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
