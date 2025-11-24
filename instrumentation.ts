import { logError } from "@/lib/error";

const listenersRegisteredSymbol = Symbol.for(
  "vitrine-de-craques:telemetry-listeners-registered",
);

type GlobalWithFlag = typeof globalThis & {
  [listenersRegisteredSymbol]?: boolean;
};

const globalWithFlag = globalThis as GlobalWithFlag;

export async function register() {
  if (globalWithFlag[listenersRegisteredSymbol]) return;
  globalWithFlag[listenersRegisteredSymbol] = true;

  const logUnhandled = (error: unknown, origin: string) => {
    logError(error, "UNHANDLED_PROCESS_ERROR", { origin }).catch((logError) => {
      console.error("Falha ao registrar erro não tratado:", logError);
    });
  };

  process.on("unhandledRejection", (reason) => {
    logUnhandled(reason, "unhandledRejection");
  });

  process.on("uncaughtException", (error) => {
    logUnhandled(error, "uncaughtException");
  });
}
