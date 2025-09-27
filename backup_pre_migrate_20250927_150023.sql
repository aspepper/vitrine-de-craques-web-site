--
-- PostgreSQL database dump
--

\restrict pndV2fXfaVlT4wvc0fOByadYtitYjvhaH6Uq2ZnpLCKf5sr3kK64LUlTdJb7eLq

-- Dumped from database version 17.5 (84bec44)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."Role" AS ENUM (
    'ATLETA',
    'AGENTE',
    'CLUBE',
    'TORCEDOR',
    'IMPRENSA',
    'RESPONSAVEL'
);


ALTER TYPE public."Role" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO neondb_owner;

--
-- Name: Club; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Club" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "confederationId" text
);


ALTER TABLE public."Club" OWNER TO neondb_owner;

--
-- Name: Confederation; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Confederation" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "logoUrl" text,
    "foundedAt" timestamp(3) without time zone,
    purpose text,
    "currentPresident" text,
    "officialStatement" text,
    "officialStatementDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Confederation" OWNER TO neondb_owner;

--
-- Name: Game; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Game" (
    id text NOT NULL,
    slug text NOT NULL,
    title text,
    category text,
    excerpt text,
    content text,
    "coverImage" text,
    "authorId" text,
    date timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Game" OWNER TO neondb_owner;

--
-- Name: News; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."News" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text,
    category text,
    "coverImage" text,
    "publishedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authorId" text,
    "likesCount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."News" OWNER TO neondb_owner;

--
-- Name: Profile; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Profile" (
    id text NOT NULL,
    "displayName" text,
    "avatarUrl" text,
    bio text,
    role public."Role" NOT NULL,
    data jsonb,
    cpf text,
    rg text,
    cep text,
    nascimento text,
    genero text,
    telefone text,
    ddd text,
    site text,
    endereco text,
    "redesSociais" text,
    "areaAtuacao" text,
    portfolio text,
    posicao text,
    perna text,
    altura text,
    peso text,
    pais text,
    uf text,
    clube text,
    "nomeFantasia" text,
    "emailClube" text,
    cidade text,
    cnpj text,
    "inscricaoEstadual" text,
    "representanteNome" text,
    "representanteCpf" text,
    "representanteEmail" text,
    whatsapp text,
    "registroCbf" text,
    "registroFifa" text,
    "responsavelNascimento" text,
    "responsavelGenero" text,
    "responsavelInstagram" text,
    "atletaNome" text,
    "atletaCpf" text,
    "atletaNascimento" text,
    "atletaGenero" text,
    "atletaEsporte" text,
    "atletaModalidade" text,
    "atletaObservacoes" text,
    "notifNovidades" boolean DEFAULT false,
    "notifJogos" boolean DEFAULT false,
    "notifEventos" boolean DEFAULT false,
    "notifAtletas" boolean DEFAULT false,
    termos boolean DEFAULT false,
    "lgpdWhatsappNoticias" boolean DEFAULT false,
    "lgpdWhatsappConvites" boolean DEFAULT false,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Profile" OWNER TO neondb_owner;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO neondb_owner;

--
-- Name: Times; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Times" (
    id text NOT NULL,
    divisao text NOT NULL,
    clube text NOT NULL,
    slug text NOT NULL,
    sigla text NOT NULL,
    apelido text NOT NULL,
    mascote text NOT NULL,
    fundacao integer,
    "maiorIdolo" text NOT NULL,
    cidade text NOT NULL,
    estado text NOT NULL
);


ALTER TABLE public."Times" OWNER TO neondb_owner;

--
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "passwordHash" text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO neondb_owner;

--
-- Name: Video; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Video" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "videoUrl" text NOT NULL,
    "thumbnailUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "likesCount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Video" OWNER TO neondb_owner;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
cmfu7bwzb0017ojhepnwvk2kk	cmfu7bwzb0015ojhe9x4dutbc	oauth	google	press1-google	\N	token	\N	bearer	\N	\N	\N
\.


--
-- Data for Name: Club; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Club" (id, name, slug, "confederationId") FROM stdin;
cmfu7bqdb0002ojhe9kmy3wdn	Clube de Regatas do Flamengo	clube-de-regatas-do-flamengo	cmfu7bqdb0001ojheedu31nf8
cmfu7bqdb0003ojhe1cafja8u	Sociedade Esportiva Palmeiras	sociedade-esportiva-palmeiras	cmfu7bqdb0001ojheedu31nf8
cmfu7bre90005ojhefeyetk8n	Sport Club Corinthians Paulista	sport-club-corinthians-paulista	cmfu7bre90004ojhevtk1zvr4
cmfu7bre90006ojhecvj2v6km	São Paulo Futebol Clube	sao-paulo-futebol-clube	cmfu7bre90004ojhevtk1zvr4
\.


