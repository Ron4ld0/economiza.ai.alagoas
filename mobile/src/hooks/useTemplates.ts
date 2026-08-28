import { useQuery, useMutation } from '@tanstack/react-query';
import Constants from 'expo-constants';

export interface Template {
  id: string;
  name: string;
  category: string;
}

export interface CalculatedItem {
  name: string;
  calculated_qty: number;
  unit: string;
  required: boolean;
}

export interface CalculatedTemplate {
  template_id: string;
  template_name: string;
  category: string;
  people: number;
  items: CalculatedItem[];
}

const getApiUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const ip = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
  return `http://${ip}:8000/api/v1`;
};

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/templates`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useCalculateTemplate() {
  return useMutation({
    mutationFn: async ({ templateId, people }: { templateId: string; people: number }) => {
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/templates/${templateId}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ people }),
      });
      if (!response.ok) throw new Error('Failed to calculate template');
      return response.json();
    },
  });
}
