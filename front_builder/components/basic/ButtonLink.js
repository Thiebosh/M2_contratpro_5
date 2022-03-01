import NextLink from "next/link";
import { Button } from "@chakra-ui/react";

export default function ButtonLink({ href, children, ...props }) {
  return (
    <NextLink href={href}>
      <a>
        <Button {...props}>{children}</Button>
      </a>
    </NextLink>
  );
}