--
-- Data for Name: Confederation; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Confederation" (id, name, slug, "logoUrl", "foundedAt", purpose, "currentPresident", "officialStatement", "officialStatementDate", "createdAt", "updatedAt") FROM stdin;
cmfu7bq4z0000ojhe6kmg7agu	Fédération Internationale de Football Association	federation-internationale-de-football-association	/logos-confederations/logo-fifa.png	1904-05-21 00:00:00	Coordena e desenvolve o futebol mundial, definindo regras globais e organizando competições entre seleções e clubes.	Gianni Infantino	Fédération Internationale de Football Association informa que as atualizações finais do regulamento da Copa do Mundo de Clubes 2025 foram publicadas no portal oficial.\n\nGianni Infantino reforçou que a cooperação entre confederações é essencial para implementar as medidas de sustentabilidade e governança anunciadas.\n\nA entidade orienta que as associações nacionais alinhem seus calendários e reportem ajustes até 30 de novembro.	2024-10-25 00:00:00	2025-09-21 21:20:34.835	2025-09-21 21:20:34.835
cmfu7bqdb0001ojheedu31nf8	Confederação Brasileira de Futebol	confederacao-brasileira-de-futebol	/logos-confederations/logo-cbf.png	1914-06-08 00:00:00	Administra o futebol no Brasil, organizando seleções nacionais, campeonatos e programas de desenvolvimento de base.	Ednaldo Rodrigues	Confederação Brasileira de Futebol informa que o calendário nacional de competições 2025 foi revisado com ajustes para as datas FIFA e para o Brasileirão feminino.\n\nEdnaldo Rodrigues reforçou que os clubes e federações devem cumprir os novos prazos de registro e infraestrutura definidos.\n\nA entidade orienta que as entidades estaduais enviem confirmação das sedes e laudos técnicos até 15 de novembro.	2024-10-18 00:00:00	2025-09-21 21:20:35.135	2025-09-21 21:20:35.135
cmfu7bre90004ojhevtk1zvr4	Federação Paulista de Futebol	federacao-paulista-de-futebol	/logos-confederations/logo-fpf.png	1941-04-22 00:00:00	Organiza as competições profissionais e amadoras do estado de São Paulo e apoia projetos de formação de atletas.	Reinaldo Carneiro Bastos	Federação Paulista de Futebol informa que a versão final do regulamento do Paulistão 2025 foi homologada com atualização das vagas da Copa do Brasil.\n\nReinaldo Carneiro Bastos reforçou que os departamentos jurídicos dos clubes acompanhem a implementação do protocolo disciplinar unificado.\n\nA entidade orienta que os clubes confirmem os estádios habilitados até 5 de novembro.	2024-10-10 00:00:00	2025-09-21 21:20:36.465	2025-09-21 21:20:36.465
cmfu7brxh0007ojhehy3b5hf7	Federação de Futebol do Estado do Rio de Janeiro	federacao-de-futebol-do-estado-do-rio-de-janeiro	/logos-confederations/logo-ferj.png	1978-09-29 00:00:00	Coordena o futebol profissional e de base no Rio de Janeiro, promovendo competições e cursos de capacitação.	Rubens Lopes	Federação de Futebol do Estado do Rio de Janeiro informa que o conselho arbitral aprovou o formato da Taça Guanabara 2025 e a ampliação do VAR para todas as fases.\n\nRubens Lopes reforçou que os clubes mantenham diálogo constante com a equipe de arbitragem para alinhar procedimentos.\n\nA entidade orienta que as equipes protocolem seus planejamentos de logística até 4 de novembro.	2024-10-09 00:00:00	2025-09-21 21:20:37.158	2025-09-21 21:20:37.158
cmfu7bs130008ojhegcfcyqml	Federação Mineira de Futebol	federacao-mineira-de-futebol	/logos-confederations/logo-fmf-mg.png	1915-07-04 00:00:00	Administra os campeonatos de Minas Gerais, apoia o desenvolvimento das categorias de base e promove cursos técnicos.	Adriano Aro	Federação Mineira de Futebol informa que o Módulo I do Campeonato Mineiro 2025 terá calendário alinhado à Libertadores e à Recopa.\n\nAdriano Aro reforçou que as equipes apresentem planos de gramado e iluminação exigidos para transmissões.\n\nA entidade orienta que os clubes enviem relatórios de adequação estrutural até 12 de novembro.	2024-10-07 00:00:00	2025-09-21 21:20:37.287	2025-09-21 21:20:37.287
cmfu7bs4s0009ojhetqcs1rog	Federação Gaúcha de Futebol	federacao-gaucha-de-futebol	/logos-confederations/logo-fgf-rs.png	1918-05-18 00:00:00	Promove o futebol no Rio Grande do Sul, coordenando competições profissionais, de base e projetos de arbitragem.	Luciano Hocsman	Federação Gaúcha de Futebol informa que o conselho técnico deliberou sobre ajustes no Campeonato Gaúcho 2025 e nas competições femininas.\n\nLuciano Hocsman reforçou que os departamentos de futebol mantenham comunicação para garantir cumprimento dos protocolos de segurança.\n\nA entidade orienta que os clubes validem os laudos de estádios e enviem ao departamento de competições até 6 de novembro.	2024-10-11 00:00:00	2025-09-21 21:20:37.42	2025-09-21 21:20:37.42
cmfu7bs8f000aojhe9pvxjjq8	Federação Paranaense de Futebol	federacao-paranaense-de-futebol	/logos-confederations/logo-fpf-pr.png	1937-08-05 00:00:00	Administra o futebol no Paraná, incentivando o desenvolvimento técnico, o licenciamento e a formação de atletas.	Hélio Cury	Federação Paranaense de Futebol informa que a nova grade de jogos do Campeonato Paranaense 2025 incorpora janelas exclusivas para as Copas regionais.\n\nHélio Cury reforçou que os clubes intensifiquem projetos de base e mantenham atualizados os cadastros de atletas.\n\nA entidade orienta que as agremiações confirmem datas e horários preferenciais até 1º de novembro.	2024-09-30 00:00:00	2025-09-21 21:20:37.551	2025-09-21 21:20:37.551
cmfu7bsc3000bojheuywobucw	Federação Catarinense de Futebol	federacao-catarinense-de-futebol	/logos-confederations/logo-fcf-sc.png	1924-04-12 00:00:00	Responsável pelas competições de Santa Catarina, fomenta a formação de atletas, arbitragem e futebol feminino.	Rubens Angelotti	Federação Catarinense de Futebol informa que a reunião arbitral aprovou o uso integral da tecnologia de linha de gol no Catarinense 2025.\n\nRubens Angelotti reforçou que os clubes priorizem treinamentos com a equipe de arbitragem e VAR regional.\n\nA entidade orienta que as equipes encaminhem suas demandas de infraestrutura até 8 de novembro.	2024-10-05 00:00:00	2025-09-21 21:20:37.683	2025-09-21 21:20:37.683
cmfu7bsfm000cojhea7bupuo2	Federação Bahiana de Futebol	federacao-bahiana-de-futebol	/logos-confederations/logo-fbf-ba.png	1913-09-14 00:00:00	Gerencia o futebol na Bahia, promovendo competições estaduais, programas sociais e qualificação profissional.	Ricardo Lima	Federação Bahiana de Futebol informa que o Baianão 2025 terá formato com grupo único e fases regionais voltadas ao interior.\n\nRicardo Lima reforçou que as diretorias reforcem o programa de compliance financeiro.\n\nA entidade orienta que os filiados atualizem cadastros de categorias de base até 31 de outubro.	2024-09-28 00:00:00	2025-09-21 21:20:37.81	2025-09-21 21:20:37.81
cmfu7bsj8000dojhetrsigvrg	Federação Pernambucana de Futebol	federacao-pernambucana-de-futebol	/logos-confederations/logo-fpf-pe.png	1915-06-16 00:00:00	Coordena o futebol pernambucano, garantindo competições profissionais, incentivo às bases e arbitragem qualificada.	Evandro Carvalho	Federação Pernambucana de Futebol informa que o regulamento do Campeonato Pernambucano 2025 foi ratificado com cota de transmissão redefinida.\n\nEvandro Carvalho reforçou que os clubes respeitem as novas obrigações de licenciamento feminino e sub-20.\n\nA entidade orienta que as equipes encaminhem documentação financeira até 30 de outubro.	2024-09-27 00:00:00	2025-09-21 21:20:37.941	2025-09-21 21:20:37.941
cmfu7bsmr000eojhe6bea07ha	Federação Cearense de Futebol	federacao-cearense-de-futebol	/logos-confederations/logo-fcf-ce.png	1920-03-23 00:00:00	Supervisiona o futebol cearense, promovendo competições estaduais e ações de capacitação para clubes e árbitros.	Mauro Carmélio	Federação Cearense de Futebol informa que o Campeonato Cearense 2025 terá fases preliminares integradas ao projeto de interiorização.\n\nMauro Carmélio reforçou que os clubes consolidem planos de segurança para jogos noturnos.\n\nA entidade orienta que as equipes apresentem listas atualizadas de atletas sub-23 até 5 de novembro.	2024-09-25 00:00:00	2025-09-21 21:20:38.067	2025-09-21 21:20:38.067
cmfu7bsqf000fojherakhnvaq	Federação Goiana de Futebol	federacao-goiana-de-futebol	/logos-confederations/logo-fgf-go.png	1931-11-01 00:00:00	Coordena o futebol de Goiás, oferecendo suporte às categorias de base e à profissionalização de clubes.	André Pitta	Federação Goiana de Futebol informa que o Goianão 2025 adotará formato híbrido com fase de pontos corridos e eliminatórias.\n\nAndré Pitta reforçou que os clubes cumpram o cronograma de certificação dos centros de treinamento.\n\nA entidade orienta que as associações entreguem relatórios de responsabilidade social até 7 de novembro.	2024-09-26 00:00:00	2025-09-21 21:20:38.2	2025-09-21 21:20:38.2
cmfu7bsu0000gojheb7fotpdz	Federação Paraense de Futebol	federacao-paraense-de-futebol	/logos-confederations/logo-fpf-pa.png	1941-12-02 00:00:00	Organiza o Parazão e competições de base no Pará, apoiando projetos de inclusão e formação esportiva.	Ricardo Gluck Paul	Federação Paraense de Futebol informa que as diretrizes da Copa Verde 2025 e do Parazão foram alinhadas com a CBF.\n\nRicardo Gluck Paul reforçou que os clubes intensifiquem investimentos em gramados drenantes devido ao período chuvoso.\n\nA entidade orienta que as equipes formalizem ajustes de mando de campo até 9 de novembro.	2024-10-03 00:00:00	2025-09-21 21:20:38.328	2025-09-21 21:20:38.328
cmfu7bsxj000hojheeyo8h58p	Federação Paraibana de Futebol	federacao-paraibana-de-futebol	/logos-confederations/logo-fpf-pb.png	1947-04-24 00:00:00	Administra as competições da Paraíba, promovendo o futebol feminino, projetos de base e integridade esportiva.	Michelle Ramalho	Federação Paraibana de Futebol informa que a reforma do Campeonato Paraibano 2025 amplia vagas para competições nacionais.\n\nMichelle Ramalho reforçou que os filiados adotem o protocolo de integridade para contratos e patrocínios.\n\nA entidade orienta que os clubes finalizem a regularização de estádios até 4 de novembro.	2024-09-24 00:00:00	2025-09-21 21:20:38.455	2025-09-21 21:20:38.455
cmfu7bt13000iojheiyz37a18	Federação Norte-rio-grandense de Futebol	federacao-norte-rio-grandense-de-futebol	/logos-confederations/logo-fnf-rn.png	1918-01-14 00:00:00	Promove o futebol do Rio Grande do Norte, integrando competições profissionais, femininas e projetos sociais.	José Vanildo	Federação Norte-rio-grandense de Futebol informa que o Potiguar 2025 terá calendário antecipado para conciliar participações na Copa do Nordeste.\n\nJosé Vanildo reforçou que os clubes mantenham diálogo com órgãos de segurança para eventos de maior público.\n\nA entidade orienta que as agremiações entreguem planos de contingência climática até 28 de outubro.	2024-09-23 00:00:00	2025-09-21 21:20:38.584	2025-09-21 21:20:38.584
cmfu7bt4o000jojheuj277ov6	Federação Sergipana de Futebol	federacao-sergipana-de-futebol	/logos-confederations/logo-fsf-se.png	1920-11-09 00:00:00	Coordena o futebol em Sergipe, com foco em calendário estadual, categorias de base e fortalecimento do feminino.	Milton Dantas	Federação Sergipana de Futebol informa que o Sergipano 2025 confirmou expansão do arbitral feminino e reformulação do sub-17.\n\nMilton Dantas reforçou que os clubes priorizem programas sociais ligados à base.\n\nA entidade orienta que as entidades protocolem demandas de infraestrutura até 3 de novembro.	2024-09-29 00:00:00	2025-09-21 21:20:38.712	2025-09-21 21:20:38.712
cmfu7bt88000kojhehydmvmko	Federação Alagoana de Futebol	federacao-alagoana-de-futebol	/logos-confederations/logo-faf-al.png	1927-09-01 00:00:00	Organiza as competições em Alagoas, incentivando a base, o futebol feminino e ações educacionais com clubes.	Felipe Feijó	Federação Alagoana de Futebol informa que o conselho arbitral aprovou adequações no Alagoano 2025 e no calendário de base.\n\nFelipe Feijó reforçou que os clubes fortaleçam a governança médica e os exames pré-temporada.\n\nA entidade orienta que as equipes entreguem cronograma de categorias sub-15 e sub-17 até 25 de outubro.	2024-09-21 00:00:00	2025-09-21 21:20:38.84	2025-09-21 21:20:38.84
cmfu7bteb000lojhewqxrtyqy	Federação Amazonense de Futebol	federacao-amazonense-de-futebol	/logos-confederations/logo-faf-am.png	1914-10-23 00:00:00	Promove o futebol no Amazonas, ajustando competições ao clima local e apoiando o desenvolvimento de talentos.	Aderson Frota	Federação Amazonense de Futebol informa que o Barezão 2025 terá partidas em horários alternativos para reduzir impactos climáticos.\n\nAderson Frota reforçou que os clubes reforcem planos de hidratação e suporte médico.\n\nA entidade orienta que as agremiações compartilhem relatórios ambientais até 27 de outubro.	2024-09-20 00:00:00	2025-09-21 21:20:39.06	2025-09-21 21:20:39.06
cmfu7bthx000mojheqcmxanry	Federação Amapaense de Futebol	federacao-amapaense-de-futebol	/logos-confederations/logo-faf-ap.png	1945-06-26 00:00:00	Coordena o futebol no Amapá, trabalhando pela modernização de estádios e pelo fortalecimento das categorias de base.	Josielson Penha	Federação Amapaense de Futebol informa que o estadual 2025 confirma parceria com a prefeitura para modernizar o Zerão.\n\nJosielson Penha reforçou que os clubes acompanhem as obras e ajustem treinos para preservar gramado.\n\nA entidade orienta que as equipes mantenham atualizados os cadastros de categorias femininas até 30 de outubro.	2024-09-18 00:00:00	2025-09-21 21:20:39.19	2025-09-21 21:20:39.19
cmfu7btlm000nojheqsywlkzk	Federação de Futebol do Acre	federacao-de-futebol-do-acre	/logos-confederations/logo-ffac-ac.png	1954-04-29 00:00:00	Administra o futebol no Acre, com foco em interiorização, capacitação técnica e apoio às categorias amadoras.	Antonio Aquino Lopes	Federação de Futebol do Acre informa que o Acreano 2025 terá fases regionais para diminuir deslocamentos.\n\nAntonio Aquino Lopes reforçou que os clubes invistam em logística compartilhada e controle financeiro.\n\nA entidade orienta que as agremiações apresentem planos de hospedagem até 1º de novembro.	2024-09-19 00:00:00	2025-09-21 21:20:39.322	2025-09-21 21:20:39.322
cmfu7btp5000oojhemsbscmei	Federação Roraimense de Futebol	federacao-roraimense-de-futebol	/logos-confederations/logo-frf-rr.png	1948-06-09 00:00:00	Gerencia o futebol de Roraima, promovendo o estadual, ações sociais e formação continuada de arbitragem.	Zeca Xaud	Federação Roraimense de Futebol informa que o estadual 2025 confirmou acordo para iluminação LED no Ribeirão.\n\nZeca Xaud reforçou que os clubes participem de treinamentos operacionais com a concessionária.\n\nA entidade orienta que as equipes protocolem demandas de categorias femininas até 28 de outubro.	2024-09-17 00:00:00	2025-09-21 21:20:39.45	2025-09-21 21:20:39.45
cmfu7btsn000pojhewqv0oink	Federação de Futebol do Estado de Rondônia	federacao-de-futebol-do-estado-de-rondonia	/logos-confederations/logo-ffer-ro.png	1944-01-30 00:00:00	Coordena o futebol rondoniense, apoiando projetos de base, arbitragem e desenvolvimento de clubes profissionais.	Heitor Mendonça	Federação de Futebol do Estado de Rondônia informa que o Rondoniense 2025 ajustou regulamento de registro de atletas sub-23.\n\nHeitor Mendonça reforçou que os clubes reforcem monitoramento de inscrições para evitar punições.\n\nA entidade orienta que as agremiações enviem comprovantes de regularidade fiscal até 24 de outubro.	2024-09-16 00:00:00	2025-09-21 21:20:39.576	2025-09-21 21:20:39.576
cmfu7btw7000qojhex7tr5kws	Federação Tocantinense de Futebol	federacao-tocantinense-de-futebol	/logos-confederations/logo-ftf-to.png	1990-01-07 00:00:00	Administra o futebol do Tocantins, incentivando competições estaduais, formação de base e integração com a CBF.	Leomar Quintanilha	Federação Tocantinense de Futebol informa que o Tocantinense 2025 terá calendário integrado às competições nacionais de base.\n\nLeomar Quintanilha reforçou que os clubes invistam em centros de treinamento compartilhados.\n\nA entidade orienta que as equipes apresentem projetos de iluminação homologada até 5 de novembro.	2024-09-22 00:00:00	2025-09-21 21:20:39.704	2025-09-21 21:20:39.704
cmfu7btzs000rojhe11qwcsbo	Federação de Futebol do Distrito Federal	federacao-de-futebol-do-distrito-federal	/logos-confederations/logo-ffdf.png	1959-06-16 00:00:00	Coordena o futebol no Distrito Federal, promovendo competições, programas de integridade e qualificação de clubes.	Daniel Vasconcelos	Federação de Futebol do Distrito Federal informa que o Candangão 2025 foi oficializado com semifinais em ida e volta.\n\nDaniel Vasconcelos reforçou que os clubes mantenham regularidade trabalhista e médica.\n\nA entidade orienta que as agremiações atualizem cadastros no BID até 20 de outubro.	2024-09-15 00:00:00	2025-09-21 21:20:39.832	2025-09-21 21:20:39.832
cmfu7bu3b000sojhexjaib15y	Federação de Futebol do Estado do Espírito Santo	federacao-de-futebol-do-estado-do-espirito-santo	/logos-confederations/logo-fes-es.png	1917-02-25 00:00:00	Organiza o Capixabão e competições de base, investindo em transmissão digital e formação de profissionais.	Gustavo Vieira	Federação de Futebol do Estado do Espírito Santo informa que o Capixabão 2025 terá transmissão digital com sinal unificado.\n\nGustavo Vieira reforçou que os clubes adequem estruturas de cabines e internet.\n\nA entidade orienta que as equipes confirmem laudos técnicos até 18 de outubro.	2024-09-14 00:00:00	2025-09-21 21:20:39.96	2025-09-21 21:20:39.96
cmfu7bu8u000tojhejj4h13oz	Federação Maranhense de Futebol	federacao-maranhense-de-futebol	/logos-confederations/logo-fmf-ma.png	1918-06-11 00:00:00	Promove o futebol no Maranhão, integrando competições estaduais, femininas e projetos socioeducativos.	Antônio Américo	Federação Maranhense de Futebol informa que o Maranhense 2025 estabeleceu calendário para competições sub-19 e feminina.\n\nAntônio Américo reforçou que os clubes reforcem departamentos médicos e de nutrição.\n\nA entidade orienta que as agremiações entreguem seus planos de viagens até 21 de outubro.	2024-09-13 00:00:00	2025-09-21 21:20:40.159	2025-09-21 21:20:40.159
cmfu7bucb000uojhenwhgrtvx	Federação de Futebol do Piauí	federacao-de-futebol-do-piaui	/logos-confederations/logo-ffp-pi.png	1941-11-26 00:00:00	Coordena o futebol piauiense, oferecendo suporte a competições estaduais, base e capacitação de gestores.	Robert Brown Carcará	Federação de Futebol do Piauí informa que o Campeonato Piauiense 2025 confirmou ajustes no número de datas e na inscrição de atletas.\n\nRobert Brown Carcará reforçou que os clubes atentem para o novo módulo de licenciamento digital.\n\nA entidade orienta que as equipes enviem documentação digitalizada até 18 de outubro.	2024-09-12 00:00:00	2025-09-21 21:20:40.283	2025-09-21 21:20:40.283
cmfu7buh5000vojhezeweoaw8	Federação Mato-grossense de Futebol	federacao-mato-grossense-de-futebol	/logos-confederations/logo-fmf-mt.png	1942-05-20 00:00:00	Administra o futebol em Mato Grosso, priorizando infraestrutura, arbitragem e formação de atletas.	Carlos Orione	Federação Mato-grossense de Futebol informa que o Mato-grossense 2025 terá centralização das operações de arbitragem.\n\nCarlos Orione reforçou que os clubes participem dos workshops de tecnologia oferecidos.\n\nA entidade orienta que as agremiações apresentem cronograma de adequação de estádios até 17 de outubro.	2024-09-11 00:00:00	2025-09-21 21:20:40.458	2025-09-21 21:20:40.458
cmfu7bumz000wojhesj2h8wn7	Federação de Futebol de Mato Grosso do Sul	federacao-de-futebol-de-mato-grosso-do-sul	/logos-confederations/logo-ffms-ms.png	1978-12-23 00:00:00	Coordena o futebol sul-mato-grossense, estimulando o calendário estadual, a base e projetos de arbitragem.	Adriano Kobal	Federação de Futebol de Mato Grosso do Sul informa que o Sul-Mato-Grossense 2025 priorizará jogos aos finais de semana e integração com a base.\n\nAdriano Kobal reforçou que os clubes reforcem programas de formação de árbitros assistentes locais.\n\nA entidade orienta que as equipes validem cadastro de atletas sub-20 até 16 de outubro.	2024-09-10 00:00:00	2025-09-21 21:20:40.668	2025-09-21 21:20:40.668
\.


