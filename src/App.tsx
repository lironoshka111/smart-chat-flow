import { useUserStore } from "./stores/userStore";
import { Auth } from "./components/Auth";
import { Chat } from "./components/Chat";

const App = () => {
  const { user } = useUserStore();

  if (!user) {
    return <Auth />;
  }

  return <Chat />;
};

export default App;
