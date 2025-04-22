import useSocket from "@/hooks/useSocket";

interface Props {
  userId: string;
}

const AdminNotifications: React.FC<Props> = ({ userId }) => {
  const { notifications } = useSocket(userId, "admin");

  return (
    <div>
      <h3>Admin Notifications</h3>
      {notifications.length === 0 && <p>No new notifications</p>}
      <ul>
        {notifications.map((notif, index) => (
          <li key={index}>{notif.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminNotifications;
