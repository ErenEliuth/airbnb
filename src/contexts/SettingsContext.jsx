import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

const translations = {
    es: {
        nav: {
            alojamientos: 'Alojamientos',
            experiencias: 'Experiencias',
            servicios: 'Servicios',
            host: 'Conviértete en anfitrión',
            login: 'Inicia sesión',
            signup: 'Regístrate',
            messages: 'Mensajes',
            notifications: 'Notificaciones',
            my_bookings: 'Mis reservas',
            my_listings: 'Mis alojamientos',
            help: 'Ayuda',
            logout: 'Cerrar sesión',
            favorites: 'Listas de favoritos',
            trips: 'Viajes',
            profile: 'Perfil',
            account_settings: 'Configuración de la cuenta',
            language_currency: 'Idiomas y moneda',
            help_center: 'Centro de ayuda',
            invite_host: 'Invita a un anfitrión',
            find_cohost: 'Encuentra un coanfitrión',
        },
        search: {
            where: 'Dónde',
            where_placeholder: 'Explora destinos',
            check_in: 'Llegada',
            check_out: 'Salida',
            who: 'Quién',
            who_placeholder: '¿Cuántos?',
        },
        home: {
            active_filters: 'Filtros activos:',
            city: 'Ciudad',
            guests: 'Huéspedes',
            from: 'Desde',
            to: 'Hasta',
            clear_all: 'Borrar todo',
            no_results: 'No encontramos resultados',
            no_results_desc: 'Intenta ajustar tus filtros o buscar en otra ubicación.',
            view_all: 'Ver todos los alojamientos',
            no_listings: 'No hay alojamientos aún',
            be_first: '¡Sé el primero en publicar tu espacio!',
        },
        listing: {
            night: 'noche',
            guest_favorite: 'Favorito entre huéspedes',
            hosted_by: 'Anfitrión:',
            amenities: 'Lo que ofrece este lugar',
            no_amenities: 'No hay servicios especificados.',
            availability: 'Disponibilidad en',
            nights_in: 'noches en',
            available_from: 'Disponible:',
            select_dates: 'Selecciona las fechas',
            clear_dates: 'Borrar fechas',
            reserve: 'Reservar',
            no_charge: 'No se te cobrará nada aún',
            report: 'Denunciar este anuncio',
            reviews: 'reseñas',
            location_title: 'A dónde irás',
            approx_location: 'Ubicación aproximada',
        },
        profile: {
            title: 'Perfil',
            about_me: 'Información sobre mí',
            aloja: 'Alojamientos',
            connections: 'Conexiones',
            edit: 'Editar',
            guest: 'Huésped',
            complete_profile: 'Completa tu perfil',
            complete_desc: 'Tu perfil en Airbnb es una parte importante de todas las reservaciones. Completa el tuyo para que los demás anfitriones y huéspedes te conozcan mejor.',
            let_start: 'Comencemos',
            reviews_by_me: 'Reseñas escritas por mí',
            no_reviews: 'Aún no has escrito reseñas.',
        },
        bookings: {
            no_trips: 'No tienes viajes próximos',
            no_trips_desc: 'Es hora de preparar tus maletas y empezar una nueva aventura.',
            unknown_listing: 'Alojamiento no disponible',
            status: {
                confirmed: 'Confirmada',
                released: 'Cancelada',
                pending: 'Pendiente'
            },
            confirmed_msg: 'Tu reserva está confirmada y lista para tu llegada.',
            cancelled_msg: 'Esta reserva ha sido cancelada o liberada.',
            no_messages: 'No tienes mensajes nuevos',
            no_messages_desc: 'Tus notificaciones y mensajes aparecerán aquí.'
        },
        host: {
            manage_desc: 'Gestiona tus anuncios y llega a más huéspedes alrededor del mundo.',
            delete_confirm: '¿Estás seguro de que quieres eliminar este alojamiento? Esta acción no se puede deshacer.',
            delete_success: 'Alojamiento eliminado correctamente.',
            create_new: 'Crear nuevo alojamiento',
            create_first: 'Crear mi primer anuncio',
            no_listings: 'No tienes alojamientos publicados',
            earn_money: '¡Comienza a ganar dinero compartiendo tu espacio!',
        },
        settings: {
            language_region: 'Idioma y región',
            currency: 'Moneda',
            suggested_languages: 'Idiomas y regiones sugeridos',
            select_currency: 'Selecciona una moneda',
        }
    },
    en: {
        nav: {
            alojamientos: 'Accommodations',
            experiencias: 'Experiences',
            servicios: 'Services',
            host: 'Become a host',
            login: 'Log in',
            signup: 'Sign up',
            messages: 'Messages',
            notifications: 'Notifications',
            my_bookings: 'My bookings',
            my_listings: 'My listings',
            help: 'Help',
            logout: 'Log out',
            favorites: 'Wishlists',
            trips: 'Trips',
            profile: 'Profile',
            account_settings: 'Account settings',
            language_currency: 'Language and currency',
            help_center: 'Help Center',
            invite_host: 'Invite a host',
            find_cohost: 'Find a co-host',
        },
        search: {
            where: 'Where',
            where_placeholder: 'Search destinations',
            check_in: 'Check in',
            check_out: 'Check out',
            who: 'Who',
            who_placeholder: 'Add guests',
        },
        home: {
            active_filters: 'Active filters:',
            city: 'City',
            guests: 'Guests',
            from: 'From',
            to: 'To',
            clear_all: 'Clear all',
            no_results: 'No results found',
            no_results_desc: 'Try adjusting your filters or search in another location.',
            view_all: 'View all accommodations',
            no_listings: 'No accommodations yet',
            be_first: 'Be the first to post your space!',
        },
        listing: {
            night: 'night',
            guest_favorite: 'Guest favorite',
            hosted_by: 'Host:',
            amenities: 'What this place offers',
            no_amenities: 'No specified amenities.',
            availability: 'Availability in',
            nights_in: 'nights in',
            available_from: 'Available:',
            select_dates: 'Select dates',
            clear_dates: 'Clear dates',
            reserve: 'Reserve',
            no_charge: 'You won\'t be charged yet',
            report: 'Report this listing',
            reviews: 'reviews',
            location_title: 'Where you\'ll be',
            approx_location: 'Approximate location',
        },
        profile: {
            title: 'Profile',
            about_me: 'About me',
            aloja: 'Accommodations',
            connections: 'Connections',
            edit: 'Edit',
            guest: 'Guest',
            complete_profile: 'Complete your profile',
            complete_desc: 'Your Airbnb profile is an important part of every booking. Complete yours so other hosts and guests can get to know you better.',
            let_start: 'Let\'s start',
            reviews_by_me: 'Reviews written by me',
            no_reviews: 'You haven\'t written any reviews yet.',
        },
        bookings: {
            no_trips: 'No upcoming trips',
            no_trips_desc: 'It\'s time to pack your bags and start a new adventure.',
            unknown_listing: 'Listing unavailable',
            status: {
                confirmed: 'Confirmed',
                released: 'Cancelled',
                pending: 'Pending'
            },
            confirmed_msg: 'Your booking is confirmed and ready for your arrival.',
            cancelled_msg: 'This booking has been cancelled or released.',
            no_messages: 'No new messages',
            no_messages_desc: 'Your notifications and messages will appear here.'
        },
        host: {
            manage_desc: 'Manage your listings and reach more guests around the world.',
            delete_confirm: 'Are you sure you want to delete this accommodation? This action cannot be undone.',
            delete_success: 'Accommodation successfully deleted.',
            create_new: 'Create new listing',
            create_first: 'Create my first listing',
            no_listings: 'You have no listings published',
            earn_money: 'Start earning money by sharing your space!',
        },
        settings: {
            language_region: 'Language and region',
            currency: 'Currency',
            suggested_languages: 'Suggested languages and regions',
            select_currency: 'Select a currency',
        }
    },
    fr: {
        nav: {
            alojamientos: 'Logements',
            experiencias: 'Expériences',
            servicios: 'Services',
            host: 'Devenir hôte',
            login: 'Connexion',
            signup: 'Inscription',
            messages: 'Messages',
            notifications: 'Notifications',
            my_bookings: 'Mes réservations',
            my_listings: 'Mes logements',
            help: 'Aide',
            logout: 'Déconnexion',
            favorites: 'Favoris',
            trips: 'Voyages',
            profile: 'Profil',
            account_settings: 'Paramètres du compte',
            language_currency: 'Langue et devise',
            help_center: 'Centre d\'aide',
            invite_host: 'Inviter un hôte',
            find_cohost: 'Trouver un co-hôte',
        },
        search: {
            where: 'Où',
            where_placeholder: 'Rechercher des destinations',
            check_in: 'Arrivée',
            check_out: 'Départ',
            who: 'Qui',
            who_placeholder: 'Ajouter des voyageurs',
        },
        home: {
            active_filters: 'Filtres actifs:',
            city: 'Ville',
            guests: 'Voyageurs',
            from: 'Du',
            to: 'Au',
            clear_all: 'Tout effacer',
            no_results: 'Aucun résultat trouvé',
            no_results_desc: 'Essayez de modifier vos filtres ou effectuez une autre recherche.',
            view_all: 'Voir tous les logements',
            no_listings: 'Pas encore de logements',
            be_first: 'Soyez le premier à publier votre annonce!',
        },
        listing: {
            night: 'nuit',
            guest_favorite: 'Coup de cœur voyageurs',
            hosted_by: 'Hôte :',
            amenities: 'Ce que propose ce logement',
            no_amenities: 'Équipements non spécifiés.',
            availability: 'Disponibilité à',
            nights_in: 'nuits à',
            available_from: 'Disponible :',
            select_dates: 'Sélectionnez les dates',
            clear_dates: 'Effacer les dates',
            reserve: 'Réserver',
            no_charge: 'Aucun montant ne vous sera débité pour le moment',
            report: 'Signaler cette annonce',
            reviews: 'commentaires',
            location_title: 'Où vous irez',
            approx_location: 'Emplacement approximatif',
        },
        profile: {
            title: 'Profil',
            about_me: 'À propos de moi',
            aloja: 'Logements',
            connections: 'Connexions',
            edit: 'Modifier',
            guest: 'Voyageur',
            complete_profile: 'Complétez votre profil',
            complete_desc: 'Votre profil Airbnb est une partie importante de chaque réservation. Complétez le vôtre pour que les autres hôtes et voyageurs apprennent à mieux vous connaître.',
            let_start: 'Commençons',
            reviews_by_me: 'Commentaires écrits par moi',
            no_reviews: 'Vous n\'avez pas encore écrit de commentaires.',
        },
        bookings: {
            no_trips: 'Pas de voyages à venir',
            no_trips_desc: 'Il est temps de faire vos valises et de commencer une nouvelle aventure.',
            unknown_listing: 'Logement indisponible',
            status: {
                confirmed: 'Confirmée',
                released: 'Annulée',
                pending: 'En attente'
            },
            confirmed_msg: 'Votre réservation est confirmée et prête pour votre arrivée.',
            cancelled_msg: 'Cette réservation a été annulée ou libérée.',
            no_messages: 'Pas de nouveaux messages',
            no_messages_desc: 'Vos notifications et messages apparaîtront ici.'
        },
        host: {
            manage_desc: 'Gérez vos annonces et touchez plus de voyageurs dans le monde entier.',
            delete_confirm: 'Êtes-vous sûr de vouloir supprimer ce logement ? Cette action est irréversible.',
            delete_success: 'Logement supprimé avec succès.',
            create_new: 'Créer une nouvelle annonce',
            create_first: 'Créer ma première annonce',
            no_listings: 'Vous n\'avez aucune annonce publiée',
            earn_money: 'Commencez à gagner de l\'argent en partageant votre espace !',
        },
        settings: {
            language_region: 'Langue et région',
            currency: 'Devise',
            suggested_languages: 'Langues et régions suggérées',
            select_currency: 'Sélectionnez une devise',
        }
    }
};

