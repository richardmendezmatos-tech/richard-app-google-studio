import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { useCarCatalog } from '../loaders';
import { CardAuto } from '../components/card-auto/card-auto';

export default component$(() => {
    const cars = useCarCatalog();

    return (
        <div class="container mx-auto px-4 py-8">
            <header class="mb-12 text-center">
                <h1 class="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-4">
                    Richard Automotive AI
                </h1>
                <p class="text-xl text-slate-400 max-w-2xl mx-auto">
                    Descubre tu próximo auto con el poder de la Inteligencia Artificial.
                </p>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cars.value.map((car) => (
                    <CardAuto
                        key={car.id}
                        make={car.make}
                        model={car.model}
                        year={car.year}
                        price={car.price}
                        imageUrl={car.image_url}
                    />
                ))}
            </div>

            {cars.value.length === 0 && (
                <div class="text-center py-20 text-slate-500">
                    No se encontraron autos. Verifica la conexión a Supabase.
                </div>
            )}
        </div>
    );
});

export const head: DocumentHead = {
    title: 'Richard Automotive - AI Marketplace',
    meta: [
        {
            name: 'description',
            content: ' Encuentra los mejores autos con inteligencia artificial.',
        },
    ],
};
