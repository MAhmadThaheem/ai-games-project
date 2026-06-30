import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useBackendWarmup = () => {
  const [status, setStatus] = useState("idle"); // idle | warming | ready | error

  useEffect(() => {
    let timer;
    let cancelled = false;

    const ping = async () => {
      // Show warming banner only if takes more than 2s
      timer = setTimeout(() => {
        if (!cancelled) setStatus("warming");
      }, 2000);

      try {
        await axios.get(`${API_BASE_URL}/health`, { timeout: 60000 });
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      } finally {
        clearTimeout(timer);
      }
    };

    ping();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return status;
};
