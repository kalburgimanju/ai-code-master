import { useState } from 'react';
import type { AIEmployee, WizardStep } from '../types';
import { createAgent } from '../utils/agentApi';

interface AgentFormData {
  name: string;
  role: string;
  department: string;
  systemPrompt: string;
  knowledgeBase: string;
}

const initialFormData: AgentFormData = {
  name: '',
  role: '',
  department: '',
  systemPrompt: '',
  knowledgeBase: '',
};

export function useAgent() {
  const [step, setStep] = useState<WizardStep>('role');
  const [formData, setFormData] = useState<AgentFormData>(initialFormData);
  const [isCreating, setIsCreating] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<AIEmployee | null>(null);
  const [error, setError] = useState('');

  const updateForm = (field: keyof AgentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = (): boolean => {
    if (step === 'role') return formData.name.trim().length > 0;
    if (step === 'prompt') return formData.systemPrompt.trim().length > 10;
    return true;
  };

  const nextStep = () => {
    if (!canProceed()) return;
    if (step === 'role') setStep('prompt');
    else if (step === 'prompt') setStep('knowledge');
    else if (step === 'knowledge') setStep('launch');
  };

  const prevStep = () => {
    if (step === 'prompt') setStep('role');
    else if (step === 'knowledge') setStep('prompt');
    else if (step === 'launch') setStep('knowledge');
  };

  const launchAgent = async () => {
    setIsCreating(true);
    setError('');
    try {
      const agent = await createAgent(formData);
      setCreatedAgent(agent);
      setStep('launch');
    } catch {
      setError('Failed to create agent. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const reset = () => {
    setStep('role');
    setFormData(initialFormData);
    setCreatedAgent(null);
    setIsCreating(false);
    setError('');
  };

  return {
    step,
    formData,
    isCreating,
    createdAgent,
    error,
    updateForm,
    canProceed,
    nextStep,
    prevStep,
    launchAgent,
    reset,
  };
}
