import { Navigate, useLocation } from "react-router-dom";

// Component pentru a proteja rutele de admin

const AdminRoute = ({ user, children }) => {
  const location = useLocation();

  // Verifică dacă utilizatorul este autentificat
  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(
          location.pathname
        )}&message=${encodeURIComponent(
          "Please log in to access this page"
        )}`}
        replace
      />
    );
  }

  // Verifică dacă utilizatorul are rol de administrator
  if (!user.roles || !user.roles.includes("ADMIN")) {
    return (
      <Navigate
        to={`/?message=${encodeURIComponent(
          "You do not have permission to access this page"
        )}`}
        replace
      />
    );
  }

  // Dacă utilizatorul este autentificat și are rol de admin, afișează conținutul
  return children;
};

export default AdminRoute; 