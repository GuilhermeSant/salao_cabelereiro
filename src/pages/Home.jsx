import { Link } from 'react-router-dom';
import { Scissors, Sparkles, Star, Anchor } from 'lucide-react';

const MustacheIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor" stroke="none" className={className}>
    <path d="M60.1,28.7c-5.8-0.9-10.8,1.4-14.7,4.8c-3.6,1.9-8.1,2-11.9,0.3c-0.6-0.3-1.4-0.8-2.1-1.3c-2.4-1.7-4.8-3.4-7.8-3.8c-7.9-1-14.8,3.2-18,10.6c-0.9,2.1-1.3,4.4-1,6.8c1,7.2,7.3,10.4,13.2,10.4c2.8,0,5.7-0.7,8.2-2.1c2-1.1,3.7-2.6,5-4.5c1.4,1.8,3,3.3,5,4.5c2.6,1.4,5.4,2.1,8.3,2.1c5.9,0,12.1-3.2,13.2-10.4c0.3-2.3-0.1-4.7-1-6.8C55.6,32.3,49.5,28.6,60.1,28.7z" />
  </svg>
);

export default function Home() {
  const handleScrollToServices = (e) => {
    e.preventDefault();
    const el = document.getElementById('servicos');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const services = [
    {
      id: 1,
      title: 'Cortes Masculinos',
      description: 'Corte social, degradê, barba e acabamento impecável com toalha quente.',
      price: 'R$ 80',
      icon: <Scissors className="w-10 h-10 text-amber-500" />,
      watermark: <Scissors className="w-48 h-48 text-amber-500" />
    },
    {
      id: 2,
      title: 'Cortes Femininos',
      description: 'Luzes, mechas, corte em camadas, finalização e hidratação profunda.',
      price: 'A partir de R$ 150',
      icon: <Star className="w-10 h-10 text-amber-500" />,
      watermark: <Star className="w-48 h-48 text-amber-500" />
    },
    {
      id: 3,
      title: 'Aplicação de Mega Hair',
      description: 'Técnicas variadas para alongamento natural, volume e beleza sem danos.',
      price: 'Consulta',
      icon: <Sparkles className="w-10 h-10 text-amber-500" />,
      watermark: <Sparkles className="w-48 h-48 text-amber-500" />
    },
    {
      id: 4,
      title: 'Barba Terapia',
      description: 'Tratamento completo com toalha quente, massagem facial, hidratação profunda e alinhamento perfeito.',
      price: 'R$ 45',
      icon: <MustacheIcon className="w-10 h-10 text-amber-500" />,
      watermark: <MustacheIcon className="w-48 h-48 text-amber-500" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center -mt-8">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/ddeqskcks/image/upload/v1773513607/Imagem_para_home_cabeleireiros_44a196746a_ehjkam.jpg" 
            alt="Interior do Salão" 
            className="w-full h-full object-cover grayscale-[10%]"
          />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white drop-shadow-xl selection:bg-amber-500/30 shadow-black">
            Sua Beleza, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600">Nossa Arte</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-neutral-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
            Descubra uma experiência premium de cuidado pessoal. Profissionais consagrados, ambiente sofisticado e resultados que transformam.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/agendar" className="border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black font-bold px-8 py-4 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300 transform hover:-translate-y-1 text-lg">
              Agendar Horário
            </Link>
            <a href="#servicos" onClick={handleScrollToServices} className="bg-transparent border-2 border-neutral-400 hover:border-amber-500 hover:text-amber-500 text-white font-medium px-8 py-4 rounded-full transition-all duration-300 text-lg cursor-pointer">
              Ver Serviços
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-24 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Nossos Serviços Principais</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-300 to-amber-600 mx-auto rounded-full mb-6"></div>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
              Oferecemos uma gama completa de serviços de beleza com os melhores produtos e técnicas para elevar o seu estilo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
               <div key={service.id} className="relative bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-2xl p-8 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(245,158,11,0.15)] flex flex-col h-full overflow-hidden">
                {/* Watermark do Ícone */}
                <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                  {service.watermark}
                </div>
                
                <div className="w-16 h-16 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center mb-6 z-10 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 z-10">{service.title}</h3>
                
                <p className="text-neutral-400 mb-8 flex-1 leading-relaxed z-10 relative">
                  {service.description}
                </p>
                
                <div className="flex flex-col gap-4 mt-auto z-10">
                  <span className="text-amber-500 font-bold text-xl">{service.price}</span>
                  <Link to="/agendar" className="w-full text-center border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black font-bold px-4 py-2.5 rounded-xl transition-all duration-300 uppercase tracking-wide text-sm">
                    Agendar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre Nós Section */}
      <section id="sobre" className="py-24 bg-neutral-950 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1974&auto=format&fit=crop" 
                alt="Ambiente do Salão Lumière" 
                className="rounded-3xl shadow-2xl shadow-neutral-900 border border-neutral-800 grayscale-[10%]"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-sm font-bold tracking-widest text-amber-500 uppercase mb-3">Nossa História</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">Tradição & Inovação</h3>
              <p className="text-neutral-300 text-lg leading-relaxed mb-6">
                Bem-vindo ao nosso espaço exclusivo, onde a tradição da barbearia clássica encontra a inovação dos salões de beleza modernos. Com um ambiente projetado para o seu máximo conforto, nossa equipe de especialistas domina desde o corte com acabamento impecável até as mais avançadas técnicas de visagismo, coloração e aplicação de Mega Hair.
              </p>
              <p className="text-neutral-300 text-lg leading-relaxed mb-8">
                Nosso compromisso é entregar não apenas um visual renovado, mas uma experiência completa de autocuidado, excelência e sofisticação.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-neutral-800">
                <div>
                  <h4 className="text-4xl font-extrabold text-amber-500 mb-2">10+</h4>
                  <p className="text-neutral-400 font-medium text-sm uppercase tracking-wide">Anos de Experiência</p>
                </div>
                <div>
                  <h4 className="text-4xl font-extrabold text-amber-500 mb-2">5k+</h4>
                  <p className="text-neutral-400 font-medium text-sm uppercase tracking-wide">Clientes Satisfeitos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contato */}
      <footer id="contato" className="bg-neutral-950 border-t border-neutral-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
               <div className="flex items-center gap-2 group mb-6 inline-flex">
                 <Scissors className="h-8 w-8 text-amber-500" />
                 <span className="text-2xl font-bold text-white tracking-wider">LUMIÈRE</span>
               </div>
               <p className="text-neutral-400 mb-6">
                 Experiência premium de autocuidado e beleza em Curitiba.
               </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Contato</h4>
              <ul className="space-y-4 text-neutral-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-amber-500">📍</span>
                  <span>Centro,<br/>Curitiba - PR</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-amber-500">📞</span>
                  <span>(41) 98888-7777</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-amber-500">✉️</span>
                  <span>contato@lumiere.com</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Horários</h4>
              <ul className="space-y-4 text-neutral-400">
                <li className="flex justify-between border-b border-neutral-800 pb-2">
                  <span>Seg - Sex</span>
                  <span className="text-white">09:00 - 18:00</span>
                </li>
                <li className="flex justify-between border-b border-neutral-800 pb-2">
                  <span>Sábado</span>
                  <span className="text-white">09:00 - 15:00</span>
                </li>
                <li className="flex justify-between pb-2">
                  <span>Domingo</span>
                  <span className="text-amber-500">Fechado</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-1 h-48 rounded-2xl overflow-hidden border border-neutral-800">
               <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115234.3312948637!2d-49.351227092892994!3d-25.495033789091845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dce41197a8443c%3A0x6bd7fc8e4ea76db2!2sCentro%2C%20Curitiba%20-%20PR!5e0!3m2!1spt-BR!2sbr!4v1709400000000!5m2!1spt-BR!2sbr" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa do Salão no Centro de Curitiba"
              ></iframe>
            </div>
          </div>
          
          <div className="pt-8 border-t border-neutral-800 text-center text-neutral-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Salão Lumière. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