const exchangeRates = {
    COP: 1,
    USD: 0.00025, // 1 COP = 0.00025 USD (approx)
    EUR: 0.00023, // 1 COP = 0.00023 EUR (approx)
};

const currencySymbols = {
    COP: '$',
    USD: '$',
    EUR: '€',
};

export function SettingsProvider({ children }) {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'es');
    const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'COP');
    const [activeTab, setActiveTab] = useState('alojamientos');

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    const t = (path) => {
        const keys = path.split('.');
        let result = translations[language];
        for (const key of keys) {
            if (result[key] === undefined) return path;
            result = result[key];
        }
        return result;
    };

    const formatPrice = (priceInCop) => {
        const converted = priceInCop * exchangeRates[currency];
        const symbol = currencySymbols[currency];

        if (currency === 'COP') {
            return `${symbol}${converted.toLocaleString('es-CO')} COP`;
        } else if (currency === 'USD') {
            return `${symbol}${converted.toLocaleString('en-US')} USD`;
        } else {
            return `${converted.toLocaleString('de-DE')} ${symbol} EUR`;
        }
    };

    return (
        <SettingsContext.Provider value={{ language, setLanguage, currency, setCurrency, t, formatPrice, activeTab, setActiveTab }}>
            {children}
        </SettingsContext.Provider>
    );
}
