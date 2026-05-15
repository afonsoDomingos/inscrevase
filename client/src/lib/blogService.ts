import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: 'guide' | 'marketing' | 'mentoring' | 'engagement' | 'event' | 'case-study';
    coverImage: string;
    author: {
        name: string;
        avatar: string;
    };
    readTime: number;
    tags: string[];
    published: boolean;
    publishedAt?: string;
    likes?: string[];
    comments?: {
        user: {
            id: string;
            name: string;
            avatar: string;
        };
        text: string;
        createdAt: string;
    }[];
    views: number;
    createdAt: string;
    updatedAt: string;
}

const defaultFallbackPosts: BlogPost[] = [
    {
        _id: 'fallback-1',
        title: "O Guia Completo para Organizar Eventos Presenciais e Híbridos Inesquecíveis",
        slug: "guia-completo-organizar-eventos-presenciais-hibridos",
        excerpt: "Aprenda o passo a passo definitivo para planear, gerir inscrições e executar eventos presenciais e híbridos que deixam uma marca na audiência.",
        content: `
<h2>1. Introdução à Nova Era de Eventos</h2>
<p>Organizar eventos mudou drasticamente. Já não basta alugar uma sala e convidar pessoas. Os participantes hoje exigem uma experiência sem atrito, desde o momento em que veem o link de inscrição até ao envio do certificado final.</p>
<p>Para conseguir a aprovação e satisfação máxima do seu público, a chave está num planeamento metódico e na utilização da tecnologia, como a plataforma Inscreva-se, que automatiza todo o processo de gestão.</p>

<h2>2. Planeamento Antes do Lançamento</h2>
<p>O primeiro passo é sempre a identificação do objetivo do evento. É uma formação? Uma masterclass de introdução a vendas? Um seminário de mentoria intensiva? Tudo isso ditará a forma como vai estruturar a sua página de inscrição.</p>
<ul>
    <li><b>Identifique as Personas:</b> Saiba a quem se dirige. Um tom mais formal para executivos, ou mais dinâmico para jovens empreendedores?</li>
    <li><b>Defina Metas e Vagas:</b> Criar um sentimento de escassez (ex: "Apenas 50 vagas!") é a tática de marketing que mais resultados traz.</li>
    <li><b>Prepare os Conteúdos:</b> Qual o valor que os participantes vão retirar? Descreva-o claramente na área de informações do evento.</li>
</ul>

<h2>3. Vantagens dos Modelos Híbridos</h2>
<p>Os eventos híbridos vieram para ficar. Permitem que venda bilhetes a um valor premium para os participantes presenciais (oferecendo networking físico, coffe breaks) enquanto escala o seu alcance vendendo inscrições digitais para todo o país e mundo.</p>
<p>Na Inscreva-se, pode configurar formulários distintos ou usar opções extra para quem deseja apenas o acesso live board ou assistir presencialmente.</p>

<h2>4. Comunicação e Seguimento (Follow-Up)</h2>
<p>Um erro crasso de muitos organizadores é esquecer-se de comunicar os detalhes logísticos antes do dia "D". Enviar lembretes automatizados por email e WhatsApp não só diminui a taxa de ausência (no-show) como eleva o nível de profissionalismo.</p>
<p>Recomendamos o envio de 3 comunicações chave: a confirmação imediata, o lembrete a 48H e a mensagem a 2H do início contendo o link da sala ou o endereço físico exato.</p>

<h2>5. O Pós-Evento: Fidelização e Certificados</h2>
<p>O que acontece após as palmas finais? A emissão do certificado é um gatilho mental de conclusão para o aluno. Automatizar a entrega de certificados poupa horas de trabalho administrativo e garante que o seu impacto perdura.</p>
<p>Abrace estas estratégias, utilize ferramentas de excelência, e veja o nível qualitativo e de faturação dos seus próximos eventos a atingir novos horizontes.</p>
        `,
        category: "guide",
        coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
        author: {
            name: "Equipe Inscreva-se",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
        },
        readTime: 6,
        tags: ["Gestão", "Eventos", "Guia", "Marketing"],
        published: true,
        publishedAt: new Date().toISOString(),
        views: 1250,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'fallback-2',
        title: "5 Estratégias Imbatíveis para Aumentar a Venda dos Seus Cursos",
        slug: "5-estrategias-imbativeis-para-aumentar-a-venda-de-cursos",
        excerpt: "Se tem dificuldades em encher a sala das suas formações, estas 5 táticas validadas vão triplicar a conversão das suas páginas de captura.",
        content: `
<h2>A Nova Concorrência na Formação</h2>
<p>Hoje em dia, criar um bom curso não é suficiente. A barreira de entrada diminuiu, e os seus potenciais alunos estão a ser bombardeados com dezenas de ofertas similares todos os dias. O que separa um mentoria vazia de uma sala cheia (presencial ou virtual)? Estratégia de marketing agressiva e bem fundamentada.</p>

<h2>1. Copywriting Direcionado à Dor</h2>
<p>A sua página de registo (Landing Page) não deve focar-se apenas nos módulos que vai ensinar. "Módulo 1: Introdução à Gestão Financeira" não vende. O que vende é: "Como parar de perder dinheiro ao final do mês e controlar o seu lucro". As pessoas não compram aulas, compram transformações. Revise o seu texto!</p>

<h2>2. Prova Social no Formulário</h2>
<p>Um gatilho mental importantíssimo. Se usa a Inscreva-se, garanta que a opção de demonstrar ou referir edições anteriores está presente. Adicione testemunhos reais (em texto ou vídeo se usar ads) à página de conversão. Se for a sua primeira edição, mencione que é uma turma fundadora e por isso tem valor especial.</p>

<h2>3. Segmentação Profunda por E-mail</h2>
<p>E-mails "frios" morrem na caixa de entrada. Mas um email bem segmentado que aborde o desafio específico que a persona tem funciona muito bem. Ofereça um Mini e-book gratuito, capture o email e crie um fluxo contínuo de nutrição até vender a mentoria premium.</p>

<h2>4. Escassez Real</h2>
<p>"Inscrições abrem apenas 3 vezes ao ano." A limitação de vagas deve ser genuína e técnica. Nas plataformas de gestão, bloqueie a receção de mais inscrições assim que o limite de alunos for atingido. O "FOMO" (Fear Of Missing Out) gerado por campanhas honestamente escassas leva os curiosos a decidir rápido.</p>

<h2>5. Facilidade de Pagamento Instantâneo</h2>
<p>Cada clique extra diminui a conversão em cerca de 7 a 10%. Ter o upload de comprovativos integrado ou sistemas M-Pesa diretos ajuda muito. Não peça informações como "Rua e Porta" se o evento é online. Facilite o Funil!</p>
<p>Implemente estes cinco passos nas suas campanhas de Facebook Ads e Google Ads, enviando tráfego qualificado para formulários convertivos, e os resultados não tardarão.</p>
        `,
        category: "marketing",
        coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
        author: {
            name: "Equipe Inscreva-se",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
        },
        readTime: 5,
        tags: ["Vendas", "Cursos", "Marketing", "Estratégia"],
        published: true,
        publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        views: 890,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'fallback-3',
        title: "Qual a Diferença entre Mentoria e Consultoria? Como Escalar o Seu Talento.",
        slug: "diferenca-entre-mentoria-e-consultoria-como-escalar",
        excerpt: "Descubra qual é o modelo certo para monetizar os seus conhecimentos e como pode gerir centenas de alunos sem perder exclusividade.",
        content: `
<h2>A Confusão de Conceitos no Mercado</h2>
<p>Muitos profissionais sentem necessidade de escalar a sua carreira e deparam-se com um dilema: devo tornar-me consultor ou mentor? Ambas são vias super lucrativas, no entanto, as metodologias, processos de venda, e a entrega final diferem absurdamente.</p>

<h2>Consultoria: O Especialista "Mão na Massa"</h2>
<p>Num processo de consultoria, uma empresa ou indivíduo foca-se na contratação de um especialista com o objetivo de obter **soluções exatas**. O consultor analisa o problema, efetua auditoria e, em muitos casos, entrega um plano de ação estrito ou ajuda a implementar a própria solução. É um serviço *"Done For You"* ou *"Done With You"* de alta intensidade.</p>
<p><strong>Escalabilidade:</strong> Baixa. Vende o seu tempo e mão-de-obra.</p>

<h2>Mentoria: O Guia Estratégico e Aconselhamento</h2>
<p>O Mentor é um indivíduo experiente que atua como bússola para o Mentorado. O Mentor já esteve onde o cliente deseja chegar. Ele aconselha, dá suporte moral, analisa criticamente planos, porém **não implementa soluções diretamente**. É um caminho *"Do It Yourself"* (faz tu mesmo) acelerado. Para isto a plataforma como a Inscreva-se possui os "Live Boards" — uma sala onde se partilham quadros online num ambiente intimista e fechado de alto valor. </p>
<p><strong>Escalabilidade:</strong> Muito Alta, especialmente nas mentorias de grupo e *Masterminds*. Pode acomodar e orientar 10 a 50 pessoas por mês faturando muito mais utilizando os meios do conhecimento sem o peso do trabalho de estaleiro.</p>

<h2>Vender Mentoria Através de Masterclasses</h2>
<p>A melhor forma de lotar as suas mentorias premium não é pedindo para clicarem num link num biógrafo do Instagram. A melhor estratégia passa por criar "Workshops / Semanas Introdutórias", usar uma página atraente de inscrições e, durante três a quatro aulas de elevado nível técnico, ancorar a venda da mentoria de acompanhamento como próximo degrau vitalício.</p>
        `,
        category: "mentoring",
        coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200",
        author: {
            name: "Equipe Inscreva-se",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
        },
        readTime: 4,
        tags: ["Mentoria", "Consultoria", "Empreendedorismo"],
        published: true,
        publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        views: 1400,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'fallback-4',
        title: "A Importância da Cores no Design do Evento: Convertendo Acessos em Alunos",
        slug: "importancia-das-cores-design-de-evento-para-converter-alunos",
        excerpt: "A paleta de cores errada pode estar a destruir a sua taxa de conversão. Aprenda psicologia de cor e como utilizá-la nos seus formulários.",
        content: `
<h2>Não é Só Uma Questão Estética</h2>
<p>Muitos ignoram o "feeling" que um website emana. Um formulário de registo para um curso de Direito não deveria usar fontes da Disney, nem um evento de criatividade infantil deveria apresentar tons cinza monocromáticos. Compreender a Psicologia da Cor é crucial para elevar a "Aura" (Aura AI) e a sofisticação da sua marca.</p>

<h2>O Amarelo Dourado e Ouro (Premium/Confiança)</h2>
<p>Se utiliza no seu Marketing termos como 'VIP', 'Exclusivo' e 'Premium', o contraste de um fundo preto com dourado/amarelo é inestimável. Representam a realeza, a energia superior, prosperidade material e conhecimento brilhante. O cérebro confere instintivamente um valor monetário elevadíssimo ao dourado, garantindo uma maior predisposição dos usuários a investirem nos seus bilhetes.</p>

<h2>Azul Marinho VS Laranja Dinâmico</h2>
<p>O <strong>Azul Marinho</strong> é universalmente percebido como cor da Confiança, Resiliência, Solidez Financeira e Seguridade no Digital (é por algo que a maioria dos bancos e softwares usam Azul no Logotipo). Para áreas que dependem de factos comprovados e alta proteção emocional, Azul e Branco são aposta certa.</p>
<p>O <strong>Laranja</strong> ou <strong>Rosa Chiclete (Teal)</strong> e cores chamativas incitam inovação visual, alerta constante e juventude.</p>

<h2>Implementação no Botão "Submeter"</h2>
<p>O Design UI dita a obrigatoriedade de ter botões altamente contrastantes. Se a sua página tem predominância escura, um botão Amarelo incitará um instinto mecânico para avançar para a próxima etapa.</p>
<p>A Personalização Dinâmica das Cores nos formulários da plataforma permite adequar todas as semanas o design, consoante a urgência das campanhas ou das datas de encerramento da bilheteira.</p>
        `,
        category: "engagement",
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
        author: {
            name: "Equipe Inscreva-se",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
        },
        readTime: 3,
        tags: ["Design", "Experiência", "Conversão"],
        published: true,
        publishedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        views: 650,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'fallback-5',
        title: "Tecnologias de Interação: O Segredo para Manter Auditórios Live Concentrados",
        slug: "tecnologias-de-interacao-o-segredo-de-auditorios-virtuais",
        excerpt: "O digital exige ritmos dinâmicos. Sem interação tátil e visual ao vivo (Live Boards, quizz), os alunos perdem o interesse na primeira meia-hora.",
        content: `
<h2>A Armadilha do Monólogo Digital</h2>
<p>A taxa de abandono (drop-off rate) durante transmissões remotas longas varia entre os 40% a 65% nos primeiros quarenta minutos. Tudo isso indica apenas uma coisa: a capacidade da audiência aturar monólogos não excedeu a janela atencional natural do século moderno. Por que motivo há mentores a faturar milhões e a segurarem formandos por dezenas de horas enquanto outros perdem a sala nas apresentações incipientes?</p>

<h2>O Advento dos Live Boards e Whiteboards Virtuais</h2>
<p>Como humanos, somos seres profundamente visuais. Ver uma pessoa a rabiscar um esquema, criar tabelas ao vivo como se a frente de um "Quadro Negro" estivesse, ou sublinhar ativamente um processo conceptual traz um gatilho de *Novidade* permanente que mantém a atenção focada na tela.</p>
<p>Quando utiliza os <em>Live Boards</em> providenciados pelo Hub Sala de Eventos, consegue transformar a sua voz num modelo prático visório. O cérebro necessita constantemente de mudanças percetivas nos padrões da apresentação, como uma troca de Cor do giz que utiliza no tablet.</p>

<h2>Sessões de Q&A Dinâmicas e Enquetes (Polls)</h2>
<p>Incorpore ciclos de perguntas diretas aos participantes. Através do Chat Integrado, as sessões de Perguntas e Respostas ganham relevo porque os membros começam a criar sentimento de Tribo/Comunidade pela identificação das dificuldades alheias. Adicionalmente, levantar a Mão para realizar uma pergunta técnica garante aos alunos o seu sentimento de respeito pelos oradores.</p>

<h2>O Contágio da Expectativa (Countdown Timer)</h2>
<p>Nada funciona mais espetacularmente que prender o utilizador com música contagiante e um "Temporizador Decrescente", um "Countdown Timer". Os trinta minutos antecedentes de antecipação do som do vivo constroem uma predisposição orgânica, transformando espectadores casuais em Estudantes sedentes de mudança na vida deles.</p>
        `,
        category: "event",
        coverImage: "https://images.unsplash.com/photo-1475721025505-23faad5a9295?auto=format&fit=crop&q=80&w=1200",
        author: {
            name: "Equipe Inscreva-se",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
        },
        readTime: 7,
        tags: ["Tecnologia", "Inovação", "Aula"],
        published: true,
        publishedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        views: 2200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'fallback-6',
        title: "Como Criar um Curso Online do Zero: Da Ideia ao Primeiro Aluno",
        slug: "como-criar-um-curso-online-do-zero",
        excerpt: "Transforme o seu conhecimento em um produto digital lucrativo. Siga o nosso roteiro passo a passo para lançar a sua primeira formação online.",
        content: `
<h2>O Boom do Ensino Digital</h2>
<p>Nunca houve um momento melhor para partilhar o que sabe. O mercado de e-learning está a explodir em Angola e Moçambique. Mas por onde começar? Muitos ficam presos na parte técnica, quando o segredo está na metodologia e na audiência.</p>

<h2>1. Definição do Tópico e Validação</h2>
<p>Não crie o curso inteiro antes de saber se alguém o quer comprar. Faça uma enquete no seu Instagram ou LinkedIn. Ofereça uma aula gratuita (Webinar) e veja a adesão. Se 20 pessoas se inscreverem para a aula grátis, tem um produto em mãos.</p>

<h2>2. Estruturação do Conteúdo (Ementa)</h2>
<p>Divida o seu conhecimento em módulos lógicos. Comece pelo "Porquê", passe para o "Como" e termine com "Estudos de Caso". Use ferramentas de mapas mentais para visualizar a jornada do aluno.</p>

<h2>3. Gravação e Equipamento</h2>
<p>Não precisa de um estúdio de TV. Um smartphone moderno e um microfone de lapela barato são suficientes para começar. O mais importante é a iluminação e a clareza do áudio. Se o áudio for ruim, o aluno abandona o curso.</p>

<h2>4. Escolha da Plataforma</h2>
<p>Utilize plataformas que facilitem a gestão de inscrições e o acesso dos alunos. Ter um ambiente profissional aumenta a percepção de valor e permite cobrar preços mais altos (High Ticket).</p>
        `,
        category: "mentoring",
        coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
        author: {
            name: "Afonso Domingos",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
        },
        readTime: 8,
        tags: ["Cursos", "E-learning", "Mentoria"],
        published: true,
        publishedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        views: 3100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'fallback-7',
        title: "A Importância do Networking em Eventos Presenciais para a sua Carreira",
        slug: "importancia-networking-eventos-presenciais",
        excerpt: "Em um mundo digital, o contacto físico continua a ser a ferramenta mais poderosa de vendas e parcerias. Descubra como aproveitar cada evento.",
        content: `
<h2>O Poder do Aperto de Mão</h2>
<p>Podemos fazer reuniões por Zoom, mas a confiança profunda é construída pessoalmente. Eventos presenciais são o terreno fértil para parcerias estratégicas que podem mudar o rumo do seu negócio em uma tarde.</p>

<h2>1. Prepare o seu 'Elevator Pitch'</h2>
<p>Saiba explicar o que faz em 30 segundos. Não foque no seu cargo, mas no problema que resolve. "Eu ajudo empresas a reduzirem custos logísticos" é melhor que "Sou consultor de logística".</p>

<h2>2. Escute Mais do que Fala</h2>
<p>O melhor networker é aquele que se interessa genuinamente pelas dificuldades dos outros. Faça perguntas abertas. As pessoas adoram falar sobre os seus desafios, e é aí que você identifica oportunidades de ajudar.</p>

<h2>3. O Acompanhamento (Follow-up) é Tudo</h2>
<p>De nada serve coleccionar cartões ou contactos de WhatsApp se não enviar uma mensagem no dia seguinte. "Gostei muito de conversar sobre o tema X, vamos marcar um café?" é a frase que fecha negócios.</p>
        `,
        category: "event",
        coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200",
        author: {
            name: "Equipe Inscreva-se",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
        },
        readTime: 6,
        tags: ["Networking", "Carreira", "Eventos"],
        published: true,
        publishedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        views: 1800,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        _id: 'fallback-8',
        title: "Como Usar o M-Pesa e Multicaixa para Vender Bilhetes Online",
        slug: "como-usar-mpesa-multicaixa-vender-bilhetes",
        excerpt: "Facilite o pagamento para os seus clientes. Aprenda como integrar os métodos mais usados em Angola e Moçambique no seu processo de vendas.",
        content: `
<h2>A Barreira do Pagamento</h2>
<p>Muitos organizadores perdem vendas porque o processo de pagamento é complicado. Em África, o dinheiro móvel e os sistemas locais são reis. Se não oferece M-Pesa ou Multicaixa, está a ignorar 80% do seu mercado.</p>

<h2>1. A Conveniência do M-Pesa</h2>
<p>Em Moçambique, o M-Pesa é a ferramenta de inclusão financeira por excelência. Ter um sistema que permite ao cliente pagar instantaneamente pelo telemóvel e receber o bilhete por SMS ou Email é um diferencial competitivo enorme.</p>

<h2>2. O Sistema Multicaixa em Angola</h2>
<p>Para o mercado angolano, o Multicaixa Express e as referências de pagamento são vitais. Automatizar a verificação desses pagamentos poupa horas de conferência manual de extractos bancários.</p>

<h2>3. Segurança e Confiança</h2>
<p>Ao usar uma plataforma intermediária, você passa segurança para o comprador. Ele sabe que se o evento for cancelado, existe um suporte. E você, organizador, tem a certeza de que o valor caiu na conta antes de emitir o bilhete.</p>
        `,
        category: "marketing",
        coverImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1200",
        author: {
            name: "Afonso Domingos",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
        },
        readTime: 5,
        tags: ["Pagamentos", "Finanças", "Angola", "Moçambique"],
        published: true,
        publishedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        views: 4500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export const blogService = {
    // Get all published posts (public)
    async getPublishedPosts(): Promise<BlogPost[]> {
        try {
            const response = await axios.get(`${API_URL}/blog`);
            if (response.data && response.data.length > 0) {
                return response.data;
            }
        } catch (error) {
            console.error('API Error, falling back to default posts', error);
        }
        return defaultFallbackPosts;
    },

    // Get all posts including drafts (admin only)
    async getAllPosts(token: string): Promise<BlogPost[]> {
        const response = await axios.get(`${API_URL}/blog/admin/all`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    // Get single post by slug
    async getPostBySlug(slug: string): Promise<BlogPost> {
        try {
            const response = await axios.get(`${API_URL}/blog/${slug}`);
            if (response.data) {
                return response.data;
            }
        } catch (error) {
            const fallback = defaultFallbackPosts.find(p => p.slug === slug);
            if (fallback) return fallback;
            throw error;
        }
        const fallback = defaultFallbackPosts.find(p => p.slug === slug);
        if (fallback) return fallback;
        throw new Error('Post not found');
    },

    // Create new post (admin only)
    async createPost(token: string, postData: Partial<BlogPost>): Promise<BlogPost> {
        const response = await axios.post(`${API_URL}/blog`, postData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    // Update post (admin only)
    async updatePost(token: string, id: string, postData: Partial<BlogPost>): Promise<BlogPost> {
        const response = await axios.put(`${API_URL}/blog/${id}`, postData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    // Delete post (admin only)
    async deletePost(token: string, id: string): Promise<void> {
        await axios.delete(`${API_URL}/blog/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    // Upload image (admin only)
    async uploadImage(token: string, file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(`${API_URL}/blog/upload-image`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Like/Unlike a post
    async likePost(token: string, id: string): Promise<{ likes: string[] }> {
        const response = await axios.post(`${API_URL}/blog/${id}/like`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    // Add comment to a post
    async addComment(token: string, id: string, commentData: { text: string; userName?: string; userAvatar?: string }): Promise<BlogPost['comments']> {
        const response = await axios.post(`${API_URL}/blog/${id}/comment`, commentData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    },

    // Subscribe to newsletter
    async subscribeToNewsletter(email: string): Promise<{ message: string }> {
        const response = await axios.post(`${API_URL}/newsletter/subscribe`, { email });
        return response.data;
    },
};
