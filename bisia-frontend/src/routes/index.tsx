import { createFileRoute, useNavigate } from "@tanstack/react-router";
import MessageInfo from "@/components/forms/MessageInfo";
import { useAuthStore } from "@/stores/AuthStore";
import { usePasswordless } from "@/hooks/usePasswordless";
import { useRef, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: BisiacariaAuth,
});

function BisiacariaAuth() {
  const phoneRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isSigningIn, formPasswordless, formOtp, confirmOtp } = usePasswordless();

  // Redirect to protected home when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/home" });
    }
  }, [isAuthenticated, navigate]);



  return (
    <div className="min-h-screen bg-yellow-400 dark:bg-black transition-colors duration-300 font-['Montserrat'] flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Header fuori dalla card */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-yellow-400 mb-2">
            Bisiacaria.com
          </h1>
          <p className="text-base sm:text-lg text-black dark:text-white font-medium">
            Il social network dei bisiachi
          </p>
        </div>
        
        <div className="bg-white dark:bg-stone-900 rounded-lg shadow-xl border-2 border-black dark:border-yellow-400 p-6 sm:p-8">
          <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirmOtp) {
                      formOtp.handleSubmit();
                    } else {
                      formPasswordless.handleSubmit();
                    }
                  }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-black dark:text-yellow-400 mb-2">
                      {confirmOtp ? "Verifica il codice" : "Accedi o registrati"}
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                      {confirmOtp 
                        ? "Inserisci il codice di verifica ricevuto"
                        : "Inserisci i tuoi dati per continuare"
                      }
                    </p>
                  </div>

                  {confirmOtp ? (
                    /* OTP Verification Form */
                    <>
                      <formOtp.AppField name="otp">
                        {(field: any) => (
                          <field.OtpField
                            label="Codice di verifica"
                            onOtpComplete={() => formOtp.handleSubmit()}
                          />
                        )}
                      </formOtp.AppField>
                      
                      <formOtp.AppForm>
                        <formOtp.SubscribeButton
                          label={isSigningIn ? "Verificando..." : "Verifica"}
                          disabled={isSigningIn}
                        />
                      </formOtp.AppForm>
                    </>
                  ) : (
                    /* Initial Signup/Login Form */
                    <>
                      <formPasswordless.AppField name="username">
                        {(field: any) => (
                          <field.TextField
                            label="Nickname"
                            placeholder="Il tuo nickname"
                          />
                        )}
                      </formPasswordless.AppField>

                      <formPasswordless.AppField name="phone">
                        {(field: any) => (
                          <field.TextField
                            label="Numero di telefono"
                            inputType="tel"
                            placeholder="+391234567890"
                            ref={phoneRef}
                            onFocus={() => {
                              if (phoneRef.current && phoneRef.current.value === "") {
                                phoneRef.current.value = "+39";
                              }
                            }}
                          />
                        )}
                      </formPasswordless.AppField>

                      <formPasswordless.AppForm>
                        <formPasswordless.SubscribeButton
                          label={isSigningIn ? "Accedendo..." : "Continua"}
                          disabled={isSigningIn}
                          id="signup-button"
                        />
                      </formPasswordless.AppForm>
                    </>
                  )}

            {/* Message Info */}
            <div className="mt-4">
              <MessageInfo />
            </div>
          </form>
          
          {/* Footer minimalista */}
          <div className="text-center mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
            <div className="text-xs text-stone-500 dark:text-stone-400 space-x-4">
              <a href="#" className="hover:underline">Termini</a>
              <a href="#" className="hover:underline">Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
