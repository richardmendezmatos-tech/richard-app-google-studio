
import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Car } from '@/types/types';
import { optimizeImage } from '@/services/firebaseService';
import { GripVertical, Star } from 'lucide-react';

interface SortableItemProps {
    car: Car;
}

const SortableCarCard: React.FC<SortableItemProps> = ({ car }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: car.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex gap-4 items-center group"
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-[#00aed9]">
                <GripVertical size={20} />
            </div>

            <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-800">
                <img src={optimizeImage(car.img, 100)} className="w-full h-full object-cover" alt={car.name} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate text-sm">{car.name}</div>
                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{car.type}</div>
            </div>

            <div className="text-sm font-black text-[#00aed9]">
                ${car.price.toLocaleString()}
            </div>
        </div>
    );
};

export const SortableInventory: React.FC<{
    inventory: Car[],
    onReorder: (newOrder: Car[]) => void
}> = ({ inventory, onReorder }) => {
    const [items, setItems] = useState(inventory);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex(item => item.id === active.id);
            const newIndex = items.findIndex(item => item.id === over.id);

            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);
            onReorder(newItems);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Star className="text-amber-500 fill-amber-500" size={16} />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Orden de Unidades Destacadas</h3>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map(i => i.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 gap-3">
                        {items.map(car => (
                            <SortableCarCard key={car.id} car={car} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {items.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-500 text-sm">
                    No hay unidades destacadas seleccionadas.
                </div>
            )}
        </div>
    );
};
