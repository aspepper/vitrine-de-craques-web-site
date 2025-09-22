import type { ReactNode } from "react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

type SummaryItem = {
  label: string;
  value: ReactNode;
};

type DefinitionItem = {
  term: string;
  description: string;
};

type DataCollectionSection = {
  title: string;
  items: string[];
};

type MatrixRow = {
  activity: string;
  purpose: string;
  data: string;
  legalBasis: string;
};

type ContactChannel = {
  label: string;
  value: ReactNode;
};

type DataMapRow = {
  category: string;
  examples: string;
  retention: string;
  access: string;
};

const summaryItems: SummaryItem[] = [
  {
    label: "Vigência",
    value: "31/08/2025",
  },
  {
    label: "Versão",
    value: "v1.0",
  },
  {
    label: "Controlador",
    value: "Vitrine de Craques Tecnologia Ltda., CNPJ em atualização, com sede em São Paulo/SP.",
  },
  {
    label: "Contato do Encarregado (DPO)",
    value: (
      <>
        Equipe de Privacidade Vitrine —
        <Link
          className="mx-1 text-emerald-600 underline-offset-4 hover:underline"
          href="mailto:privacidade@vitrinedecraques.com"
        >
          privacidade@vitrinedecraques.com
        </Link>
        —
        <Link
          className="ml-1 text-emerald-600 underline-offset-4 hover:underline"
          href="https://vitrinedecraques.com/privacidade"
          target="_blank"
          rel="noreferrer"
        >
          https://vitrinedecraques.com/privacidade
        </Link>
      </>
    ),
  },
];

const definitions: DefinitionItem[] = [
  {
    term: "Dados pessoais",
    description: "informação relacionada a pessoa natural identificada ou identificável.",
  },
  {
    term: "Dados sensíveis",
    description:
      "origem racial/étnica, convicção religiosa, opinião política, filiação a sindicato/organização, dado referente à saúde/vida sexual, dado genético/biométrico.",
  },
  {
    term: "Tratamento",
    description: "toda operação realizada com dados pessoais.",
  },
  {
    term: "Controlador",
    description: "pessoa jurídica que toma as decisões sobre o tratamento.",
  },
  {
    term: "Operador",
    description: "quem trata dados em nome do Controlador.",
  },
  {
    term: "Titular",
    description: "pessoa natural a quem se referem os dados pessoais.",
  },
];

const profiles = [
  "Conta Familiar (Responsável + Atleta menor de 18)",
  "Atleta 18+",
  "Jornalistas/Blogueiros",
  "Empresários/Agentes (devidamente licenciados)",
  "Clubes/Entidades Desportivas",
  "Torcedor/Fan Clube",
];

const dataCollection: DataCollectionSection[] = [
  {
    title: "4.1. Dados de cadastro",
    items: [
      "Nome, data de nascimento, país/UF, e-mail (verificado), telefone/WhatsApp (opcional), senha e fatores de autenticação.",
      "Responsável + Menor: documentos do responsável (RG/CNH/Passaporte), do menor (certidão/identidade), eventual termo de guarda/tutela.",
      "Atleta 18+: documento de identidade (RG/CNH/Passaporte), CPF, dados esportivos (opcionais).",
      "Jornalistas/Blogueiros: identificação e portfólio/links.",
      "Agentes/Empresários: identificação, CPF/CNPJ, licenças (FIFA/CBF ou local).",
      "Clubes: razão social, CNPJ, registro federativo, representante legal.",
      "Torcedor/Fan Clube: clube(s) favorito(s), preferências de notificação.",
    ],
  },
  {
    title: "4.2. Conteúdo do usuário (UGC)",
    items: [
      "Vídeos, fotos, comentários e metadados técnicos (data/hora, IP, dispositivo, versão do app, estatísticas de visualização).",
    ],
  },
  {
    title: "4.3. Dados técnicos e de uso",
    items: [
      "Endereço IP, identificadores de dispositivo, sistema operacional, navegador, logs de acesso, cookies/SDKs, telemetria de performance e eventos de navegação.",
      "Geolocalização aproximada é opcional (opt-in) e pode ser desativada.",
    ],
  },
  {
    title: "4.4. Verificações de integridade/segurança",
    items: [
      "Verificação por selfie do Responsável (quando aplicável) ou do usuário 18+ para prevenção a fraude/impersonação.",
      "Não retemos template biométrico salvo se informado e consentido de modo específico.",
    ],
  },
];

