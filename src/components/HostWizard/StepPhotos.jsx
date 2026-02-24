import { ImagePlus, X } from 'lucide-react';
import { useCallback } from 'react';

export function StepPhotos({ data, updateData }) {

    // Handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const currentCount = data.images.length;
            const remaining = 5 - currentCount;
            if (remaining <= 0) {
                alert('El máximo de fotos permitido es 5');
                return;
            }
            const newFiles = files.slice(0, remaining);
            updateData({ images: [...data.images, ...newFiles] });
        }
    };

    const removeImage = (index) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        updateData({ images: newImages });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-2 text-gray-900">Agrega algunas fotos de tu alojamiento</h2>
            <p className="text-gray-500 mb-8">Puedes subir hasta un máximo de 5 fotos para mostrar lo mejor de tu espacio.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Upload Button */}
                <div className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition relative">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <ImagePlus size={48} className="text-gray-400 mb-2" />
                    <span className="font-semibold text-gray-700">Subir fotos</span>
                    <span className="text-sm text-gray-500">JPG, PNG</span>
                </div>

                {/* Image Previews */}
                {data.images.map((file, index) => {
                    const imageUrl = typeof file === 'string' ? file : URL.createObjectURL(file);

                    return (
                        <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden relative group">
                            <img
                                src={imageUrl}
                                alt={`Preview ${index}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:scale-110 transition opacity-0 group-hover:opacity-100"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
