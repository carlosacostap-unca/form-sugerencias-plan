"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function GraciasContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const docente = sp.get("docente") || "";
  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <section className="rounded-2xl bg-green-600 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">¡Gracias por enviar tus propuestas!</h1>
          {docente && <p className="mt-2 text-sm">Enviado por: {docente}</p>}
        </section>
        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <p className="text-sm">Hemos recibido tus propuestas correctamente.</p>
          <button
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() => {
              router.push("/?reset=1");
            }}
          >
            Enviar nuevas propuestas
          </button>
        </section>
      </div>
    </div>
  );
}

export default function GraciasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-zinc-100">
          <div className="mx-auto max-w-3xl px-4 py-10">
            <section className="rounded-2xl bg-green-600 p-8 text-white shadow">
              <h1 className="text-2xl font-semibold">¡Gracias!</h1>
            </section>
          </div>
        </div>
      }
    >
      <GraciasContent />
    </Suspense>
  );
}