const matrixRows: MatrixRow[] = [
  {
    activity: "Cadastro e autenticação",
    purpose: "Criar e manter a conta, permitir login, prevenir abuso",
    data: "Cadastro, credenciais, logs",
    legalBasis: "Execução de contrato; legítimo interesse (segurança)",
  },
  {
    activity: "Conta Familiar (menor)",
    purpose: "Vincular menor ao responsável, gerir permissões e consentimentos",
    data: "Dados do responsável, do menor e documentos",
    legalBasis: "Melhor interesse do menor + consentimento destacado do responsável",
  },
  {
    activity: "Publicação de UGC (vídeos/fotos)",
    purpose: "Hospedar, exibir e distribuir o conteúdo dentro da Plataforma",
    data: "Conteúdo e metadados",
    legalBasis: "Execução de contrato; consentimento específico quando aplicável",
  },
  {
    activity: "Moderação e compliance",
    purpose: "Detectar e remover conteúdo ilícito/ofensivo; cumprir ordens legais",
    data: "Logs, indicadores de risco, decisões de moderação",
    legalBasis: "Obrigação legal; legítimo interesse (integridade do serviço)",
  },
  {
    activity: "Segurança/fraude",
    purpose: "Prevenir spam, bots, invasões, uso indevido",
    data: "IP, deviceID, eventos",
    legalBasis: "Legítimo interesse; obrigação legal",
  },
  {
    activity: "Notificações (push/e-mail/WhatsApp)",
    purpose: "Avisos de partidas, convites e novidades",
    data: "Contato, preferências, tokens push",
    legalBasis: "Consentimento (opt-in; opt-out a qualquer tempo)",
  },
  {
    activity: "Marketing institucional",
    purpose: "Divulgar funcionalidades e histórias da comunidade",
    data: "Nome/imagem (quando aplicável)",
    legalBasis: "Consentimento (opt-in; revogável)",
  },
  {
    activity: "Relatórios e melhoria",
    purpose: "Métricas agregadas e estatísticas de uso",
    data: "Telemetria, eventos, cliques",
    legalBasis: "Legítimo interesse (melhoria de produto)",
  },
  {
    activity: "Remuneração/Taxa de sucesso (Agentes/Clubes)",
    purpose: "Cumprir contratos e auditoria de origem",
    data: "Logs de contato/negociação",
    legalBasis: "Execução de contrato; legítimo interesse",
  },
];

const childSafetyPoints = [
  "Conta Familiar obrigatória: cadastro e gestão pelo Responsável legal.",
  "Consentimento específico e em destaque para publicar imagem/voz do menor, por upload e/ou global.",
  "Minimização: evitar dados que exponham escola, endereço e rotinas; disponibilizamos ferramentas de desfoque quando aplicável.",
  "Contato com menores: sempre por meio do Responsável; vedamos contato direto por terceiros.",
  "Direitos: o Responsável pode revogar consentimentos e solicitar exclusões relacionadas ao menor.",
  "Perfilamento: não realizamos perfilhamento comportamental de crianças para fins de publicidade.",
];

const sharingPoints = [
  "Operadores (hospedagem, CDN, e-mail/SMS/push, antifraude, analytics, verificação documental) sob contratos de confidencialidade e segurança.",
  "Parceiros (Clubes/Agentes/Jornalistas) apenas com consentimento do titular/responsável e finalidade específica (ex.: convite para avaliação).",
  "Autoridades para cumprimento de obrigação legal/ordem judicial e para reporte de indícios de exploração/risco a menores.",
  "Não comercializamos dados pessoais.",
];

const securityPoints = [
  "Controles técnicos e administrativos proporcionais ao risco: criptografia em trânsito e, quando possível, em repouso; controle de acesso; segregação de ambientes; registros de eventos.",
  "Testes e auditorias periódicas; plano de resposta a incidentes.",
  "Em incidente relevante, avaliamos notificação aos titulares e à autoridade competente, conforme requisitos legais.",
];

