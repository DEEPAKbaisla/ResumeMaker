import React from "react";
import { MessageSquareQuote } from "lucide-react";

const Testimonial = () => {
  const cardsData = [
    {
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
      name: "Briar Martin",
      handle: "@neilstellar",
      text: "ResumeMaker made it incredibly easy to build a professional resume in minutes. Highly recommended!"
    },
    {
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
      name: "Avery Johnson",
      handle: "@averywrites",
      text: "The ATS templates got me past the automated screens and straight to the interview stage."
    },
    {
      image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
      name: "Jordan Lee",
      handle: "@jordantalks",
      text: "I love the sleek UI and the AI content generation feature. It saved me hours of brainstorming."
    },
    {
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60",
      name: "Morgan Smith",
      handle: "@morgan_dev",
      text: "Finally, a resume builder that doesn't feel clunky. The new aesthetic is a huge plus."
    },
  ];

  const CreateCard = ({ card }) => (
    <div className="p-6 rounded-2xl mx-4 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 w-80 shrink-0 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <MessageSquareQuote size={40} className="text-slate-900" />
      </div>
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <img
          className="size-12 rounded-full border border-slate-200"
          src={card.image}
          alt="User Image"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-slate-800">{card.name}</p>
            <svg className="size-3 text-green-500 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <span className="text-sm text-slate-500">{card.handle}</span>
        </div>
      </div>
      <p className="text-slate-700 text-sm leading-relaxed relative z-10">
        "{card.text}"
      </p>
    </div>
  );

  return (
    <div className="flex flex-col items-center py-20 bg-slate-50 overflow-hidden">
      
      <div className="flex items-center gap-2 text-sm text-green-700 border border-green-200 bg-green-100 rounded-full px-5 py-1.5 mb-6 shadow-sm">
        <MessageSquareQuote width={14} className="text-green-600" />
        <span className="font-medium">Testimonials</span>
      </div>
      
      <div className="max-w-3xl text-center mb-16 px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Don't just take our word for it</h2>
        <p className="text-slate-600 text-lg">
          Join thousands of professionals who have already accelerated their careers using our platform.
        </p>
      </div>

      <div className="marquee-row w-full max-w-7xl mx-auto overflow-hidden relative pb-8">
        <div className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none bg-gradient-to-r from-slate-50 to-transparent"></div>
        <div className="marquee-inner flex transform-gpu min-w-[200%]">
          {[...cardsData, ...cardsData].map((card, index) => (
            <CreateCard key={index} card={card} />
          ))}
        </div>
        <div className="absolute right-0 top-0 h-full w-32 z-10 pointer-events-none bg-gradient-to-l from-slate-50 to-transparent"></div>
      </div>

      <div className="marquee-row w-full max-w-7xl mx-auto overflow-hidden relative">
        <div className="absolute left-0 top-0 h-full w-32 z-10 pointer-events-none bg-gradient-to-r from-slate-50 to-transparent"></div>
        <div className="marquee-inner marquee-reverse flex transform-gpu min-w-[200%]">
          {[...cardsData, ...cardsData].map((card, index) => (
            <CreateCard key={index} card={card} />
          ))}
        </div>
        <div className="absolute right-0 top-0 h-full w-32 z-10 pointer-events-none bg-gradient-to-l from-slate-50 to-transparent"></div>
      </div>

      <style>{`
        @keyframes marqueeScroll {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
        }

        .marquee-inner {
            animation: marqueeScroll 25s linear infinite;
        }

        .marquee-inner:hover {
            animation-play-state: paused;
        }

        .marquee-reverse {
            animation-direction: reverse;
        }
      `}</style> 
    </div>
  );
};

export default Testimonial;
