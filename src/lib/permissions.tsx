// ============================================================
// PERMISSIONS HOOK & UTILITIES - FinanceAdvisor V4
// ============================================================

import React from 'react';
import { userHasPermission, getRolePermissions } from './data';

// Rôle de l'utilisateur connecté (à remplacer par la session réelle)
let currentUserRole: string = 'ADMIN';

// Définir le rôle de l'utilisateur actuel
export function setCurrentUserRole(role: string) {
  currentUserRole = role;
}

// Récupérer le rôle de l'utilisateur actuel
export function getCurrentUserRole(): string {
  return currentUserRole;
}

// Hook simulé pour vérifier une permission
export function usePermission(permission: string): boolean {
  return userHasPermission(currentUserRole, permission);
}

// Hook simulé pour vérifier plusieurs permissions
export function usePermissions(permissions: string[]): Record<string, boolean> {
  const userPerms = getRolePermissions(currentUserRole);
  const result: Record<string, boolean> = {};
  for (const perm of permissions) {
    result[perm] = userPerms.includes(perm);
  }
  return result;
}

// Hook simulé pour vérifier si l'utilisateur a au moins une des permissions
export function useHasAnyPermission(permissions: string[]): boolean {
  const userPerms = getRolePermissions(currentUserRole);
  return permissions.some(p => userPerms.includes(p));
}

// Hook simulé pour vérifier si l'utilisateur a toutes les permissions
export function useHasAllPermissions(permissions: string[]): boolean {
  const userPerms = getRolePermissions(currentUserRole);
  return permissions.every(p => userPerms.includes(p));
}

// Vérifier l'accès à un module
export function canAccessModule(module: string): boolean {
  return userHasPermission(currentUserRole, `${module}:lecture`);
}

// Vérifier une action sur un module
export function canPerformAction(module: string, action: string): boolean {
  return userHasPermission(currentUserRole, `${module}:${action}`);
}

// Obtenir toutes les permissions de l'utilisateur actuel
export function getCurrentUserPermissions(): string[] {
  return getRolePermissions(currentUserRole);
}

// Vérifier si l'utilisateur peut gérer les rôles
export function canManageRoles(): boolean {
  return userHasPermission(currentUserRole, 'utilisateurs:parametrage') ||
         userHasPermission(currentUserRole, 'utilisateurs:modification');
}

// Constantes des permissions pour faciliter l'utilisation
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_READ: 'dashboard:lecture',
  
  // Documents
  DOCUMENTS_READ: 'documents:lecture',
  DOCUMENTS_CREATE: 'documents:saisie',
  DOCUMENTS_EDIT: 'documents:modification',
  DOCUMENTS_VALIDATE: 'documents:validation',
  DOCUMENTS_EXPORT: 'documents:export',
  
  // Banque
  BANQUE_READ: 'banque:lecture',
  BANQUE_CREATE: 'banque:saisie',
  BANQUE_EDIT: 'banque:modification',
  BANQUE_VALIDATE: 'banque:validation',
  BANQUE_CORRECT: 'banque:correction',
  BANQUE_EXPORT: 'banque:export',
  
  // Trésorerie
  TRESORERIE_READ: 'tresorerie:lecture',
  TRESORERIE_CREATE: 'tresorerie:saisie',
  TRESORERIE_EDIT: 'tresorerie:modification',
  TRESORERIE_VALIDATE: 'tresorerie:validation',
  TRESORERIE_EXPORT: 'tresorerie:export',
  
  // Recouvrement
  RECOUVREMENT_READ: 'recouvrement:lecture',
  RECOUVREMENT_CREATE: 'recouvrement:saisie',
  RECOUVREMENT_EDIT: 'recouvrement:modification',
  RECOUVREMENT_VALIDATE: 'recouvrement:validation',
  RECOUVREMENT_EXPORT: 'recouvrement:export',
  
  // Audit
  AUDIT_READ: 'audit:lecture',
  AUDIT_EDIT: 'audit:modification',
  AUDIT_VALIDATE: 'audit:validation',
  AUDIT_CORRECT: 'audit:correction',
  AUDIT_EXPORT: 'audit:export',
  
  // Fiscalité
  FISCALITE_READ: 'fiscalite:lecture',
  FISCALITE_CREATE: 'fiscalite:saisie',
  FISCALITE_EDIT: 'fiscalite:modification',
  FISCALITE_VALIDATE: 'fiscalite:validation',
  FISCALITE_EXPORT: 'fiscalite:export',
  
  // Analytique
  ANALYTIQUE_READ: 'analytique:lecture',
  ANALYTIQUE_CREATE: 'analytique:saisie',
  ANALYTIQUE_EDIT: 'analytique:modification',
  ANALYTIQUE_EXPORT: 'analytique:export',
  
  // Clôtures
  CLOTURES_READ: 'clotures:lecture',
  CLOTURES_CREATE: 'clotures:saisie',
  CLOTURES_EDIT: 'clotures:modification',
  CLOTURES_VALIDATE: 'clotures:validation',
  CLOTURES_CLOSE: 'clotures:cloture',
  CLOTURES_EXPORT: 'clotures:export',
  
  // DSF
  DSF_READ: 'dsf:lecture',
  DSF_CREATE: 'dsf:saisie',
  DSF_EDIT: 'dsf:modification',
  DSF_VALIDATE: 'dsf:validation',
  DSF_CLOSE: 'dsf:cloture',
  DSF_EXPORT: 'dsf:export',
  
  // Agent IA
  IA_READ: 'agent_ia:lecture',
  IA_ACCESS: 'agent_ia:acces_ia',
  
  // Paramétrage
  PARAM_READ: 'parametrage:lecture',
  PARAM_CREATE: 'parametrage:saisie',
  PARAM_EDIT: 'parametrage:modification',
  PARAM_ADMIN: 'parametrage:parametrage',
  
  // Historique
  HISTORIQUE_READ: 'historique:lecture',
  HISTORIQUE_ACCESS: 'historique:historique',
  HISTORIQUE_EXPORT: 'historique:export',
  
  // Utilisateurs & Rôles
  USERS_READ: 'utilisateurs:lecture',
  USERS_CREATE: 'utilisateurs:saisie',
  USERS_EDIT: 'utilisateurs:modification',
  USERS_VALIDATE: 'utilisateurs:validation',
  USERS_ADMIN: 'utilisateurs:parametrage',
} as const;

// Composant pour conditionner l'affichage selon les permissions
export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (permission) {
    if (!userHasPermission(currentUserRole, permission)) {
      return <>{fallback}</>;
    }
  }
  
  if (permissions && permissions.length > 0) {
    if (requireAll) {
      if (!permissions.every(p => userHasPermission(currentUserRole, p))) {
        return <>{fallback}</>;
      }
    } else {
      if (!permissions.some(p => userHasPermission(currentUserRole, p))) {
        return <>{fallback}</>;
      }
    }
  }
  
  return <>{children}</>;
}