const retentionPoints = [
  "Mantemos os dados pelo tempo necessário às finalidades desta Política e para cumprimento de obrigações legais/regulatórias e exercício regular de direitos.",
  "Ao término, eliminamos ou anonimizamos os dados, observando prazos específicos (ex.: logs de acesso à aplicação guardados pelo tempo mínimo aplicável e conforme ordens específicas).",
  "Você pode solicitar eliminação, quando aplicável, na Seção 12.",
];

const rightsParagraphs: ReactNode[] = [
  "Você pode exercer, nos termos da LGPD: confirmação, acesso, correção, portabilidade, eliminação, anonimização/bloqueio, informação sobre compartilhamento, revogação de consentimento e revisão de decisões automatizadas.",
  (
    <>
      Para exercer, utilize o canal
      <Link
        className="mx-1 text-emerald-600 underline-offset-4 hover:underline"
        href="https://vitrinedecraques.com/privacidade"
        target="_blank"
        rel="noreferrer"
      >
        https://vitrinedecraques.com/privacidade
      </Link>
      ou contate o DPO pelo e-mail
      <Link
        className="mx-1 text-emerald-600 underline-offset-4 hover:underline"
        href="mailto:privacidade@vitrinedecraques.com"
      >
        privacidade@vitrinedecraques.com
      </Link>
      . Responderemos em prazo razoável e, quando necessário, solicitaremos comprovação de identidade.
    </>
  ),
];

const automatedParagraphs = [
  "Utilizamos sistemas automatizados para priorizar moderação e detectar riscos (spam, abuso, exposição indevida de menores).",
  "Sempre que houver impacto relevante, disponibilizamos revisão humana mediante solicitação.",
];

const logParagraphs = [
  "Mantemos registros de acesso à aplicação e eventos de segurança, sob sigilo, em ambiente controlado e seguro, pelo prazo mínimo aplicável.",
  "Autoridades podem requerer guarda estendida por tempo certo, mediante procedimento legal.",
];

const contactChannels: ContactChannel[] = [
  {
    label: "Privacidade/DPO",
    value: (
      <>
        <Link
          className="text-emerald-600 underline-offset-4 hover:underline"
          href="mailto:privacidade@vitrinedecraques.com"
        >
          privacidade@vitrinedecraques.com
        </Link>
        {" — "}
        <Link
          className="text-emerald-600 underline-offset-4 hover:underline"
          href="https://vitrinedecraques.com/privacidade"
          target="_blank"
          rel="noreferrer"
        >
          https://vitrinedecraques.com/privacidade
        </Link>
      </>
    ),
  },
  {
    label: "Denúncias/Abusos",
    value: (
      <>
        <Link className="text-emerald-600 underline-offset-4 hover:underline" href="mailto:abuso@vitrinedecraques.com">
          abuso@vitrinedecraques.com
        </Link>
        {" — "}
        <Link
          className="text-emerald-600 underline-offset-4 hover:underline"
          href="https://vitrinedecraques.com/denuncias"
          target="_blank"
          rel="noreferrer"
        >
          https://vitrinedecraques.com/denuncias
        </Link>
        <span className="block text-xs text-slate-500">
          Conteúdos envolvendo risco a menores têm prioridade absoluta.
        </span>
      </>
    ),
  },
  {
    label: "Atendimento",
    value: (
      <Link className="text-emerald-600 underline-offset-4 hover:underline" href="mailto:contato@vitrinedecraques.com">
        contato@vitrinedecraques.com
      </Link>
    ),
  },
];

const changeParagraphs = [
  "Sempre que houver alterações materiais (novas finalidades, novos compartilhamentos, mudanças de base legal), comunicaremos de forma destacada e, quando exigido, solicitaremos reconsentimento.",
  "Manteremos o histórico de versões e a data de vigência.",
];

const finalParagraphs = [
  "A presente Política é regida pela legislação brasileira. Em caso de conflito interpretativo, prevalecerá a versão em português.",
  "O foro competente será o de São Paulo/SP, sem prejuízo das garantias legais protetivas de crianças e adolescentes.",
];