--
-- Data for Name: Game; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Game" (id, slug, title, category, excerpt, content, "coverImage", "authorId", date, "createdAt", "updatedAt") FROM stdin;
cmfu7bzbn001hojhes66iak71	blog-controle-retro-curiosidades-easter-egg-games	Blog do Controle Retro: curiosidades sobre o primeiro easter egg dos games	Curiosidades	Descubra como um desenvolvedor da Atari escondeu seu nome dentro de Adventure, abrindo caminho para a cultura dos easter eggs nos jogos modernos.	Enquanto revisava clássicos do Atari 2600, o Blog do Controle Retro mergulhou na história de Warren Robinett e de sua ousadia ao esconder a sala secreta em Adventure. O objetivo era garantir reconhecimento em uma época em que a Atari não creditava os criadores.\n\nO blogueiro resgatou imagens das revistas especializadas da década de 1980 que revelaram o segredo ao público e comparou a prática com os easter eggs contemporâneos em séries como Assassin's Creed e The Legend of Zelda. O texto ainda traz dicas de jogos independentes atuais que mantêm a tradição dos segredos para fãs atentos.	https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80&fm=webp	cmfu7by0t0019ojhergwhkqxp	2024-07-10 15:30:00	2025-09-21 21:20:46.614	2025-09-21 21:20:46.614
cmfu7bzbn001iojhe9rb2ewyx	diario-do-game-pass-bastidores-sea-of-stars	Diário do Game Pass comenta os bastidores de Sea of Stars	Novidades	Em visita ao estúdio Sabotage, blogueiro brasileiro revela artes conceituais inéditas e planos de expansão do RPG inspirado em Chrono Trigger.	O Diário do Game Pass foi recebido pelo time da Sabotage em Quebec e ouviu detalhes sobre a atualização planejada para Sea of Stars em 2025. Entre as novidades estão um modo roguelite cooperativo e novas canções compostas por Yasunori Mitsuda.\n\nO artigo também detalha como o estúdio utiliza um quadro de referência com cenas icônicas de jogos clássicos para guiar a paleta de cores e a iluminação. Ao final, há recomendações de soundtracks para ouvir durante a exploração e entrevistas com fãs brasileiros que criam mods cosméticos para o título.	https://images.unsplash.com/photo-1526481280695-3c46992875a0?auto=format&fit=crop&w=1600&q=80&fm=webp	cmfu7by0t0019ojhergwhkqxp	2024-07-05 18:00:00	2025-09-21 21:20:46.614	2025-09-21 21:20:46.614
cmfu7bzbn001jojheofmuktmr	blog-save-point-itens-curiosos-final-fantasy-xiv	Blog Save Point lista itens perdidos mais curiosos de Final Fantasy XIV	MMO	Colecionadores contam histórias inusitadas de glamours raros, mascotes escondidos e quests sazonais que desapareceram de Eorzea.	O Blog Save Point reuniu relatos de jogadores veteranos de Final Fantasy XIV para mapear itens que sumiram com o passar das expansões. Há menções ao Cascavel de Safira, uma montaria vista apenas durante o beta fechado de A Realm Reborn, e às roupas temáticas do evento Lightning Strikes.\n\nAlém disso, o blogueiro ouviu moderadores de comunidades independentes que documentam relíquias digitais e ofereceu um passo a passo para transformar screenshots em cartões colecionáveis impressos com realidade aumentada.	https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1600&q=80&fm=webp	cmfu7by0t0019ojhergwhkqxp	2024-07-02 21:10:00	2025-09-21 21:20:46.614	2025-09-21 21:20:46.614
cmfu7bzbn001kojhe5vfkslbo	checkpoint-indie-prototipos-hollow-knight-silksong	Checkpoint Indie revela protótipos secretos de Hollow Knight: Silksong	Indies	Durante evento fechado, Team Cherry mostrou rascunhos jogáveis com habilidades descartadas e criaturas que podem reaparecer como conteúdo bônus.	O Checkpoint Indie acompanhou uma apresentação da Team Cherry e teve acesso a protótipos de Hollow Knight: Silksong desenvolvidos entre 2019 e 2021. Os registros incluem um gancho de seda utilizado para atravessar abismos e um sistema de alquimia que permitiria personalizar agulhas com venenos.\n\nSegundo o estúdio, parte das ideias pode ser reaproveitada em um diário digital liberado após o lançamento. O blogueiro aproveitou para listar artes conceituais favoritas e sugerir desafios para speedrunners inspirados no novo bestiário.	https://images.unsplash.com/photo-1510723180108-346f3779edc6?auto=format&fit=crop&w=1600&q=80&fm=webp	cmfu7by0t0019ojhergwhkqxp	2024-06-28 12:45:00	2025-09-21 21:20:46.614	2025-09-21 21:20:46.614
cmfu7bzbn001lojhea3g8k9s4	guia-do-arcade-restauracao-fliperamas-raros	Guia do Arcade comenta a restauração de fliperamas raros	História	Colecionador brasileiro mostra bastidores da reforma de máquinas clássicas e ensina como preservar placas e componentes antigos.	O Guia do Arcade visitou o laboratório de um restaurador no Rio de Janeiro que comprou gabinetes de Metal Slug X e de Out Run em um leilão europeu. O processo inclui o envio das placas para especialistas em eletrônica e o uso de impressoras 3D para reconstruir peças quebradas.\n\nO post traz uma checklist para quem deseja iniciar coleções domésticas, além de um glossário com termos técnicos e links para comunidades que ajudam a encontrar ROMs legais e kits de iluminação LED.	https://images.unsplash.com/photo-1527608973515-92770e70d1f5?auto=format&fit=crop&w=1600&q=80&fm=webp	cmfu7by0t0019ojhergwhkqxp	2024-06-22 10:00:00	2025-09-21 21:20:46.614	2025-09-21 21:20:46.614
cmfu7bzbn001mojhexl4a1f2x	blog-xp-speed-testa-modo-foto-secreto-forza-horizon-5	Blog XP Speed testa o modo foto secreto de Forza Horizon 5	Atualizações	Modo experimental permite capturar replays com câmera drone em tempestades e compartilha filtros usados pela Playground Games para trailers.	O Blog XP Speed participou de um ensaio técnico em parceria com a Playground Games e pôde experimentar um modo foto ainda em desenvolvimento. Entre os recursos estão o ajuste fino de partículas de poeira e a possibilidade de sincronizar o nascer do sol com a trilha sonora dinâmica.\n\nA matéria também traz comentários de fotógrafos virtuais sobre como a comunidade pode usar os replays para treinar inteligência artificial que reconhece estilos de pilotagem. Há ainda um tutorial para exportar as capturas em formato RAW e editá-las no celular.	https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80&fm=webp	cmfu7by0t0019ojhergwhkqxp	2024-06-18 23:30:00	2025-09-21 21:20:46.614	2025-09-21 21:20:46.614
\.


