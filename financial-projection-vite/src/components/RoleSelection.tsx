// components/RoleSelection.tsx
import { useNavigate } from "react-router-dom";

interface RoleSelectionProps {
  setIsManager: (val: boolean) => void;
}

export default function RoleSelection({ setIsManager }: RoleSelectionProps) {
  const navigate = useNavigate();

  const handleSelect = (role: "manager" | "investor") => {
    setIsManager(role === "manager");
    navigate("/dashboard"); // redirect after choosing
  };

  return (
    <div className="role-selection flex flex-col items-center justify-center h-screen">
      <h2 className="mb-6 text-xl">Choose your role</h2>
      <div className="space-x-4">
        <button className="btn btn-primary" onClick={() => handleSelect("manager")}>
          Manager
        </button>
        <button className="btn btn-secondary" onClick={() => handleSelect("investor")}>
          Investor
        </button>
      </div>
    </div>
  );
}
