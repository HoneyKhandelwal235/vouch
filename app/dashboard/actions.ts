'use server'
// Simplified actions - no database required
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'

// Mock data for now
export async function getVouches(workspaceId?: string) {
  noStore();
  return [];
}

export async function addVouch(title: string, amount: number, workspaceId?: string) {
  // Mock implementation - just revalidate
  revalidatePath('/');
  return { success: true };
}

export async function toggleLike(expenseId: string) {
  revalidatePath('/');
  return { success: true, likeCount: 0, isLiked: false };
}

export async function getWorkspaces() {
  noStore();
  return [];
}

export async function createWorkspace(name: string, description?: string, color?: string) {
  revalidatePath('/');
  return { id: '1', name, description, color: color || "#4F75FF" };
}
