export const metadata = {
  title: "Sobre Nós | Vitrine de Craques",
};

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Sobre a Vitrine de Craques</h1>
          <p className="mt-2 text-lg text-muted-foreground">Conectando sonhos a oportunidades no mundo do futebol.</p>
        </div>

        <div className="prose dark:prose-invert mx-auto">
          <h2>Nossa Missão</h2>
          <p>
            Nossa missão é democratizar o acesso ao mundo do futebol profissional, oferecendo uma plataforma digital onde jovens talentos de 14 a 22 anos possam exibir suas habilidades diretamente para um público qualificado de agentes, olheiros e clubes.
          </p>

          <h2>Visão</h2>
          <p>
            Ser a maior e mais confiável plataforma de descoberta de talentos do futebol no mundo, transformando a maneira como o esporte encontra suas futuras estrelas e garantindo que nenhum talento passe despercebido.
          </p>

          <h2>Valores</h2>
          <ul>
            <li><strong>Oportunidade:</strong> Acreditamos que todo jovem talentoso merece uma chance.</li>
            <li><strong>Integridade:</strong> Operamos com transparência e segurança para proteger nossos usuários.</li>
            <li><strong>Paixão:</strong> Somos movidos pela paixão pelo futebol e pelo desenvolvimento de jovens atletas.</li>
            <li><strong>Inovação:</strong> Usamos a tecnologia para quebrar barreiras e criar conexões.</li>
          </ul>

          <h2>O Instituto Vitrine de Craques</h2>
          <p>
            Além da plataforma, o Instituto Vitrine de Craques é nosso braço social, focado em promover a inclusão social através do esporte, oferecendo treinamento, educação e suporte para jovens em comunidades carentes.
          </p>

          <h2>Contato</h2>
          <p>
            Tem alguma dúvida ou sugestão? Entre em contato conosco!
          </p>
          <address className="not-italic">
            <strong>Email:</strong> <a href="mailto:contato@vitrinedecraques.com">contato@vitrinedecraques.com</a><br />
            <strong>Endereço:</strong> Rua Fictícia, 123, São Paulo - SP, CEP 01234-567, Brasil
          </address>
        </div>
      </div>
    </div>
  );
}
