import { AppShell } from "@/components/rep-assist/app-shell";
import { RepAssistDashboard } from "@/components/rep-assist/rep-assist-dashboard";

export default function Home() {
  return (
    <AppShell>
      <RepAssistDashboard />
    </AppShell>
  );
}
