/// <reference lib="dom" />

const API_URL = "http://localhost:3000/api";
const APP_ORIGIN = "http://localhost:8888";

interface AuthResponse {
  accessToken: string;
  user?: {
    id: string;
    username?: string;
    email?: string;
    phone?: string;
    role: string;
    appId: string;
  };
}

class AuthClient {
  private accessToken: string = "";
  private outputDiv: HTMLDivElement;
  private startTime: number = 0;
  private measurements: { [key: string]: number } = {};

  constructor(private apiUrl: string, private origin: string) {
    this.outputDiv = document.getElementById("output") as HTMLDivElement;
  }

  private startMeasurement(operation: string) {
    this.startTime = performance.now();
    this.log(`Inizio ${operation}...`);
  }

  private endMeasurement(operation: string) {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    this.measurements[operation] = duration;
    this.log(`${operation} completato in ${duration.toFixed(2)}ms`);
  }

  public getMeasurements(): { [key: string]: number } {
    return this.measurements;
  }

  public log(message: string, isError: boolean = false) {
    const p = document.createElement("p");
    p.textContent = message;
    p.style.color = isError ? "red" : "green";
    this.outputDiv.appendChild(p);
    console.log(message);
  }

  private async makeRequest(
    endpoint: string,
    options: any = {}
  ): Promise<Response> {
    const headers = {
      "Content-Type": "application/json",
      Origin: this.origin,
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
    };

    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });

      if (response.status === 401) {
        this.log("Token scaduto, tentativo di refresh...");

        const refreshResponse = await this.refreshTokens();
        if (refreshResponse) {
          return this.makeRequest(endpoint, options);
        }
      }

      return response;
    } catch (error) {
      this.log(`Errore nella richiesta: ${error}`, true);
      throw error;
    }
  }

  private async refreshTokens(): Promise<boolean> {
    this.startMeasurement("Refresh");
    try {
      const headers = {
        "Content-Type": "application/json",
        Origin: this.origin,
      };

      const response = await fetch(`${this.apiUrl}/auth/refresh`, {
        method: "POST",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const data = (await response.json()) as { accessToken: string };
        if (data.accessToken) {
          this.accessToken = data.accessToken;
          this.log("Token refresh completato con successo");
          this.endMeasurement("Refresh");
          return true;
        }
      }

      this.log("Errore nel refresh dei token", true);
      this.endMeasurement("Refresh");
      return false;
    } catch (error) {
      this.log(`Errore nel refresh dei token: ${error}`, true);
      this.endMeasurement("Refresh");
      return false;
    }
  }

  async signup(email: string, password: string): Promise<boolean> {
    this.startMeasurement("Signup");
    try {
      const response = await fetch(`${this.apiUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: this.origin,
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = (await response.json()) as AuthResponse;
        this.accessToken = data.accessToken;
        this.log("Registrazione completata con successo");
        this.endMeasurement("Signup");
        return true;
      }

      const error = await response.json();
      this.log(
        `Errore durante la registrazione: ${JSON.stringify(error)}`,
        true
      );
      this.endMeasurement("Signup");
      return false;
    } catch (error) {
      this.log(`Errore CATCH durante la registrazione: ${error}`, true);
      this.endMeasurement("Signup");
      return false;
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    this.startMeasurement("Login");
    try {
      const headers = {
        "Content-Type": "application/json",
        Origin: this.origin,
      };

      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = (await response.json()) as AuthResponse;
        this.accessToken = data.accessToken;
        this.log("Login completato con successo");
        this.endMeasurement("Login");
        return true;
      }

      const error = await response.json();
      this.log(`Errore durante il login: ${JSON.stringify(error)}`, true);
      this.endMeasurement("Login");
      return false;
    } catch (error) {
      this.log(`Errore CATCH durante il login: ${error}`, true);
      this.endMeasurement("Login");
      return false;
    }
  }

  async logout(): Promise<boolean> {
    this.startMeasurement("Logout");
    try {
      const response = await this.makeRequest("/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        this.accessToken = "";
        this.log("Logout completato con successo");
        this.endMeasurement("Logout");
        return true;
      }

      let errorMessage = "Errore durante il logout";
      try {
        const error = await response.json();
        errorMessage = `Errore durante il logout: ${JSON.stringify(error)}`;
      } catch {
        errorMessage = `Errore durante il logout: ${response.status} ${response.statusText}`;
      }
      this.log(errorMessage, true);
      this.endMeasurement("Logout");
      return false;
    } catch (error) {
      this.log(`Errore CATCH durante il logout: ${error}`, true);
      this.endMeasurement("Logout");
      return false;
    }
  }

  async testProtectedEndpoint(): Promise<void> {
    this.startMeasurement("Protected Endpoint");
    try {
      const response = await this.makeRequest("/protected");
      const data = await response.json();
      this.log(`Risposta endpoint protetto: ${JSON.stringify(data)}`);
      this.endMeasurement("Protected Endpoint");
    } catch (error) {
      this.log(`Errore durante il test dell'endpoint protetto: ${error}`, true);
      this.endMeasurement("Protected Endpoint");
    }
  }
}

// Funzione per eseguire i test
async function runTest() {
  const client = new AuthClient(API_URL, APP_ORIGIN);
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = "password123";

  client.log("\n=== Test di registrazione ===");
  const signupSuccess = await client.signup(testEmail, testPassword);
  if (!signupSuccess) {
    client.log("Test di registrazione fallito", true);
    return;
  }

  client.log("\n=== Test di logout ===");
  const logoutSuccess = await client.logout();
  if (!logoutSuccess) {
    client.log("Test di logout fallito", true);
    return;
  }

  client.log("\n=== Test di login ===");
  const loginSuccess = await client.login(testEmail, testPassword);
  if (!loginSuccess) {
    client.log("Test di login fallito", true);
    return;
  }

  client.log("\n=== Test endpoint protetto ===");
  await client.testProtectedEndpoint();

  // Test del refresh automatico
  client.log("\n=== Test refresh automatico ===");
  // Forza la scadenza del token impostando una data di scadenza passata
  client["accessToken"] =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJleHAiOjE2MTYxNjQ4MDB9.invalid_signature";

  await client.testProtectedEndpoint();

  // Mostra i risultati delle misurazioni
  client.log("\n=== Risultati delle misurazioni ===");
  const measurements = client.getMeasurements();
  Object.entries(measurements).forEach(([operation, duration]) => {
    client.log(`${operation}: ${duration.toFixed(2)}ms`);
  });
}

// Esegui i test quando il documento è caricato
document.addEventListener("DOMContentLoaded", () => {
  runTest().catch((error) => {
    const outputDiv = document.getElementById("output") as HTMLDivElement;
    const p = document.createElement("p");
    p.textContent = `Errore generale: ${error}`;
    p.style.color = "red";
    outputDiv.appendChild(p);
  });
});
