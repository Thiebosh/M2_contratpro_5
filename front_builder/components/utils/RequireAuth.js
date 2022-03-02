import { withSessionSsr } from "../../lib/withSession";

export default function RequireAuth({ children }) {
  return children;
}

export const getServerSideProps = withSessionSsr(
  async function getServerSideProps({ req, res }) {
    const { user } = req.session;
    console.log("user", user);

    if (!user) {
      res.setHeader("location", "/account/login");
      res.statusCode = 302;
      res.end();
      return {
        redirect: {
          destination: "/account/login",
          permanent: false,
        },
      };
    }

    return {
      props: { user },
    };
  }
);