const dataMapRows: DataMapRow[] = [
  {
    category: "Cadastro",
    examples: "Nome, e-mail, país/UF, data de nascimento",
    retention: "Enquanto durar a conta + prazo legal",
    access: "Suporte/Segurança (mínimo necessário)",
  },
  {
    category: "Documentos (KYC)",
    examples: "RG/CNH/Passaporte (responsável/18+), certidão do menor",
    retention: "Durante a verificação + prazo legal de auditoria",
    access: "Equipe de verificação (restrito)",
  },
  {
    category: "Conteúdo (UGC)",
    examples: "Vídeos/fotos, comentários, metadados",
    retention: "Enquanto publicado + prazos de remoção",
    access: "Moderação/Produto",
  },
  {
    category: "Logs de acesso",
    examples: "IP, timestamps, device",
    retention: "Prazo mínimo aplicável e/ou por ordem",
    access: "Segurança/Compliance",
  },
  {
    category: "Notificações",
    examples: "Tokens push, preferências",
    retention: "Enquanto ativo o opt-in",
    access: "Produto/Suporte",
  },
];

export default function PrivacidadePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <header className="space-y-4">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Legal
            </span>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              Política de Privacidade — LGPD
            </h1>
            <p className="max-w-3xl text-lg text-slate-600">
              Esta Política explica como tratamos dados pessoais na Vitrine de Craques, em conformidade com a Lei Geral de
              Proteção de Dados Pessoais (Lei 13.709/2018) e normas correlatas. Ao usar nossos serviços, você declara que leu
              e compreendeu esta Política.
            </p>
          </header>

          <Card className="rounded-3xl border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
            <CardContent className="grid gap-6 p-8 sm:grid-cols-2 sm:p-10">
              {summaryItems.map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
                    {item.label}
                  </p>
                  <p className="text-sm text-slate-600">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <section className="space-y-8">
            <article className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">1) Âmbito, Bases Legais e Princípios</h2>
              <div className="space-y-4 text-slate-600">
                <p>
                  Aplicamos os princípios da LGPD (finalidade, adequação, necessidade, livre acesso, qualidade, transparência,
                  segurança, prevenção, não discriminação e responsabilização).
                </p>
                <p>
                  As bases legais são indicadas por atividade (Seção 6). Em todas as hipóteses envolvendo crianças e adolescentes,
                  o tratamento observa o melhor interesse do titular e consentimento específico e em destaque do responsável,
                  quando aplicável (Seção 7).
                </p>
              </div>
            </article>

            <article className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">2) Definições Essenciais</h2>
              <dl className="grid gap-4 text-slate-600 sm:grid-cols-2">
                {definitions.map((definition) => (
                  <div key={definition.term}>
                    <dt className="font-semibold text-slate-800">{definition.term}</dt>
                    <dd className="text-sm text-slate-600">{definition.description}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">3) Quem usa nossa Plataforma (Perfis)</h2>
              <ul className="grid gap-3 rounded-3xl bg-white p-6 text-slate-600 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.45)] sm:grid-cols-2">
                {profiles.map((profile) => (
                  <li key={profile} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                    <span>{profile}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-slate-600">
                Cada perfil tem finalidades específicas, mas todos se submetem a esta Política (ver Seção 6 para a matriz de
                finalidades/bases).
              </p>
            </article>

            <article className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">4) Dados que Coletamos</h2>
              <div className="space-y-6">
                {dataCollection.map((section) => (
                  <div key={section.title} className="space-y-3 rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.45)]">
                    <h3 className="text-base font-semibold text-slate-800">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 inline-block h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>

            <article className="space-y-4 text-slate-600">
              <h2 className="text-2xl font-semibold text-slate-900">5) Cookies e Tecnologias Semelhantes</h2>
              <p>
                Utilizamos cookies/SDKs para autenticação, personalização de conteúdo, métricas e prevenção a abuso. Você pode
                gerenciar preferências no banner/centro de privacidade e nas configurações do navegador.
              </p>
              <p>Cookies estritamente necessários são essenciais à prestação do serviço.</p>
            </article>

            <article className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">6) Finalidades e Bases Legais (Matriz)</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Atividade — Finalidade — Categoria de dados — Base legal
                </p>
              </div>
              <div className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_48px_-36px_rgba(15,23,42,0.45)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Atividade</th>
                        <th className="px-6 py-4 font-semibold">Finalidade</th>
                        <th className="px-6 py-4 font-semibold">Categoria de dados</th>
                        <th className="px-6 py-4 font-semibold">Base legal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {matrixRows.map((row) => (
                        <tr key={row.activity} className="align-top">
                          <td className="px-6 py-4 font-medium text-slate-800">{row.activity}</td>
                          <td className="px-6 py-4">{row.purpose}</td>
                          <td className="px-6 py-4">{row.data}</td>
                          <td className="px-6 py-4">{row.legalBasis}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-800" colSpan={4}>
                          Poderemos utilizar outras bases legais permitidas pela LGPD quando necessárias e proporcionais (ex.:
                          exercício regular de direitos em processos; proteção da vida/segurança; crédito, quando aplicável).
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">7) Crianças e Adolescentes</h2>
              <ul className="space-y-2 rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.45)]">
                {childSafetyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">8) Compartilhamento com Terceiros</h2>
              <ul className="space-y-2 text-sm text-slate-600">
                {sharingPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="space-y-4 text-slate-600">
              <h2 className="text-2xl font-semibold text-slate-900">9) Transferências Internacionais</h2>
              <p>
                Podemos transferir dados para provedores no exterior. Nesses casos, adotamos mecanismos de transferência
                internacional previstos em lei (cláusulas contratuais padrão, garantias adequadas, ou decisões de adequação),
                assegurando que os destinatários observem padrões compatíveis de proteção.
              </p>
            </article>

            <article className="space-y-4 text-slate-600">
              <h2 className="text-2xl font-semibold text-slate-900">10) Segurança da Informação</h2>
              <ul className="space-y-2">
                {securityPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="space-y-4 text-slate-600">
              <h2 className="text-2xl font-semibold text-slate-900">11) Retenção e Eliminação</h2>
              <ul className="space-y-2">
                {retentionPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-slate-300" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="space-y-4 text-slate-600">
              <h2 className="text-2xl font-semibold text-slate-900">12) Direitos do Titular</h2>
              {rightsParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </article>

            <article className="space-y-4 text-slate-600">
              <h2 className="text-2xl font-semibold text-slate-900">13) Decisões Automatizadas e Moderação</h2>
              {automatedParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>

            <article className="space-y-4 text-slate-600">
              <h2 className="text-2xl font-semibold text-slate-900">14) Registros e Logs</h2>
              {logParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">15) Canais de Comunicação</h2>
              <ul className="space-y-3 text-sm text-slate-600">
                {contactChannels.map((channel) => (
                  <li key={channel.label} className="rounded-2xl bg-white p-4 shadow-[0_12px_32px_-28px_rgba(15,23,42,0.45)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">{channel.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{channel.value}</p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="space-y-4 text-slate-600">
              <h2 className="text-2xl font-semibold text-slate-900">16) Alterações desta Política</h2>
              {changeParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>

            <article className="space-y-4 text-slate-600">
              <h2 className="text-2xl font-semibold text-slate-900">17) Disposições Finais</h2>
              {finalParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>

            <article className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Anexo — Mapa de Dados (exemplo simplificado)</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Categoria — Exemplos — Retenção indicativa — Acesso interno
                </p>
              </div>
              <div className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_48px_-36px_rgba(15,23,42,0.45)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Categoria</th>
                        <th className="px-6 py-4 font-semibold">Exemplos</th>
                        <th className="px-6 py-4 font-semibold">Retenção indicativa</th>
                        <th className="px-6 py-4 font-semibold">Acesso interno</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {dataMapRows.map((row) => (
                        <tr key={row.category} className="align-top">
                          <td className="px-6 py-4 font-medium text-slate-800">{row.category}</td>
                          <td className="px-6 py-4">{row.examples}</td>
                          <td className="px-6 py-4">{row.retention}</td>
                          <td className="px-6 py-4">{row.access}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Esta é uma política geral. Alguns fluxos (ex.: Conta Familiar, Agentes/Clubes) possuem telas de consentimento e
                termos específicos complementares, que prevalecem no respectivo contexto. Documento vivo — requer revisão
                jurídica antes da publicação pública.
              </p>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
