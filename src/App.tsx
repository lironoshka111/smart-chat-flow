import React, { useState, useEffect } from "react";
import { useUserStore } from "./stores/userStore";
import { Auth } from "./components/Auth";
import { ServiceSelection } from "./components/ServiceSelection";
import { Chat } from "./components/Chat";

const App: React.FC = () => {
  const { user } = useUserStore();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    if (!user) setSelectedService(null);
  }, [user]);

  if (!user) return <Auth />;
  if (!selectedService)
    return <ServiceSelection onSelect={setSelectedService} />;
  return <Chat serviceId={selectedService} />;
};

export default App;