--
-- Data for Name: News; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."News" (id, title, slug, excerpt, content, category, "coverImage", "publishedAt", "createdAt", "updatedAt", "authorId", "likesCount") FROM stdin;
cmfu7byu1001bojherrltrxfs	Estrela em ascensão brilha em clássico decisivo	estrela-em-ascensao-brilha-em-classico-decisivo	Com atuação inspirada, a jovem promessa decidiu o confronto regional aos 42 minutos do segundo tempo e colocou o clube na liderança do campeonato estadual.	A tarde ensolarada no estádio municipal recebeu mais de 35 mil torcedores para assistir ao confronto direto pela liderança do campeonato. Aos 42 minutos da etapa final, a joia da base recebeu pela esquerda, cortou para o meio e finalizou com precisão no canto superior.\n\nO gol não apenas garantiu os três pontos, mas também consolidou o nome do atleta entre os principais destaques do torneio. O treinador elogiou a maturidade do jovem camisa 11 e ressaltou o trabalho do departamento de análise de desempenho na preparação do elenco.	Campeonatos	https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1600&q=80&fm=webp	2025-08-03 18:30:00	2025-09-21 21:20:46.106	2025-09-21 21:20:46.106	cmfu7bwzb0015ojhe9x4dutbc	214
cmfu7byu2001cojhe5ndxheao	Comissão técnica investe em tecnologia para treinos	comissao-tecnica-investe-em-tecnologia-para-treinos	Departamento de futebol implementa novas metodologias com apoio de análise de dados para potencializar desempenho físico e tático do elenco profissional.	Os profissionais do clube iniciaram a semana apresentando um novo pacote de soluções tecnológicas que inclui monitoramento de carga em tempo real e simulações táticas em realidade virtual. A iniciativa é fruto de parceria com uma startup especializada em ciência do esporte.\n\nSegundo a equipe de preparação física, os recursos permitem personalizar sessões de treinamento de acordo com o histórico de cada atleta, reduzindo o risco de lesões e acelerando processos de recuperação. O clube pretende expandir o uso das ferramentas para as categorias de base até o final da temporada.	Bastidores	https://images.unsplash.com/photo-1526234255934-99a3be5496ef?auto=format&fit=crop&w=1600&q=80&fm=webp	2025-08-01 14:00:00	2025-09-21 21:20:46.106	2025-09-21 21:20:46.106	cmfu7bwzb0015ojhe9x4dutbc	178
cmfu7byu2001dojhef42qupby	Base conquista título invicto em torneio internacional	base-conquista-titulo-invicto-em-torneio-internacional	Equipe sub-17 vence quatro partidas seguidas, marca onze gols e volta para casa com troféu inédito após campanha sólida em Montevidéu.	Os jovens atletas mostraram maturidade ao longo do torneio disputado no Uruguai e derrotaram adversários de diferentes estilos de jogo. Na final, a equipe brasileira superou o tradicional Nacional por 2 a 1, com gols de um zagueiro artilheiro e do meia criativo.\n\nA comissão técnica destacou a disciplina tática do grupo e o protagonismo da linha defensiva, que sofreu apenas dois gols em toda a competição. A conquista reforça o investimento contínuo da diretoria em categorias de formação.	Categorias de base	https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1600&q=80&fm=webp	2025-07-27 10:15:00	2025-09-21 21:20:46.106	2025-09-21 21:20:46.106	cmfu7bwzb0015ojhe9x4dutbc	132
cmfu7byu2001eojhextq6wbvq	Departamento médico apresenta novo protocolo de prevenção	departamento-medico-apresenta-novo-protocolo-de-prevencao	Clube amplia equipe multidisciplinar e lança programa integrado de fisiologia, nutrição e psicologia para atletas do elenco principal.	A reformulação do departamento médico foi tema de coletiva no centro de treinamento nesta manhã. Os profissionais apresentaram um protocolo baseado em três pilares: avaliação periódica, acompanhamento nutricional individualizado e suporte psicológico contínuo.\n\nA expectativa é reduzir o tempo de afastamento por contusões musculares em 25% até o fim do ano, além de fortalecer o vínculo entre jogadores e staff técnico.	Saúde e performance	https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80&fm=webp	2025-07-22 09:00:00	2025-09-21 21:20:46.106	2025-09-21 21:20:46.106	cmfu7bwzb0015ojhe9x4dutbc	167
cmfu7byu2001fojhexpyccpw6	Torcida prepara mosaico especial para decisão continental	torcida-prepara-mosaico-especial-para-decisao-continental	Organizadas se unem em ação solidária que arrecada alimentos enquanto prepara espetáculo de luzes e cores para o jogo mais aguardado do ano.	Integrantes das principais torcidas organizadas anunciaram parceria para montar um mosaico 3D que ocupará os quatro setores do estádio. O material foi financiado por campanha coletiva que arrecadou cinco toneladas de alimentos para instituições locais.\n\nAlém do show nas arquibancadas, os torcedores planejam recepção calorosa ao elenco, com concentração nas imediações do CT na véspera da partida.	Torcida	https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1600&q=80&fm=webp	2025-07-18 20:45:00	2025-09-21 21:20:46.106	2025-09-21 21:20:46.106	cmfu7bwzb0015ojhe9x4dutbc	241
cmfu7byu2001gojhe1g1fgeo9	Executivo detalha planejamento para a próxima janela	executivo-detalha-planejamento-para-a-proxima-janela	Diretoria confirma mapa de prioridades para reforços e foca em jogadores com versatilidade para atuar em mais de uma função.	Em entrevista exclusiva, o diretor executivo explicou que a estratégia do clube passa por contratações pontuais, alinhadas às demandas de comissão técnica e análise de desempenho. O clube monitora atletas sul-americanos com possibilidade de adaptação rápida ao futebol nacional.\n\nO dirigente também destacou o cuidado com a saúde financeira, reforçando que qualquer investimento será acompanhado de mecanismos de performance e metas esportivas claras.	Mercado da bola	https://images.unsplash.com/photo-1527718641255-324f8e2d0423?auto=format&fit=crop&w=1600&q=80&fm=webp	2025-07-15 16:20:00	2025-09-21 21:20:46.106	2025-09-21 21:20:46.106	cmfu7bwzb0015ojhe9x4dutbc	196
\.


