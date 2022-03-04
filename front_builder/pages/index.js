import { Box, Button, Container, Heading, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import requireAuth from "../middleware/requireAuth";

export default function CallToActionWithAnnotation() {
  return (
    <>
      <Container maxW={"3xl"}>
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            Welcome to{" "}
            <Text as={"span"} color={"blue.400"}>
              &lt;SpecTry/&gt;
            </Text>
          </Heading>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
          >
            <Link href="/dashboard">
              <Button
                size="lg"
                colorScheme={"blue"}
                bg={"blue.400"}
                rounded={"full"}
                px={6}
                _hover={{
                  bg: "blue.500",
                }}
              >
                Go to Dashbord &rarr;
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export const getServerSideProps = requireAuth;
