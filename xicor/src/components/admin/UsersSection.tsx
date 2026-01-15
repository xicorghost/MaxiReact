// components/admin/UsersSection.tsx

import React, { useState } from 'react';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import type { User } from '../../types';
import { UserModal } from '../UserModals';

interface UsersSectionProps {
    users: User[];
    onSave: (user: Omit<User, 'id' | 'fechaRegistro' | 'foto'> | User) => void;
    onDelete: (user: User) => void;
    onViewDetails: (user: User) => void;
}

export const UsersSection: React.FC<UsersSectionProps> = ({
    users,
    onSave,
    onDelete,
    onViewDetails
}) => {
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');
    const [filterRole, setFilterRole] = useState<string>('todos');

    const handleCreateUser = () => {
        setSelectedUser(null);
        setUserModalMode('create');
        setShowUserModal(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setUserModalMode('edit');
        setShowUserModal(true);
    };

    const getRoleBadgeClass = (rol: string): string => {
        switch (rol) {
            case 'admin': return 'bg-danger';
            case 'repartidor': return 'bg-primary';
            case 'cliente': return 'bg-success';
            default: return 'bg-secondary';
        }
    };

    const filteredUsers = filterRole === 'todos'
        ? users
        : users.filter(u => u.rol === filterRole);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Gestión de Usuarios</h2>
                <button className="btn btn-danger" onClick={handleCreateUser}>
                    <Plus size={18} className="me-2" />
                    Registrar Usuario
                </button>
            </div>

            {/* Filtros */}
            <div className="mb-3">
                <button
                    className={`btn btn-sm me-2 ${filterRole === 'todos' ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => setFilterRole('todos')}
                >
                    Todos
                </button>
                <button
                    className={`btn btn-sm me-2 ${filterRole === 'cliente' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setFilterRole('cliente')}
                >
                    Clientes
                </button>
                <button
                    className={`btn btn-sm me-2 ${filterRole === 'repartidor' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilterRole('repartidor')}
                >
                    Repartidores
                </button>
                <button
                    className={`btn btn-sm ${filterRole === 'admin' ? 'btn-warning' : 'btn-outline-warning'}`}
                    onClick={() => setFilterRole('admin')}
                >
                    Administradores
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-hover bg-white">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>RUT</th>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Tipo</th>
                            <th>Fecha Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center text-muted py-4">
                                    No hay usuarios {filterRole !== 'todos' ? `de tipo "${filterRole}"` : ''}
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td><strong>#{user.id}</strong></td>
                                    <td>{user.rut}</td>
                                    <td>
                                        {user.nombre} {user.apellidos}
                                        {user.rol === 'repartidor' && user.disponible !== undefined && (
                                            <span className={`badge ms-2 ${user.disponible ? 'bg-success' : 'bg-secondary'}`}>
                                                {user.disponible ? 'Disponible' : 'Ocupado'}
                                            </span>
                                        )}
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.telefono || 'N/A'}</td>
                                    <td>
                                        <span className={`badge ${getRoleBadgeClass(user.rol)}`}>
                                            {user.rol.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{new Date(user.fechaRegistro).toLocaleDateString('es-CL')}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-info me-1"
                                            onClick={() => onViewDetails(user)}
                                            title="Ver Detalles"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-primary me-1"
                                            onClick={() => handleEditUser(user)}
                                            title="Editar"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => onDelete(user)}
                                            title="Eliminar"
                                            disabled={user.rol === 'admin'}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <UserModal
                show={showUserModal}
                user={selectedUser}
                onClose={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                }}
                onSave={(userData) => {
                    onSave(userData);
                    setShowUserModal(false);
                    setSelectedUser(null);
                }}
                mode={userModalMode}
            />
        </div>
    );
};