--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Profile" (id, "displayName", "avatarUrl", bio, role, data, cpf, rg, cep, nascimento, genero, telefone, ddd, site, endereco, "redesSociais", "areaAtuacao", portfolio, posicao, perna, altura, peso, pais, uf, clube, "nomeFantasia", "emailClube", cidade, cnpj, "inscricaoEstadual", "representanteNome", "representanteCpf", "representanteEmail", whatsapp, "registroCbf", "registroFifa", "responsavelNascimento", "responsavelGenero", "responsavelInstagram", "atletaNome", "atletaCpf", "atletaNascimento", "atletaGenero", "atletaEsporte", "atletaModalidade", "atletaObservacoes", "notifNovidades", "notifJogos", "notifEventos", "notifAtletas", termos, "lgpdWhatsappNoticias", "lgpdWhatsappConvites", "userId", "createdAt", "updatedAt") FROM stdin;
cmfu7buqp000yojhelzlitpi5	Agente Um	\N	\N	AGENTE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	cmfu7buqo000xojhev8pffudp	2025-09-21 21:20:40.801	2025-09-21 21:20:40.801
cmfu7bvhs0010ojhe7o0e2jqc	Agente Dois	\N	\N	AGENTE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	cmfu7bvhr000zojhed4zc4xhv	2025-09-21 21:20:40.801	2025-09-21 21:20:40.801
cmfu7bwgx0013ojhe35t5whn2	Atleta Dois	\N	\N	ATLETA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	cmfu7bwgw0011ojheedt1flix	2025-09-21 21:20:43.041	2025-09-21 21:20:43.041
cmfu7bwzb0016ojhepjp373su	Jornalista Um	\N	\N	IMPRENSA	\N	11122233344	\N	\N	\N	\N	912345678	11	https://meublog.com	Rua Exemplo, 123 - São Paulo/SP	https://twitter.com/jornalistaum	Esportes	https://portfolio.example.com/jornalistaum	\N	\N	\N	\N	\N	SP	\N	\N	\N	São Paulo	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	cmfu7bwzb0015ojhe9x4dutbc	2025-09-21 21:20:43.703	2025-09-21 21:20:43.703
cmfu7by0t001aojhe3bttzqxx	Blogueiro Gamer	\N	Criador do blog Controle Retro, apaixonado por curiosidades do universo gamer.	IMPRENSA	\N	\N	\N	\N	\N	\N	\N	\N	https://controlevintage.blog	\N	https://instagram.com/controlevintage	Blog e cobertura de cultura gamer	\N	\N	\N	\N	\N	\N	MG	cmfu7c07d001pojheky6c1uf2	\N	\N	Belo Horizonte	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	cmfu7by0t0019ojhergwhkqxp	2025-09-21 21:20:45.053	2025-09-21 21:20:48.672
cmfu7bwgx0014ojhe3eyonoc1	Atleta Um	https://pub-11c79f639e314f208bdf80d01ef7056c.r2.dev/uploads/avatars/cmfu7bwgw0012ojheb9bj49xl-e5512a8e-a877-4fad-b7ff-84d731e18eec.webp	\N	ATLETA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	cmfu7c07d001uojhejv9lg7b8	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	f	f	f	cmfu7bwgw0012ojheb9bj49xl	2025-09-21 21:20:43.041	2025-09-23 19:34:51.918
cmfyh0u0b0002nassr4s60ds1	Alex Pimenta	https://pub-11c79f639e314f208bdf80d01ef7056c.r2.dev/uploads/avatars/cmfyh0txz0000nasssch50l3w-99536945-74a3-4723-9c81-92e869f95cf4.webp	\N	ATLETA	\N	607.682.100-03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Zagueiro	Direita	1,70	75	Brasil	SP	\N	\N	\N	Santos	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	f	f	t	f	f	cmfyh0txz0000nasssch50l3w	2025-09-24 21:03:07.5	2025-09-27 14:23:10.368
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
cmfu7bwzb0018ojhe4lsrpvka	press1-session	cmfu7bwzb0015ojhe9x4dutbc	2025-09-22 21:20:43.7
\.


