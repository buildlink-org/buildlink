import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DataSaverProvider } from "@/contexts/DataSaverContext";
import AppRoutes from "./AppRoutes";


const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: (failureCount, error) => {
			// Retry fewer times on slow connections
			const maxRetries = navigator.onLine ? 3 : 1;
			return failureCount < maxRetries;
		},
		refetchOnWindowFocus: false, // Reduce unnecessary requests
		},
	},
});

const App = () => (
	<QueryClientProvider client={queryClient}>
		<ThemeProvider>
			<AuthProvider>
				<DataSaverProvider>
					<TooltipProvider>
						<Toaster />
						<Sonner />
					<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
						<AppRoutes />
					</BrowserRouter>
					</TooltipProvider>
				</DataSaverProvider>
			</AuthProvider>
		</ThemeProvider>
	</QueryClientProvider>
)

export default App;