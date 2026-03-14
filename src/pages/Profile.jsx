import { useAuth } from "../Context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Perfil de usuario</h1>
      <p><b>Nombre:</b> {user?.first_name}</p>
      <p><b>Email:</b> {user?.email}</p>
      <p><b>Rol:</b> {user?.role}</p>
    </div>
  );
};

export default Profile;