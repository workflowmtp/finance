'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ModuleTabs } from '@/components/ui';
import {
  getAllRolesWithCustom,
  getPermissionsModules,
  getRolePermissions,
  getRolePermissionsByModule,
  createRole,
  updateRole,
  deleteRole,
  getAssignablePermissions,
  SYSTEM_ROLES,
} from '@/lib/data';

const TABS = [
  { id: 'utilisateurs', label: 'Utilisateurs', icon: 'Utilisateurs', href: '/parametrage' },
  { id: 'banques', label: 'Banques', icon: 'Banques', href: '/parametrage/banques' },
  { id: 'tiers', label: 'Tiers', icon: 'Tiers', href: '/parametrage/tiers' },
  { id: 'journaux', label: 'Journaux', icon: 'Journaux', href: '/parametrage/journaux' },
  { id: 'regles', label: 'Règles', icon: 'Règles', href: '/parametrage/regles' },
  { id: 'ia', label: 'Config IA', icon: 'IA', href: '/parametrage/ia' },
];

// Rôle simulé de l'utilisateur connecté (à remplacer par session réelle)
const CURRENT_USER_ROLE = 'ADMIN';

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState(getAllRolesWithCustom());
  const [modules] = useState(getPermissionsModules());
  const [assignablePerms] = useState(getAssignablePermissions(CURRENT_USER_ROLE));

  // État du modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRole, setSelectedRole] = useState<any>(null);

  // Formulaire
  const [formCode, setFormCode] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formNiveau, setFormNiveau] = useState('Opérationnel');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Ouvrir modal création
  const openCreateModal = () => {
    setModalMode('create');
    setFormCode('');
    setFormLabel('');
    setFormNiveau('Opérationnel');
    setFormPermissions([]);
    setFormError('');
    setShowModal(true);
  };

  // Ouvrir modal édition
  const openEditModal = (role: any) => {
    if (SYSTEM_ROLES.includes(role.code)) {
      alert('Les rôles système ne peuvent pas être modifiés');
      return;
    }
    setModalMode('edit');
    setSelectedRole(role);
    setFormCode(role.code);
    setFormLabel(role.label);
    setFormNiveau(role.niveau || 'Opérationnel');
    setFormPermissions(role.permissions || getRolePermissions(role.code));
    setFormError('');
    setShowModal(true);
  };

  // Toggle permission
  const togglePermission = (perm: string) => {
    if (!assignablePerms.includes(perm)) {
      return; // L'utilisateur ne peut pas assigner cette permission
    }
    setFormPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  // Toggle toutes les permissions d'un module
  const toggleModulePermissions = (moduleId: string, actions: string[]) => {
    const perms = actions.map(a => `${moduleId}:${a}`).filter(p => assignablePerms.includes(p));
    const allSelected = perms.every(p => formPermissions.includes(p));

    if (allSelected) {
      // Désélectionner toutes
      setFormPermissions(prev => prev.filter(p => !perms.includes(p)));
    } else {
      // Sélectionner toutes
      setFormPermissions(prev => [...new Set([...prev, ...perms])]);
    }
  };

  // Soumettre le formulaire
  const handleSubmit = () => {
    if (!formCode || !formLabel) {
      setFormError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (modalMode === 'create') {
      const result = createRole(formCode, formLabel, formNiveau, formPermissions, CURRENT_USER_ROLE);
      if (result.success) {
        setRoles(getAllRolesWithCustom());
        setShowModal(false);
      } else {
        setFormError(result.error || 'Erreur lors de la création');
      }
    } else {
      const result = updateRole(formCode, formLabel, formNiveau, formPermissions, CURRENT_USER_ROLE);
      if (result.success) {
        setRoles(getAllRolesWithCustom());
        setShowModal(false);
      } else {
        setFormError(result.error || 'Erreur lors de la modification');
      }
    }
  };

  // Supprimer un rôle
  const handleDelete = (role: any) => {
    if (SYSTEM_ROLES.includes(role.code)) {
      alert('Les rôles système ne peuvent pas être supprimés');
      return;
    }

    if (confirm(`Supprimer le rôle "${role.label}" ?`)) {
      const result = deleteRole(role.code);
      if (result.success) {
        setRoles(getAllRolesWithCustom());
      } else {
        alert(result.error);
      }
    }
  };

  return (
    <div>
      <PageHeader
        breadcrumb="Paramétrage  Rôles & Permissions"
        title="Gestion des Rôles"
        subtitle={`${roles.length} rôles  ${roles.filter((r: any) => r.isCustom).length} personnalisés`}
        actions={
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            + Nouveau rôle
          </button>
        }
      />
      <ModuleTabs tabs={TABS} activeId="utilisateurs" />

      {/* Liste des rôles */}
      <div className="data-table-wrapper mb-5">
        <div className="data-table-header">
          <span className="data-table-title">Rôles</span>
          <span className="data-table-count">{roles.length}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Libellé</th>
              <th>Niveau</th>
              <th>Type</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role: any) => {
              const perms = role.permissions || getRolePermissions(role.code);
              const isSystem = SYSTEM_ROLES.includes(role.code);
              return (
                <tr key={role.code}>
                  <td className="font-mono text-xs">{role.code}</td>
                  <td className="fw-600">{role.label}</td>
                  <td className="text-xs text-muted">{role.niveau || 'Opérationnel'}</td>
                  <td>
                    <span className={`badge ${isSystem ? 'badge-attente' : 'badge-en-cours'}`}>
                      {isSystem ? 'Système' : 'Personnalisé'}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-xs" style={{ color: 'var(--primary)' }}>
                      {perms.length} permissions
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => openEditModal(role)}
                        style={{ opacity: isSystem ? 0.5 : 1 }}
                        disabled={isSystem}
                      >
                        Modifier
                      </button>
                      {!isSystem && (
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
                          onClick={() => handleDelete(role)}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Matrice des permissions par module */}
      <div className="widget">
        <div className="widget-header">
          <span className="widget-title">Matrice des permissions par module</span>
        </div>
        <div className="widget-body" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Module</th>
                {roles.map((r: any) => (
                  <th key={r.code} className="text-center text-xs">
                    {r.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((module: any) => (
                <tr key={module.id}>
                  <td className="fw-600 text-sm">{module.label}</td>
                  {roles.map((role: any) => {
                    const rolePerms = role.permissions || getRolePermissions(role.code);
                    const modulePerms = module.actions.filter((a: string) =>
                      rolePerms.includes(`${module.id}:${a}`)
                    );
                    return (
                      <td key={role.code} className="text-center">
                        <span className="font-mono text-xs" style={{ color: 'var(--primary)' }}>
                          {modulePerms.length}/{module.actions.length}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              width: '90%',
              maxWidth: 800,
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="widget-header">
              <span className="widget-title">
                {modalMode === 'create' ? 'Créer un nouveau rôle' : 'Modifier le rôle'}
              </span>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Fermer
              </button>
            </div>

            <div className="widget-body">
              {formError && (
                <div
                  style={{
                    background: 'var(--danger-bg)',
                    border: '1px solid var(--danger)',
                    color: 'var(--danger)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 16,
                  }}
                >
                  {formError}
                </div>
              )}

              {/* Champs du formulaire */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>
                    Code du rôle *
                  </label>
                  <input
                    type="text"
                    className="filter-select"
                    style={{ width: '100%' }}
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/[^A-Z_]/g, ''))}
                    disabled={modalMode === 'edit'}
                    placeholder="ex: CPTA_JR"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>
                    Libellé *
                  </label>
                  <input
                    type="text"
                    className="filter-select"
                    style={{ width: '100%' }}
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    placeholder="ex: Comptable Junior"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>
                  Niveau hiérarchique
                </label>
                <select
                  className="filter-select"
                  style={{ width: 200 }}
                  value={formNiveau}
                  onChange={(e) => setFormNiveau(e.target.value)}
                >
                  <option value="Direction">Direction</option>
                  <option value="Supervision">Supervision</option>
                  <option value="Opérationnel">Opérationnel</option>
                  <option value="Transversal">Transversal</option>
                </select>
              </div>

              {/* Permissions */}
              <div>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 12 }}>
                  Permissions (cochez les permissions à accorder)
                </label>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Seules les permissions que vous possédez peuvent être assignées.
                  Vous avez {assignablePerms.length} permissions assignables.
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  {modules.map((module: any) => {
                    const modulePerms = module.actions.map((a: string) => `${module.id}:${a}`);
                    const assignableModulePerms = modulePerms.filter((p: string) =>
                      assignablePerms.includes(p)
                    );
                    const allSelected = assignableModulePerms.length > 0 &&
                      assignableModulePerms.every((p: string) => formPermissions.includes(p));

                    if (assignableModulePerms.length === 0) return null;

                    return (
                      <div
                        key={module.id}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8,
                            cursor: 'pointer',
                          }}
                          onClick={() => toggleModulePermissions(module.id, module.actions)}
                        >
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => {}}
                          />
                          <span className="fw-600 text-sm">{module.label}</span>
                          <span className="text-xs text-muted">
                            ({assignableModulePerms.length} actions)
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginLeft: 24 }}>
                          {module.actions.map((action: string) => {
                            const perm = `${module.id}:${action}`;
                            const canAssign = assignablePerms.includes(perm);
                            const isGranted = formPermissions.includes(perm);

                            if (!canAssign) return null;

                            return (
                              <label
                                key={action}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  cursor: 'pointer',
                                  fontSize: 12,
                                  padding: '4px 8px',
                                  background: isGranted ? 'var(--primary-bg)' : 'transparent',
                                  border: `1px solid ${isGranted ? 'var(--primary)' : 'var(--border)'}`,
                                  borderRadius: 'var(--radius-sm)',
                                  color: isGranted ? 'var(--primary)' : 'var(--text-secondary)',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isGranted}
                                  onChange={() => togglePermission(perm)}
                                />
                                {action}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  {modalMode === 'create' ? 'Créer le rôle' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
