import ReactMarkdown from 'react-markdown';

export const metadata = {
  title: "Privacidade e Termos | Vitrine de Craques",
};

const markdownContent = `
# Política de Privacidade e Termos de Uso

**Última atualização: 15 de agosto de 2025**

Bem-vindo à Vitrine de Craques. Sua privacidade é importante para nós.

## 1. Coleta de Informações

Coletamos informações que você nos fornece diretamente, como quando você cria uma conta, preenche um perfil ou envia vídeos. Isso inclui:

- **Dados de Identificação:** Nome, email, data de nascimento.
- **Dados de Perfil:** Posição, altura, cidade, estado, biografia, vídeos.
- **Comunicações:** Mensagens trocadas na plataforma.

## 2. Uso das Informações

Usamos suas informações para:

- Operar e manter a plataforma.
- Conectar atletas com agentes, olheiros e clubes.
- Personalizar sua experiência.
- Enviar notificações e comunicados importantes.

## 3. Compartilhamento de Informações

Seu perfil de atleta (incluindo nome, vídeos e dados de perfil) é público na plataforma e pode ser visto por outros usuários, incluindo agentes e clubes. Não compartilhamos seu email de contato diretamente sem sua permissão.

## 4. Seus Direitos

Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento através do seu painel de perfil.

## 5. Termos de Uso

Ao usar a Vitrine de Craques, você concorda em:

- Fornecer informações verdadeiras e precisas.
- Não enviar conteúdo que infrinja direitos autorais de terceiros.
- Manter uma conduta respeitosa com outros membros da comunidade.

Reservamo-nos o direito de remover conteúdo ou suspender contas que violem nossos termos.

## 6. Contato

Se tiver dúvidas sobre esta política, entre em contato conosco em [privacidade@vitrinedecraques.com](mailto:privacidade@vitrinedecraques.com).
`;

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="prose dark:prose-invert mx-auto">
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  );
}