--
-- Data for Name: Times; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Times" (id, divisao, clube, slug, sigla, apelido, mascote, fundacao, "maiorIdolo", cidade, estado) FROM stdin;
cmfu7c07d001pojheky6c1uf2	A	Atlético Mineiro	atletico-mineiro	CAM	Galo	Galo	1908	Reinaldo	Belo Horizonte	MG
cmfu7c07d001qojhel2mx26pi	A	Bahia	bahia	ECB	Esquadrão de Aço	Super-Homem (Tricolor)	1931	Bobô	Salvador	BA
cmfu7c07d001rojhei7rlput6	A	Botafogo	botafogo	BFR	Glorioso / Fogão	Manequinho / Biriba (cão)	1904	Garrincha	Rio de Janeiro	RJ
cmfu7c07d001sojhet763u6j3	A	Ceará	ceara	CSC	Vozão / Vovô	Vovô	1914	Magno Alves	Fortaleza	CE
cmfu7c07d001tojhev7anglr9	A	Corinthians	corinthians	SCCP	Timão	Mosqueteiro	1910	Sócrates	São Paulo	SP
cmfu7c07d001uojhejv9lg7b8	A	Cruzeiro	cruzeiro	CEC	Raposa / Cabuloso	Raposa	1921	Tostão	Belo Horizonte	MG
cmfu7c07d001vojhef6iw4dgi	A	Flamengo	flamengo	CRF	Mengão / Rubro-Negro	Urubu	1895	Zico	Rio de Janeiro	RJ
cmfu7c07d001wojhekvjg9x2g	A	Fluminense	fluminense	FFC	Tricolor	Cartola (hist.) / Guerreirinho (atual em jogos)	1902	Fred	Rio de Janeiro	RJ
cmfu7c07d001xojheljxs4v22	A	Fortaleza	fortaleza	FEC	Leão do Pici	Leão	1918	Clodoaldo	Fortaleza	CE
cmfu7c07d001yojheebc9p9cc	A	Grêmio	gremio	GFBPA	Imortal Tricolor	Mosqueteiro	1903	Renato Portaluppi	Porto Alegre	RS
cmfu7c07d001zojhe428pa2gw	A	Internacional	internacional	SCI	Colorado	Saci	1909	Falcão	Porto Alegre	RS
cmfu7c07d0020ojhets24k7vb	A	Juventude	juventude	ECJ	Juve / Papada	Periquito	1913		Caxias do Sul	RS
cmfu7c07d0021ojhe5tun63mp	A	Mirassol	mirassol	MFC	Leão	Leão	1925		Mirassol	SP
cmfu7c07e0022ojhem4m2ke48	A	Palmeiras	palmeiras	SEP	Verdão	Porco (Gobbato)	1914	Ademir da Guia	São Paulo	SP
cmfu7c07e0023ojhemx5hv1tc	A	Red Bull Bragantino	red-bull-bragantino	RBB	Massa Bruta	Toro Loko (touro)	1928	Mauro Silva	Bragança Paulista	SP
cmfu7c07e0024ojhe2skc3jir	A	Santos	santos	SFC	Peixe	Baleião e Baleinha (golfinhos)	1912	Pelé	Santos	SP
cmfu7c07e0025ojhe1cq7nerm	A	Sport	sport	SCR	Leão da Ilha	Leão	1905	Magrão	Recife	PE
cmfu7c07e0026ojhehjwwed0p	A	São Paulo	sao-paulo	SPFC	Tricolor Paulista	Santo Paulo	1930	Rogério Ceni	São Paulo	SP
cmfu7c07e0027ojhe0cg13fk4	A	Vasco da Gama	vasco-da-gama	CRVG	Gigante da Colina	Almirante	1898	Roberto Dinamite	Rio de Janeiro	RJ
cmfu7c07e0028ojhekudx34oh	A	Vitória	vitoria	ECV	Leão da Barra	Leão	1899	Ramon Menezes	Salvador	BA
cmfu7c07e0029ojhe26873tdd	B	Amazonas	amazonas	AMZ	Onça-Pintada / Aurinegro	Onça-pintada	2019		Manaus	AM
cmfu7c07e002aojheh5mdj6rm	B	América Mineiro	america-mineiro	AFC	Coelho	Coelho	1912		Belo Horizonte	MG
cmfu7c07e002bojhe3oqeotkl	B	Athletic (MG)	athletic-mg	AC	Esquadrão de Aço		1909		São João del-Rei	MG
cmfu7c07e002cojhe0xk56zum	B	Athletico Paranaense	athletico-paranaense	CAP	Furacão	Furacão	1924	Sicupira	Curitiba	PR
cmfu7c07e002dojhe69dnrdx8	B	Atlético Goianiense	atletico-goianiense	ACG	Dragão	Dragão	1937		Goiânia	GO
cmfu7c07e002eojhewfa61oqm	B	Avaí	avai	AVA	Leão da Ilha	Leão	1923	Marquinhos	Florianópolis	SC
cmfu7c07e002fojhefrdsbe9f	B	Botafogo-SP	botafogo-sp	BFC	Pantera	Pantera	1918	Sócrates	Ribeirão Preto	SP
cmfu7c07e002gojheksbumnlh	B	CRB	crb	CRB	Galo	Galo	1912		Maceió	AL
cmfu7c07e002hojhebxo13y38	B	Chapecoense	chapecoense	ACF	Chape / Verdão do Oeste	Índio Condá	1973		Chapecó	SC
cmfu7c07e002iojhe24mkmnog	B	Coritiba	coritiba	CFC	Coxa	Vovô Coxa	1909	Dirceu Krüger	Curitiba	PR
cmfu7c07e002jojheozksottv	B	Criciúma	criciuma	CEC	Tigre	Tigre	1947		Criciúma	SC
cmfu7c07e002kojhewe6l0e5a	B	Cuiabá	cuiaba	CUI	Dourado	Dourado (peixe)	2001		Cuiabá	MT
cmfu7c07e002lojhemxmu78si	B	Ferroviária	ferroviaria	AFE	Ferrinha / Locomotiva	Locomotiva	1950		Araraquara	SP
cmfu7c07e002mojhegdgkke19	B	Goiás	goias	GEC	Esmeraldino	Periquito	1943	Túlio Maravilha	Goiânia	GO
cmfu7c07e002nojhes54qat7t	B	Novorizontino	novorizontino	GEN	Tigre do Vale	Tigre	2010		Novo Horizonte	SP
cmfu7c07e002oojheiq1z36ek	B	Operário Ferroviário	operario-ferroviario	OFEC	Fantasma	Fantasma	1912		Ponta Grossa	PR
cmfu7c07e002pojhet8pyy5c4	B	Paysandu	paysandu	PSC	Papão da Curuzu	Lobo	1914	Iarley	Belém	PA
cmfu7c07e002qojhewrmpyelj	B	Remo	remo	CR	Leão Azul	Leão	1905	Bira	Belém	PA
cmfu7c07e002rojhen1fp6jic	B	Vila Nova	vila-nova	VEC	Tigrão / Colorado	Tigre	1943		Goiânia	GO
cmfu7c07e002sojhey434qs83	B	Volta Redonda	volta-redonda	VRFC	Voltaço		1976		Volta Redonda	RJ
cmfu7c07e002tojhee3rhhl51	C	ABC	abc	ABC	Mais Querido	Elefante	1915	Marinho Chagas	Natal	RN
cmfu7c07e002uojhezpgofzjf	C	Anápolis	anapolis	AFC	Galo da Comarca	Galo	1946		Anápolis	GO
cmfu7c07e002vojhebjuh26t1	C	Botafogo-PB	botafogo-pb	BFC	Belo	Belo	1931		João Pessoa	PB
cmfu7c07e002wojhev77izr5n	C	Brusque	brusque	BFC	Quadricolor		1987		Brusque	SC
cmfu7c07f002xojheeqr0arl2	C	CSA	csa	CSA	Azulão	Azulão	1913		Maceió	AL
cmfu7c07f002yojhehrnkahe5	C	Caxias	caxias	SERC	Grená		1935		Caxias do Sul	RS
cmfu7c07f002zojhe95ufo44n	C	Confiança	confianca	ADC	Dragão	Dragão	1936		Aracaju	SE
cmfu7c07f0030ojhegkwha1vx	C	Figueirense	figueirense	FFC	Furacão do Estreito		1921		Florianópolis	SC
cmfu7c07f0031ojhelr0cu2hz	C	Floresta	floresta	FEC	Verdão da Vila		1954		Fortaleza	CE
cmfu7c07f0032ojhez52y2h1g	C	Guarani	guarani	GFC	Bugre	Índio Bugre	1911	Careca	Campinas	SP
cmfu7c07f0033ojhenma5gnkq	C	Itabaiana	itabaiana	AOI	Tremendão	Tremendão	1938		Itabaiana	SE
cmfu7c07f0034ojhequwzjtjk	C	Ituano	ituano	IFC	Galo de Itu	Galo	1947		Itu	SP
cmfu7c07f0035ojhew8fgeff3	C	Londrina	londrina	LEC	Tubarão	Tubarão	1956		Londrina	PR
cmfu7c07f0036ojhev4itntgb	C	Maringá	maringa	MFC	Dogão	Cão (Dogão)	2010		Maringá	PR
cmfu7c07f0037ojhela03q9c5	C	Náutico	nautico	CNC	Timbu	Timbu	1901	Kuki	Recife	PE
cmfu7c07f0038ojheun5efyt4	C	Ponte Preta	ponte-preta	AAP	Macaca	Macaca	1900	Dicá	Campinas	SP
cmfu7c07f0039ojhegz7fajhl	C	Retrô	retro	RFC	Fênix	Fênix	2016		Camaragibe	PE
cmfu7c07f003aojhetlhwl7r9	C	São Bernardo	sao-bernardo	SBFC	Cachorrão	Cachorrão	2004		São Bernardo do Campo	SP
cmfu7c07f003bojhesi9j30jk	C	Tombense	tombense	TEC	Carcará	Carcará	1914		Tombos	MG
cmfu7c07f003cojhevl8a7z95	C	Ypiranga-RS	ypiranga-rs	YFC	Canarinho	Canarinho	1924		Erechim	RS
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, name, email, "passwordHash", "emailVerified", image, "createdAt", "updatedAt") FROM stdin;
cmfu7buqo000xojhev8pffudp	Agente Um	agent1@example.com	$2b$10$mBnU9chy.UG/z5I0hv0wTeyHpFnj1HbfDeUV1ARjB5E.YIirSW.SO	\N	\N	2025-09-21 21:20:40.801	2025-09-21 21:20:40.801
cmfu7bvhr000zojhed4zc4xhv	Agente Dois	agent2@example.com	$2b$10$mBnU9chy.UG/z5I0hv0wTeyHpFnj1HbfDeUV1ARjB5E.YIirSW.SO	\N	\N	2025-09-21 21:20:40.801	2025-09-21 21:20:40.801
cmfu7bwgw0011ojheedt1flix	Atleta Dois	athlete2@example.com	$2b$10$mBnU9chy.UG/z5I0hv0wTeyHpFnj1HbfDeUV1ARjB5E.YIirSW.SO	\N	\N	2025-09-21 21:20:43.041	2025-09-21 21:20:43.041
cmfu7bwgw0012ojheb9bj49xl	Atleta Um	athlete1@example.com	$2b$10$mBnU9chy.UG/z5I0hv0wTeyHpFnj1HbfDeUV1ARjB5E.YIirSW.SO	\N	\N	2025-09-21 21:20:43.041	2025-09-21 21:20:43.041
cmfu7bwzb0015ojhe9x4dutbc	Jornalista Um	press1@example.com	$2b$10$mBnU9chy.UG/z5I0hv0wTeyHpFnj1HbfDeUV1ARjB5E.YIirSW.SO	\N	\N	2025-09-21 21:20:43.703	2025-09-21 21:20:43.703
cmfu7by0t0019ojhergwhkqxp	Blogueiro Gamer	bloggamer@example.com	$2b$10$mBnU9chy.UG/z5I0hv0wTeyHpFnj1HbfDeUV1ARjB5E.YIirSW.SO	\N	\N	2025-09-21 21:20:45.053	2025-09-21 21:20:45.053
cmfyh0txz0000nasssch50l3w	Alex Pimenta	aspepper@gmail.com	$2b$10$mBnU9chy.UG/z5I0hv0wTeyHpFnj1HbfDeUV1ARjB5E.YIirSW.SO	\N	\N	2025-09-24 21:03:07.415	2025-09-24 21:03:07.415
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
press1@example.com	press1-token	2025-09-22 21:20:45.846
\.


