import { useBackendWarmup } from "../../hooks/useBackendWarmup";

const BackendStatus = () => {
  const status = useBackendWarmup();

  if (status === "warming") {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500/90 backdrop-blur-sm text-black text-sm font-semibold text-center py-2 px-4 flex items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent shrink-0" />
        Server is waking up from sleep — games will be ready in ~30 seconds. Please wait...
      </div>
    );
  }

  return null;
};

export default BackendStatus;
