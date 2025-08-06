import React, { useState } from "react";
import { useUserStore } from "./stores/userStore";
import { Auth } from "./components/Auth";
import { Chat } from "./components/Chat";

const App: React.FC = () => {
  const { user } = useUserStore();
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    "employee-onboarding",
  );

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  if (!user) {
    return <Auth />;
  }

  return (
    <Chat serviceId={selectedServiceId} onServiceSelect={handleServiceSelect} />
  );
};

export default App;