--
-- Data for Name: Video; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Video" (id, title, description, "videoUrl", "thumbnailUrl", "createdAt", "updatedAt", "userId", "likesCount") FROM stdin;
cmfu7bzq6001nojheleiwimyk	Lance do Atleta Um	\N	https://example.com/video1.mp4	\N	2025-09-21 21:20:47.263	2025-09-21 21:20:47.263	cmfu7bwgw0012ojheb9bj49xl	128
cmfu7bzq7001oojhef0gtkm9t	Lance do Atleta Dois	\N	https://example.com/video2.mp4	\N	2025-09-21 21:20:47.263	2025-09-21 21:20:47.263	cmfu7bwgw0011ojheedt1flix	86
cmg0pk9200001o4sr34c1huse	Driblando tres	Lance lindo no campinho aqui na comunidade	https://pub-11c79f639e314f208bdf80d01ef7056c.r2.dev/uploads/videos/a708ff12-3851-41bf-92bd-93523ed2fb79-16yearold_boy_scoring_202509260643_fntyn.mp4	https://pub-11c79f639e314f208bdf80d01ef7056c.r2.dev/uploads/thumbnails/bf456028-bbde-4456-80c8-aaf74bf044a2-	2025-09-26 10:37:42.504	2025-09-26 10:37:42.504	cmfu7bwgw0012ojheb9bj49xl	0
cmg27edkl0001mysrysqyg6e8	Meus dribles	Eu driblei dois colegas facilmente	https://pub-11c79f639e314f208bdf80d01ef7056c.r2.dev/uploads/videos/94e141d7-f485-4fe2-8d64-4d3ea64f119d-Mixed_race_boy_202509270835_mu512.mp4	https://pub-11c79f639e314f208bdf80d01ef7056c.r2.dev/uploads/thumbnails/cbd9b04d-43a7-4f28-be90-f23c13ad9926-Mix_Thumb.jpg	2025-09-27 11:44:47.177	2025-09-27 11:44:47.177	cmfyh0txz0000nasssch50l3w	0
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
08f05750-8962-414a-8be1-6fb8f4aa6792	35e1d0e4509935a50528a1bc4c934cafba0923b0173774ecccdc032a9fc88bbd	\N	20241021120000_add_confederation_details	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20241021120000_add_confederation_details\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "public.Confederation" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"public.Confederation\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(632), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20241021120000_add_confederation_details"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20241021120000_add_confederation_details"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:236	\N	2025-09-21 19:54:58.259168+00	0
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Club Club_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Club"
    ADD CONSTRAINT "Club_pkey" PRIMARY KEY (id);


