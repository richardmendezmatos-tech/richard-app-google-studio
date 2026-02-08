import { motion, AnimatePresence } from 'framer-motion';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 50,
            damping: 15
        }
    }
};

const VirtualInventory: React.FC<VirtualInventoryProps> = ({
    cars,
    onSelectCar,
    onCompare,
    isComparing,
    isSaved,
    onToggleSave,
    customerMemory
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

    // Grid configuration
    const itemHeight = 450; // Estimated height of PremiumGlassCard + gap
    const columns = typeof window !== 'undefined' && window.innerWidth >= 1280 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    const rowCount = Math.ceil(cars.length / columns);
    const totalHeight = rowCount * itemHeight;

    useEffect(() => {
        const updateVisibleRange = () => {
            if (!containerRef.current) return;

            const gridTop = containerRef.current.getBoundingClientRect().top;
            const viewportHeight = window.innerHeight;
            const offset = Math.max(0, -gridTop);

            const startRow = Math.floor(offset / itemHeight);
            const visibleRows = Math.ceil(viewportHeight / itemHeight) + 1;
            const endRow = Math.min(rowCount, startRow + visibleRows + 1);

            setVisibleRange({
                start: Math.max(0, startRow * columns),
                end: Math.min(cars.length, endRow * columns)
            });
        };

        window.addEventListener('scroll', updateVisibleRange);
        window.addEventListener('resize', updateVisibleRange);

        updateVisibleRange();

        return () => {
            window.removeEventListener('scroll', updateVisibleRange);
            window.removeEventListener('resize', updateVisibleRange);
        };
    }, [cars.length, columns, rowCount]);

    const visibleCars = useMemo(() => {
        return cars.slice(visibleRange.start, visibleRange.end);
    }, [cars, visibleRange]);

    /**
     * Recommendation Engine (Phase 17)
     * Checks if a car matches the customer's persisted preferences.
     */
    const checkRecommendation = (car: Car): boolean => {
        if (!customerMemory?.preferences) return false;

        const { models, colors, features } = customerMemory.preferences;

        // 1. Model Match
        if (models?.some(m => car.name.toLowerCase().includes(m.toLowerCase()))) return true;

        // 2. Color Match
        if (colors?.some(c => car.name.toLowerCase().includes(c.toLowerCase()))) return true;

        // 3. Feature Match
        if (features?.some(f => car.name.toLowerCase().includes(f.toLowerCase()))) return true;

        // 4. Lifestyle Match
        const lifestyle = customerMemory.lifestyle?.toLowerCase() || '';
        if (lifestyle.includes('off-road') && car.name.toLowerCase().includes('4x4')) return true;
        if (lifestyle.includes('family') && (car.type === 'suv' || car.name.toLowerCase().includes('tucson'))) return true;

        return false;
    };

    const translateY = Math.floor(visibleRange.start / columns) * itemHeight;

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.height = totalHeight > 0 ? `${totalHeight}px` : 'auto';
        }
        if (gridRef.current) {
            gridRef.current.style.transform = `translateY(${translateY}px)`;
        }
    }, [totalHeight, translateY]);

    return (
        <div
            ref={containerRef}
            className="relative"
        >
            <motion.div
                ref={gridRef}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 absolute top-0 left-0 right-0"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <AnimatePresence mode="popLayout">
                    {visibleCars.map((car) => (
                        <motion.div
                            key={car.id}
                            className="h-[450px]"
                            variants={cardVariants}
                            layout
                        >
                            <PremiumGlassCard
                                car={car}
                                onSelect={() => onSelectCar(car)}
                                onCompare={(e) => onCompare(e, car)}
                                isComparing={isComparing(car.id)}
                                isSaved={isSaved(car.id)}
                                onToggleSave={(e) => onToggleSave(e, car.id)}
                                isRecommended={checkRecommendation(car)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
            {cars.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Placeholder handled by parent */}
                </div>
            )}
        </div>
    );
};

export default VirtualInventory;
