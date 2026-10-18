import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext.jsx";
import AyushModeSelector from "../components/ayush/AyushModeSelector.jsx";

export default function ConsultationType() {
  const navigate = useNavigate();
  const { consent, patient, setConsultationType } = useSession();

  // Guard: same pattern as every other built step.
  useEffect(() => {
    if (consent.given !== true) navigate("/consent", { replace: true });
    else if (!patient.name) navigate("/details", { replace: true });
  }, [consent, patient, navigate]);

  const handleSelect = (type) => {
    setConsultationType(type);
    navigate(type === "ayush" ? "/ayush" : "/history");
  };

  return <AyushModeSelector onSelect={handleSelect} />;
}