--
-- Name: Confederation Confederation_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Confederation"
    ADD CONSTRAINT "Confederation_pkey" PRIMARY KEY (id);


--
-- Name: Game Game_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_pkey" PRIMARY KEY (id);


--
-- Name: News News_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."News"
    ADD CONSTRAINT "News_pkey" PRIMARY KEY (id);


--
-- Name: Profile Profile_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Times Times_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Times"
    ADD CONSTRAINT "Times_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Video Video_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Video"
    ADD CONSTRAINT "Video_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Club_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Club_name_key" ON public."Club" USING btree (name);


--
-- Name: Club_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Club_slug_key" ON public."Club" USING btree (slug);


--
-- Name: Confederation_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Confederation_slug_key" ON public."Confederation" USING btree (slug);


--
-- Name: Game_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Game_slug_key" ON public."Game" USING btree (slug);


--
-- Name: News_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "News_slug_key" ON public."News" USING btree (slug);


--
-- Name: Profile_userId_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Profile_userId_key" ON public."Profile" USING btree ("userId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Times_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Times_slug_key" ON public."Times" USING btree (slug);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Club Club_confederationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Club"
    ADD CONSTRAINT "Club_confederationId_fkey" FOREIGN KEY ("confederationId") REFERENCES public."Confederation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Game Game_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Game"
    ADD CONSTRAINT "Game_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: News News_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."News"
    ADD CONSTRAINT "News_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Profile Profile_clube_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_clube_fkey" FOREIGN KEY (clube) REFERENCES public."Times"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Profile Profile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Profile"
    ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Video Video_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Video"
    ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict pndV2fXfaVlT4wvc0fOByadYtitYjvhaH6Uq2ZnpLCKf5sr3kK64LUlTdJb7eLq

