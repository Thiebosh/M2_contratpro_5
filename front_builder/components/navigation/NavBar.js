import Link, { useRouter } from "next/router";

const navigation = [
  { name: "Home", href: "/", current: true },
  { name: "Dashboard", href: "/dashboard", current: false },
  { name: "Projects", href: "/projects", current: false },
  { name: "About", href: "/about", current: false },
];

export default function NavBar() {
  const { authed, logout } = {
    authed: true,
    logout: () => {},
  };
  const router = useRouter();

  const handleLogout = () => {
    logout().then(() => router.push("/"));
  };

  return (
    <nav>
      <ul>
        {navigation.map((link) => (
          <li key={link.href}>
            <Link to={link.href}>{link.name}</Link>
          </li>
        ))}
      </ul>
      {authed && <button onClick={handleLogout}>Logout</button>}
    </nav>
  );
}
