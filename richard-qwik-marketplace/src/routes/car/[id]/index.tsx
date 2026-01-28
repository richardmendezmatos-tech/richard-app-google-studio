import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '../../../env';
import { type Car } from '../../../loaders';

// Server-Side Loader: Fetch single car by ID
export const useCarDetails = routeLoader$(async (requestEvent) => {
    const carId = requestEvent.params.id;

    const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

    const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();

    if (error || !data) {
        // Redirect or return null to handle 404 in component
        requestEvent.status(404);
        return null;
    }

    return data as Car;
});

export default component$(() => {
    const carSignal = useCarDetails();
    const car = carSignal.value;

    if (!car) {
        return (
            <div class="min-h-screen flex items-center justify-center text-slate-400">
                <h1 class="text-3xl">Auto no encontrado 😕</h1>
            </div>
        );
    }

    return (
        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Section */}
                <div class="rounded-2xl overflow-hidden shadow-2xl bg-slate-800">
                    <img
                        src={car.image_url}
                        alt={`${car.make} ${car.model}`}
                        class="w-full h-full object-cover aspect-video"
                    />
                </div>

                {/* Details Section */}
                <div class="flex flex-col justify-center space-y-6">
                    <div>
                        <h2 class="text-cyan-400 font-bold uppercase tracking-wide text-sm">{car.make}</h2>
                        <h1 class="text-5xl font-extrabold text-white mt-2">{car.model}</h1>
                        <div class="flex items-center space-x-4 mt-4">
                            <span class="px-3 py-1 bg-slate-700 text-white rounded-full text-sm">{car.year}</span>
                            <span class="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm">Disponible</span>
                        </div>
                    </div>

                    <p class="text-slate-300 text-lg leading-relaxed">
                        {car.description || "Un vehículo increíble listo para la carretera. Contáctanos para más detalles."}
                    </p>

                    <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 class="text-xl font-bold text-white mb-4">Especificaciones</h3>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            {car.specs && Object.entries(car.specs).map(([key, value]) => (
                                <div key={key} class="flex justify-between border-b border-slate-700 pb-2 last:border-0">
                                    <span class="text-slate-400 capitalize">{key}</span>
                                    <span class="text-white font-medium">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div class="flex items-end justify-between pt-6 border-t border-slate-700">
                        <div>
                            <p class="text-slate-400 text-sm">Precio de lista</p>
                            <p class="text-4xl font-bold text-white">${car.price.toLocaleString()}</p>
                        </div>
                        <button class="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-900/50">
                            Contactar Vendedor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export const head: DocumentHead = ({ resolveValue }) => {
    const car = resolveValue(useCarDetails);
    return {
        title: car ? `${car.make} ${car.model} | Richard Automotive` : 'Auto no encontrado',
        meta: [
            {
                name: 'description',
                content: car ? `Compra este ${car.year} ${car.make} ${car.model} por $${car.price}.` : 'Detalles del vehículo.',
            },
        ],
    };
};
