import { component$, useStylesScoped$ } from '@builder.io/qwik';

interface CardAutoProps {
    make: string;
    model: string;
    year: number;
    price: number;
    imageUrl: string;
}

export const CardAuto = component$<CardAutoProps>(({ make, model, year, price, imageUrl }) => {
    useStylesScoped$(`
    .card {
      contain: content; /* Performance optimization */
    }
  `);

    return (
        <div class="card bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-500/50 transition-shadow duration-300">
            <div class="aspect-w-16 aspect-h-9 bg-slate-700">
                <img
                    src={imageUrl}
                    alt={`${make} ${model}`}
                    class="w-full h-full object-cover"
                    width="400"
                    height="225"
                    loading="lazy"
                    decoding="async"
                />
            </div>
            <div class="p-4">
                <h3 class="text-xl font-bold text-cyan-400">{make} {model}</h3>
                <p class="text-slate-400">{year}</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-2xl font-bold text-white">${price.toLocaleString()}</span>
                    <button class="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Ver Detalles
                    </button>
                </div>
            </div>
        </div>
    );
});
