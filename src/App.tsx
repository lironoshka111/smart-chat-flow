import { useUserStore } from "./stores/userStore";
import { useChatStore } from "./stores/chatStore";
import { Auth } from "./components/Auth";
import { Chat } from "./components/Chat";

const App = () => {
  const { user } = useUserStore();
  const { currentServiceId, setCurrentServiceId } = useChatStore();

  const handleServiceSelect = (serviceId: string) => {
    setCurrentServiceId(serviceId);
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <Chat serviceId={currentServiceId} onServiceSelect={handleServiceSelect} />
  );
};

export default App;
