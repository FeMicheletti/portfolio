import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PrivacyControls } from "@/components/public/privacy-controls";

export const metadata: Metadata = {
  title: "Privacidade e Analytics",
  description: "Como o portfólio coleta e protege dados anônimos de navegação.",
};

export default function PrivacyPage() {
  return (
    <main className="dark min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
        <div className="mt-12 flex items-center gap-3 text-violet-300">
          <ShieldCheck className="size-6" />
          <span className="font-medium">Privacidade</span>
        </div>
        <h1 className="mt-5 text-4xl font-semibold">
          Analytics simples e anônimo
        </h1>
        <p className="mt-5 leading-7 text-zinc-400">
          Este portfólio mede visitas e interações para entender quais projetos
          despertam mais interesse. Não são usados cookies publicitários e
          nenhum endereço IP é armazenado.
        </p>
        <div className="mt-10 space-y-8 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8">
          <section>
            <h2 className="text-lg font-semibold">Dados coletados</h2>
            <p className="mt-3 leading-7 text-zinc-400">
              Identificadores aleatórios de visitante e sessão, páginas
              visitadas, idioma, dispositivo, origem da visita, parâmetros UTM e
              cliques em currículo, contatos, demos e repositórios.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Finalidade e retenção</h2>
            <p className="mt-3 leading-7 text-zinc-400">
              Os dados são usados somente para métricas agregadas deste
              portfólio e são removidos automaticamente após 180 dias. Não são
              vendidos nem compartilhados para publicidade.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Sua escolha</h2>
            <p className="mt-3 mb-5 leading-7 text-zinc-400">
              Você pode desativar a coleta neste navegador. Ao desativar, os
              identificadores locais existentes são apagados imediatamente.
            </p>
            <PrivacyControls />
          </section>
        </div>
      </div>
    </main>
  );
}
