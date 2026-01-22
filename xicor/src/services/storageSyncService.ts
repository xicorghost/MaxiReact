// services/storageSyncService.ts (SOLO SINCRONIZA DATOS, NO SESIONES)

type SyncCallback = () => void;

class StorageSyncService {
    private static listeners: Set<SyncCallback> = new Set();
    private static isListening = false;

    /**
     * Inicia la escucha de cambios en localStorage
     */
    static startListening(): void {
        if (this.isListening) return;

        window.addEventListener('storage', this.handleStorageChange);
        
        // También escuchar eventos personalizados en la misma pestaña
        window.addEventListener('localDataChange', this.handleLocalChange);
        
        this.isListening = true;
        console.log('🔄 Sincronización de DATOS entre pestañas activada');
    }

    /**
     * Detiene la escucha de cambios
     */
    static stopListening(): void {
        window.removeEventListener('storage', this.handleStorageChange);
        window.removeEventListener('localDataChange', this.handleLocalChange);
        this.isListening = false;
        console.log('⏹️ Sincronización de datos desactivada');
    }

    /**
     * Maneja los cambios en localStorage desde OTRAS pestañas
     */
    private static handleStorageChange = (e: StorageEvent) => {
        // ⚠️ IMPORTANTE: Solo sincronizar DATOS, NO sesiones
        const dataKeys = [
            'usuarios',      // Lista de usuarios (datos)
            'productos',     // Productos
            'pedidos',       // Pedidos
            'categorias'     // Categorías
        ];

        // NO incluir 'usuarioActual' ni 'jwt_token' (están en sessionStorage ahora)

        if (e.key && dataKeys.includes(e.key)) {
            console.log('🔄 Datos actualizados en otra pestaña:', e.key);
            this.notifyListeners();
        }
    };

    /**
     * Maneja cambios en la misma pestaña
     */
    private static handleLocalChange = () => {
        console.log('🔄 Datos actualizados en esta pestaña');
        this.notifyListeners();
    };

    /**
     * Registra un callback para ser notificado de cambios
     */
    static subscribe(callback: SyncCallback): () => void {
        this.listeners.add(callback);

        // Retornar función para desuscribirse
        return () => {
            this.listeners.delete(callback);
        };
    }

    /**
     * Notifica a todos los listeners registrados
     */
    private static notifyListeners(): void {
        this.listeners.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error al ejecutar callback de sincronización:', error);
            }
        });
    }

    /**
     * Fuerza la sincronización manual (para la misma pestaña)
     */
    static triggerSync(): void {
        // Disparar evento para la misma pestaña
        window.dispatchEvent(new CustomEvent('localDataChange'));
    }
}

export default StorageSyncService;