import { X, ChevronLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// Cache-busting version: 1.0.2
function Toast({ message, type, onClose }) {
    const colors = {
        success: 'bg-white border-green-500 text-green-900 shadow-[0_20px_40px_rgba(34,197,94,0.15)]',
        error: 'bg-white border-red-500 text-red-900 shadow-[0_20px_40px_rgba(239,68,68,0.15)]',
        warning: 'bg-white border-amber-500 text-amber-900 shadow-[0_20px_40px_rgba(245,158,11,0.15)]',
    };
    const Icon = type === 'success' ? CheckCircle2 : (type === 'error' ? X : AlertCircle);
    const iconWrapperColor = type === 'success' ? 'bg-green-500 text-white' : (type === 'error' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white');

    return (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-4 border-2 rounded-3xl px-6 py-5 min-w-[340px] animate-in slide-in-from-top-12 fade-in duration-500 ${colors[type]}`}>
            <div className={`p-2.5 rounded-2xl shadow-lg ${iconWrapperColor}`}>
                <Icon size={24} strokeWidth={3} />
            </div>
            <div className="flex flex-col flex-1">
                <span className="text-[15px] font-black leading-tight">{type === 'success' ? '¡Excelente!' : 'Atención'}</span>
                <p className="text-[13px] font-medium opacity-80">{message}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-all active:scale-90">
                <X size={18} />
            </button>
        </div>
    );
}

// Steps
import { StepCategory } from './StepCategory';
import { StepPropertyType } from './StepPropertyType';
import { StepRoomType } from './StepRoomType';
import { StepLocation } from './StepLocation';
import { StepAmenities } from './StepAmenities';
import { StepPhotos } from './StepPhotos';
import { StepDetails } from './StepDetails';
import { StepAvailability } from './StepAvailability';

// Wizard Steps logic
const STEPS = [
    { id: 'category', component: StepCategory },
    { id: 'property_type', component: StepPropertyType },
    { id: 'room_type', component: StepRoomType },
    { id: 'location', component: StepLocation },
    { id: 'amenities', component: StepAmenities },
    { id: 'photos', component: StepPhotos },
    { id: 'details', component: StepDetails },
    { id: 'availability', component: StepAvailability },
];

export function WizardModal({ isOpen, onClose }) {
    const { user } = useAuth();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        if (type !== 'error') {
            setTimeout(() => setToast(null), 4000);
        }
    };

    // Form Data State
    const [formData, setFormData] = useState({
        category: '',
        property_type: '',
        room_type: '',
        city: '',
        location: '',
        amenities: [],
        images: [], // Will store File objects initially, then URLs
        title: '',
        description: '',
        price: '',
        available_from: '',
        available_to: '',
        lat: null,
        lng: null,
        max_guests: 1,
    });

    if (!isOpen) return null;

    const CurrentStepComponent = STEPS[currentStepIndex].component;
    const isLastStep = currentStepIndex === STEPS.length - 1;

    // Helper to update form data
    const updateData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const handleNext = async () => {
        const currentStepId = STEPS[currentStepIndex].id;

        // Validation for Step Details (Price)
        if (currentStepId === 'details') {
            if (!formData.price || parseFloat(formData.price) <= 0) {
                showToast('Por favor ingresa un precio válido por noche.', 'warning');
                return;
            }
            if (!formData.title.trim()) {
                showToast('Por favor ingresa un título para tu anuncio.', 'warning');
                return;
            }
        }

        // Validation for Step Availability
        if (currentStepId === 'availability') {
            if (!formData.available_from || !formData.available_to) {
                showToast('Por favor selecciona las fechas de disponibilidad.', 'warning');
                return;
            }
            if (new Date(formData.available_to) < new Date(formData.available_from)) {
                showToast('La fecha de fin no puede ser anterior a la fecha de inicio.', 'warning');
                return;
            }
        }

        if (isLastStep) {
            await handleSubmit();
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // 1. Upload Images
            const imageUrls = [];
            for (const file of formData.images) {
                // If it's already a URL (string), skip upload
                if (typeof file === 'string') {
                    imageUrls.push(file);
                    continue;
                }

                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('listings')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('listings')
                    .getPublicUrl(filePath);

                imageUrls.push(publicUrl);
            }

            // 2. Insert Listing into Supabase
            const { error: insertError } = await supabase
                .from('listings')
                .insert([{
                    host_id: user.id,
                    host_email: user.email,          // ← para mostrar nombre del anfitrión
                    category: formData.category,
                    property_type: formData.property_type,
                    room_type: formData.room_type,
                    city: formData.city,
                    location: formData.location,
                    amenities: formData.amenities,
                    images: imageUrls,
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    available_from: formData.available_from || null,
                    available_to: formData.available_to || null,
                    lat: formData.lat,
                    lng: formData.lng,
                    max_guests: formData.max_guests || 1,
                }]);

            if (insertError) throw insertError;

            // Dispatch event for other components to refresh (e.g., Home, Profile)
            window.dispatchEvent(new CustomEvent('listing-created'));

            showToast('¡Alojamiento creado exitosamente!', 'success');

            // Wait a bit for the toast to be seen before closing
            setTimeout(() => {
                onClose();
                // Reset form
                setFormData({
                    category: '', property_type: '', room_type: '', city: '', location: '',
                    amenities: [], images: [], title: '', description: '', price: '',
                    available_from: '', available_to: '',
                    lat: null, lng: null, max_guests: 1
                });
                setCurrentStepIndex(0);
            }, 1500);

        } catch (error) {
            console.error('Error creating listing:', error);
            showToast('Error al crear el alojamiento: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 sm:p-4">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="bg-white sm:rounded-xl w-full max-w-4xl h-full sm:h-[80vh] flex flex-col overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300">

                {/* Header */}
                <header className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={20} />
                    </button>
                    <div className="font-bold text-lg text-gray-900">Conviértete en anfitrión</div>
                    <div className="w-9" /> {/* Spacer */}
                </header>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-1">
                    <div
                        className="bg-black h-1 transition-all duration-300"
                        style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
                    />
                </div>

                {/* Body */}
                <main className="flex-1 overflow-y-auto px-6 py-8">
                    <CurrentStepComponent
                        data={formData}
                        updateData={updateData}
                    />
                </main>

                {/* Footer */}
                <footer
                    className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white"
                    style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
                >
                    <button
                        onClick={handleBack}
                        disabled={currentStepIndex === 0}
                        className={`text-sm font-semibold underline px-4 py-2 rounded-md hover:bg-gray-100 transition ${currentStepIndex === 0 ? 'invisible' : ''}`}
                    >
                        Atrás
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold px-8 py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Guardando...' : isLastStep ? 'Publicar anuncio' : 'Siguiente'}
                    </button>
                </footer>
            </div>
        </div>
    );
}
